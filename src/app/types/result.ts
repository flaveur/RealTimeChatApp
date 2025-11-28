// /app/types/result.ts

import { Pagination } from "./api";
import { ErrorCode, ResultError } from "./errors";

// Successful data response type
export type ResultData<T> = {
  success: true;
  data: T;
  pagination?: Pagination;
};

// Result pattern for API responses
export type Result<T> = ResultData<T> | ResultError;

// Result function type
export type ResultFn = {
  success: <T>(data: T, pagination?: Pagination) => ResultData<T>;
  failure: (error: unknown, code: ErrorCode) => ResultError;
};

export type ServerResult<T, U extends Record<string, unknown> = {}> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code?: string;
      fieldErrors?: Record<string, string[]>;
      state?: U;
    };
