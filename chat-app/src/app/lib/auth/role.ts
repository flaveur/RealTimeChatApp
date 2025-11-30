// Simple role helpers used by Navigation and layouts
export function isAdmin(user: any | null) {
  return !!(user && (user.role === "admin" || user.role === "administrator"));
}

export function isUser(user: any | null) {
  return !!user;
}

export default { isAdmin, isUser };
