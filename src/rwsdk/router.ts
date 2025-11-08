// Minimal shim for rwsdk/router used during local development and bundling.
// The real router (in production) may provide richer behavior. This stub
// prevents bundlers from failing to resolve the import while keeping the
// app functional because the worker's main `fetch` handler handles the
// same endpoints.
export const route = {
  post(path: string, handler: Function) {
    // no-op in this shim; keep the handler reference in case tests or
    // other tooling introspects it.
    return { path, handler };
  },
};
