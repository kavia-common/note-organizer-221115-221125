//
// Simple API client for the Notes backend
// Reads base URL from REACT_APP_API_BASE or REACT_APP_BACKEND_URL. Defaults to http://localhost:3001
//

// PUBLIC_INTERFACE
export function getApiBase() {
  // Base URL priority: REACT_APP_API_BASE -> REACT_APP_BACKEND_URL -> http://localhost:3001
  const envA = process.env.REACT_APP_API_BASE;
  const envB = process.env.REACT_APP_BACKEND_URL;
  const fallback = 'http://localhost:3001';
  const base = (envA && envA.trim()) || (envB && envB.trim()) || fallback;
  // Ensure no trailing slash to avoid double-slashes when joining paths.
  return base.replace(/\/*$/, '');
}

/**
 * Wrap fetch to provide common JSON handling and error propagation.
 */
async function request(path, options = {}) {
  const res = await fetch(`${getApiBase()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      if (isJson) {
        const data = await res.json();
        if (data && (data.detail || data.message)) {
          detail = data.detail || data.message;
        }
      } else {
        const text = await res.text();
        if (text) detail = text;
      }
    } catch (_) {
      // ignore parse errors
    }
    throw new Error(detail || 'Request failed');
  }
  return isJson ? res.json() : res.text();
}

// PUBLIC_INTERFACE
export const api = {
  /** List notes */
  async list() {
    return request('/notes', { method: 'GET' });
  },
  /** Create a new note */
  async create(payload) {
    return request('/notes', { method: 'POST', body: JSON.stringify(payload) });
  },
  /** Update an existing note */
  async update(id, payload) {
    return request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  /** Delete a note */
  async remove(id) {
    return request(`/notes/${id}`, { method: 'DELETE' });
  },
};
