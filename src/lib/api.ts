import { getToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function authH(): Record<string, string> {
  const t = typeof window !== "undefined" ? getToken() : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export const api = {
  // General
  async getGreeting() {
    const res = await fetch(`${API_BASE}/config/greeting`);
    return res.json();
  },

  async getSuggestions() {
    const res = await fetch(`${API_BASE}/config/suggestions`);
    return res.json();
  },

  // Sessions & Chat
  async getSessions(internal_only = false, scope = "all", sort = "newest", page = 1, page_size = 20, search?: string) {
    const params = new URLSearchParams({ internal_only: String(internal_only), scope, sort, page: String(page), page_size: String(page_size) });
    if (search) params.append("search", search);
    const res = await fetch(`${API_BASE}/sessions?${params}`, { headers: authH() });
    return res.json();
  },

  async getSessionHistory(sessionId: string, isPublic = false) {
    const url = isPublic ? `${API_BASE}/public/sessions/${sessionId}/history` : `${API_BASE}/sessions/${sessionId}`;
    const res = await fetch(url, { headers: isPublic ? {} : authH() });
    return res.json();
  },

  async deleteSession(sessionId: string) {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`, { method: "DELETE", headers: authH() });
    return res.json();
  },

  async bulkDeleteSessions(ids: string[]) {
    const res = await fetch(`${API_BASE}/sessions/bulk-delete`, {
      method: "POST", headers: { "Content-Type": "application/json", ...authH() },
      body: JSON.stringify({ ids }),
    });
    return res.json();
  },

  async query(input: string, sessionId?: string, isInternal = false, history?: {q: string, a: string}[]) {
    const res = await fetch(`${API_BASE}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, session_id: sessionId, is_internal: isInternal, history }),
    });
    return res.json();
  },

  // Ingestion
  async ingestFile(file: File, category = "General") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    const res = await fetch(`${API_BASE}/ingest`, { method: "POST", headers: authH(), body: formData });
    return res.json();
  },

  async ingestManual(title: string, question: string, answer: string, category = "Manual Entry") {
    const res = await fetch(`${API_BASE}/ingest/manual`, {
      method: "POST", headers: { "Content-Type": "application/json", ...authH() },
      body: JSON.stringify({ title, question, answer, category }),
    });
    return res.json();
  },

  // Admin Documents
  async getDocuments(search?: string, category?: string, page = 1, page_size = 15) {
    const params = new URLSearchParams({ page: String(page), page_size: String(page_size) });
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    const res = await fetch(`${API_BASE}/admin/documents?${params}`, { headers: authH() });
    return res.json();
  },

  async deleteDocument(id: number) {
    const res = await fetch(`${API_BASE}/documents/${id}`, { method: "DELETE", headers: authH() });
    return res.json();
  },

  async bulkDeleteDocuments(ids: number[]) {
    const res = await fetch(`${API_BASE}/documents/bulk-delete`, {
      method: "POST", headers: { "Content-Type": "application/json", ...authH() },
      body: JSON.stringify({ ids }),
    });
    return res.json();
  },

  // Trash
  async getTrash(search?: string, page = 1, page_size = 15, type?: string) {
    const params = new URLSearchParams({ page: String(page), page_size: String(page_size) });
    if (search) params.append("search", search);
    if (type) params.append("source_type", type);
    const res = await fetch(`${API_BASE}/admin/trash?${params}`, { headers: authH() });
    return res.json();
  },

  async restoreDocument(id: number) {
    const res = await fetch(`${API_BASE}/admin/restore/${id}`, { method: "POST", headers: authH() });
    return res.json();
  },

  async permanentDelete(id: number) {
    const res = await fetch(`${API_BASE}/admin/permanent/${id}`, { method: "DELETE", headers: authH() });
    return res.json();
  },

  // Config
  async getConfig() {
    const res = await fetch(`${API_BASE}/admin/config`, { headers: authH() });
    return res.json();
  },

  async updateConfig(payload: any) {
    const res = await fetch(`${API_BASE}/admin/config`, {
      method: "POST", headers: { "Content-Type": "application/json", ...authH() },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/admin/dashboard`, { headers: authH() });
    return res.json();
  },

  async checkSynergy(title: string, question: string, answer: string) {
    const res = await fetch(`${API_BASE}/ingest/check`, {
      method: "POST", headers: { "Content-Type": "application/json", ...authH() },
      body: JSON.stringify({ title, question, answer }),
    });
    return res.json();
  },

  // Auth
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: authH() });
    return res.json();
  },
  
  async changePassword(currentPassword: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authH() },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    return res.json();
  },
};
