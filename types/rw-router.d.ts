declare module "rwsdk/router" {
  // Minimal middleware type used in this project. Adjust as needed if the real
  // SDK expects a different shape.
  export type RouteContext = {
    request?: Request;
    response: Response;
    rw?: {
      nonce?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };

  export type RouteMiddleware = (ctx: RouteContext) => void | Promise<void>;
}
