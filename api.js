const API_BASE = "";

function getToken() {
  return sessionStorage.getItem("mediccare_token");
}

function setAuth(token, user) {
  sessionStorage.setItem("mediccare_token", token);
  sessionStorage.setItem("mediccare_user", JSON.stringify(user));
}

function clearAuth() {
  sessionStorage.removeItem("mediccare_token");
  sessionStorage.removeItem("mediccare_user");
}

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("mediccare_user") || "null");
  } catch {
    return null;
  }
}

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

const API = {
  login: (email, password) => apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => apiFetch("/api/auth/me"),
  dashboard: (period) => apiFetch(`/api/dashboard?period=${period}`),
  search: (q) => apiFetch(`/api/search?q=${encodeURIComponent(q)}`),
  exportSummary: () => apiFetch("/api/export/summary"),
  list: (entity) => apiFetch(`/api/${entity}`),
  create: (entity, body) => apiFetch(`/api/${entity}`, { method: "POST", body: JSON.stringify(body) }),
  update: (entity, id, body) => apiFetch(`/api/${entity}/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (entity, id) => apiFetch(`/api/${entity}/${id}`, { method: "DELETE" }),
};
