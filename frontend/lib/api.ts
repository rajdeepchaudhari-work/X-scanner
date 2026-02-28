const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Tweet {
  id: string
  text: string
  author: string
  created_at: string
  fetched_at?: string
  processed?: boolean
}

export interface MemoryEntry {
  id: string
  tweet_id: string
  interpretation: string
  tags: string[]
  importance: number
  created_at: string
  tweet_text?: string
  tweet_author?: string
}

export interface Account {
  username: string
  added_at: string
}

export interface FetchResult {
  fetched: number
  stored_new: number
  error?: string
  message?: string
}

export interface AppSettings {
  poll_interval_minutes: number
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body.detail ?? detail
    } catch {
      // ignore parse errors
    }
    throw new Error(detail)
  }

  return res.json() as Promise<T>
}

// ─── API client ───────────────────────────────────────────────────────────────

export const api = {
  tweets: {
    getNew: (limit = 50) =>
      request<{ tweets: Tweet[] }>(`/tweets/new?limit=${limit}`),
    getAll: (limit = 50) =>
      request<{ tweets: Tweet[] }>(`/tweets?limit=${limit}`),
  },

  memory: {
    get: (limit = 50) =>
      request<{ memory: MemoryEntry[] }>(`/memory?limit=${limit}`),
    store: (payload: {
      tweet_id: string
      interpretation: string
      tags: string[]
      importance: number
    }) =>
      request<{ status: string; id: string }>("/memory", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  accounts: {
    get: () => request<{ accounts: Account[] }>("/accounts"),
    add: (username: string) =>
      request<{ status: string; username: string }>("/accounts", {
        method: "POST",
        body: JSON.stringify({ username }),
      }),
    delete: (username: string) =>
      request<{ status: string; username: string }>(`/accounts/${username}`, {
        method: "DELETE",
      }),
  },

  fetch: {
    trigger: () => request<FetchResult>("/fetch", { method: "POST" }),
  },

  settings: {
    get: () => request<AppSettings>("/settings"),
    update: (poll_interval_minutes: number) =>
      request<{ status: string; poll_interval_minutes: number }>("/settings", {
        method: "PUT",
        body: JSON.stringify({ poll_interval_minutes }),
      }),
  },

  health: {
    check: () => request<{ status: string }>("/health"),
  },
}
