// Minimal ambient declarations for the local `rwsdk/worker` module so TS can
// resolve imports used in the project. Expand as needed to match the real
// runtime API.
declare module "rwsdk/worker" {
  export type RequestInfo = any;

  export type DefineScriptContext = {
    env: Record<string, any>;
    [key: string]: any;
  };

  export function defineScript<T = any>(
    fn: (ctx: DefineScriptContext) => Promise<T> | T
  ): () => Promise<T>;

  // Allow consumers to augment DefaultAppContext if needed
  export interface DefaultAppContext {
    env?: Record<string, any>;
    [key: string]: any;
  }
}
