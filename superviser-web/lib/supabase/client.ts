/**
 * @fileoverview Supabase client factory for browser-side authentication and data access.
 * @module lib/supabase/client
 */

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"
import type { User } from "@supabase/supabase-js"

let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (clientInstance) {
    return clientInstance
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("[Supabase Client] Missing environment variables:", { url: !!url, key: !!key })
    throw new Error("Missing Supabase environment variables")
  }

  console.log("[Supabase Client] Creating browser client for:", url)

  clientInstance = createBrowserClient<Database>(url, key)
  return clientInstance
}

/**
 * Get the current authenticated user from session.
 * Uses getSession() which is faster as it reads from cookies/localStorage.
 * Falls back to null if no session exists.
 */
export async function getAuthUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  return sessionData?.session?.user || null
}
