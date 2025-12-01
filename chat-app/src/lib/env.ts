let _env: any = null; // Lokal variabel for miljø

export function setEnv(env: any) {
  _env = env; // Lagde miljø
}

export function getEnv() {
  return _env; // Returnerer miljø
}