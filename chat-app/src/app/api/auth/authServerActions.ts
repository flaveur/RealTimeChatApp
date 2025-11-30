// Lightweight stub for server actions related to auth
// In production this would perform server-side session cleanup and return a response.

export async function logout() {
  // perform server-side logout (clear cookie/session) here
  return { success: true };
}

export default { logout };
