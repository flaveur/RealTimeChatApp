import { Document } from "@/app/Document";
import { prefix, render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { setCommonHeaders } from "@/app/headers";
import { setupDb, type DB } from "@/db";

import type { AuthContext } from "better-auth";
import { env } from "cloudflare:workers";
import { authenticationMiddleware } from "./app/middleware/authentication";

import { authService } from "./app/api/auth/authService";
import { LoginDTOSchema, RegisterDTOSchema } from "./app/lib/schema/auth-dtos";
import { Errors } from "./app/types/errors";
import {
  createCookieResponse,
  createErrorResponse,
} from "./app/types/response";

import HomePage from "./app/pages/HomePage";
import LoginPage from "./app/pages/LoginPage";
import MessagesPage from "./app/pages/MessagesPage";
import RegisterPage from "./app/pages/RegisterPage";
import { seedDatabase } from "./db/seed";

export interface Env {
  DB: D1Database;
}

// Extends context with DB + auth
export type AppContext = {
  db: DB;
} & AuthContext;

export default defineApp([
  setCommonHeaders(),

  async function setup({ ctx }) {
    ctx.db = await setupDb(env.DB);
  },

  route("/dev/seed", async () => {
    const result = await seedDatabase(env);
    return Response.json(result);
  }),

  // Dere kan lage en sånn routes fil som inneholder mye av logikken under her. Det kommer til å være mange funksjoner sikkert så fint å holde det enda mer organisert.,
  prefix("/api/v1/auth", [
    route("/login", async (ctx) => {
      try {
        const body = await ctx.request.json();

        const parsed = LoginDTOSchema.safeParse(body);
        if (!parsed.success) {
          return createErrorResponse(
            Errors.VALIDATION_ERROR,
            `Validation failed: ${parsed.error.message}`,
            400
          );
        }

        const credentials = parsed.data;

        const result = await authService.login(credentials);

        if (!result.success) {
          let status = 500;
          switch (result.error.code) {
            case Errors.UNAUTHORIZED:
              status = 401;
              break;
            case Errors.FORBIDDEN:
              status = 403;
              break;
            case Errors.VALIDATION_ERROR:
              status = 400;
              break;
            case Errors.CONFLICT:
              status = 409;
              break;
          }

          return createErrorResponse(
            result.error.code,
            result.error.message,
            status
          );
        }

        return createCookieResponse(result.data.session.id);
      } catch (err) {
        console.error("Login route error:", err);
        return createErrorResponse(
          Errors.INTERNAL_SERVER_ERROR,
          "Kunne ikke logge inn",
          500
        );
      }
    }),

    route("/register", async (ctx) => {
      try {
        const body = await ctx.request.json();

        const parsedData = RegisterDTOSchema.safeParse(body);
        if (!parsedData.success) {
          return createErrorResponse(
            Errors.VALIDATION_ERROR,
            `Validation failed: ${parsedData.error.message}`,
            400
          );
        }

        const { username, email, password } = parsedData.data;
        const result = await authService.register({
          username,
          email,
          password,
        });

        if (!result.success) {
          return createErrorResponse(
            Errors.INTERNAL_SERVER_ERROR,
            "Failed to register user",
            500
          );
        }

        return createCookieResponse(result.data.session.id);
      } catch (err) {
        console.error("Register route error:", err);
        return createErrorResponse(
          Errors.INTERNAL_SERVER_ERROR,
          "Registrering feilet",
          500
        );
      }
    }),
  ]),

  authenticationMiddleware,
  // Legg til sånn autentisering her som sjekker om du har session før du kan være inn i visse pages som f.eks messages.
  // Anbefaler å heller sette sånn chat messages og dashboard under / slik som f.eks Facebook gjør det. Autentiser bruker når de går i /, og hvis ikke send dem til login

  render(Document, [
    route("/", HomePage),
    route("/login", LoginPage),
    route("/register", RegisterPage),
    route("/messages", MessagesPage),
  ]),
]);
