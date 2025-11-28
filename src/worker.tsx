// src/worker.tsx

import { Document } from "@/app/Document";
import { setCommonHeaders } from "@/app/headers";
import { setupDb, type DB } from "@/db";
import { prefix, render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { runSeed } from "@/db/seed"; // <-- add this
import { AuthContext } from "better-auth";
import { env } from "cloudflare:workers";
import { authService } from "./app/api/auth/authService";
import { LoginDTOSchema, RegisterDTOSchema } from "./app/lib/schema/auth-dtos";
import { authenticationMiddleware } from "./app/middleware/authentication";
import { Home } from "./app/pages/Home";
import LoginPage from "./app/pages/LoginPage";
import MessagesPage from "./app/pages/MessagesPage";
import Register from "./app/pages/Register";
import { Errors } from "./app/types/errors";
import {
  createCookieResponse,
  createErrorResponse,
} from "./app/types/response";

export interface Env {
  DB: D1Database;
}

// Expands context to have authcontext
export type AppContext = {
  db: DB;
} & AuthContext;

export default defineApp([
  setCommonHeaders(),

  // Database setup middleware
  async function setup({ ctx }) {
    ctx.db = await setupDb(env.DB);
  },

  authenticationMiddleware,

  // DEV: seed route
  prefix("/api/dev", [
    route("/seed", async () => {
      try {
        const users = await runSeed(env.DB);
        return Response.json({ success: true, count: users.length, users });
      } catch (err) {
        console.error("Seed error:", err);
        return Response.json(
          { success: false, error: "Seeding failed" },
          { status: 500 }
        );
      }
    }),
  ]),

  // Auth routes
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

  // UI routes
  render(Document, [
    route("/", () => <Home />),
    prefix("/auth", [
      route("/login", () => <LoginPage />),
      route("/register", () => <Register />),
    ]),
    route("/messages", () => <MessagesPage />),
  ]),
]);
