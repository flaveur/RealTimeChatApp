declare module "bcryptjs" {
  export function hashSync(data: string | number | Buffer, saltOrRounds: number | string): string;
  export function hash(data: string | number | Buffer, saltOrRounds: number | string, callback?: (err: Error | null, encrypted: string) => void): Promise<string> | void;
  export function genSaltSync(rounds?: number): string;
  const bcryptjs: any;
  export = bcryptjs;
}
