const TOKEN_KEY = "oracle_token";
const USER_KEY = "oracle_user";
const EXPIRY_KEY = "oracle_token_exp";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, username: string, expiresIn: number = 3600): void {
  // Store access token in sessionStorage (tab-scoped, not persistent across tabs but not on disk)
  // Also in localStorage for middleware cookie check compatibility
  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
  // Record expiry time
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + expiresIn * 1000));
  // Set cookie for middleware
  document.cookie = `oracle_token=${token}; path=/; max-age=${expiresIn}; SameSite=Lax`;
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  // Remove cookie to trigger middleware redirect
  document.cookie = "oracle_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("oracle_display_name") || localStorage.getItem(USER_KEY);
}

export function getTokenExpiry(): number {
  const exp = localStorage.getItem(EXPIRY_KEY);
  return exp ? parseInt(exp) : 0;
}

export function isTokenExpiringSoon(): boolean {
  // Returns true if token expires within 5 minutes
  return getTokenExpiry() - Date.now() < 5 * 60 * 1000;
}

export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Auto-refresh: call this at app startup and on focus
export async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:8000/auth/refresh", {
      method: "POST",
      credentials: "include", // sends httpOnly cookie automatically
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.access_token) {
      const username = getUsername() || "admin";
      setToken(data.access_token, username, data.expires_in);
      // Update cookie so middleware can check it
      document.cookie = `oracle_token=${data.access_token}; path=/; max-age=${data.expires_in}; SameSite=Lax`;
      return true;
    }
  } catch {}
  return false;
}

// Avatar presets
export const AVATARS = ["🦊", "🦁", "🐺", "🐻", "🦅"];
export function getAvatar(): string {
  if (typeof window === "undefined") return AVATARS[0];
  return localStorage.getItem("oracle_avatar") || AVATARS[0];
}
export function setAvatar(a: string): void {
  localStorage.setItem("oracle_avatar", a);
}

// Notifications
export interface Notification {
  id: string;
  message: string;
  type: "success" | "info" | "warning";
  time: string;
  read: boolean;
}
export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("oracle_notifications") || "[]"); }
  catch { return []; }
}
export function addNotification(msg: string, type: Notification["type"] = "info"): void {
  const notifs = getNotifications();
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  notifs.unshift({ id, message: msg, type, time: new Date().toISOString(), read: false });
  localStorage.setItem("oracle_notifications", JSON.stringify(notifs.slice(0, 20)));
}
export function markAllRead(): void {
  // User requested "remove it" when marking all as read
  localStorage.setItem("oracle_notifications", "[]");
}
