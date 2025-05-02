import { supabase } from "@/lib/supabaseClient"

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = "ApiError"
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: {
    method?: string
    body?: any
    accessToken?: string
  } = {}
): Promise<T> {
  const { method = "GET", body, accessToken } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await fetch(endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(data.error || "API request failed", res.status)
  }

  return data
}

export function getSupabaseClient() {
  return supabase
} 