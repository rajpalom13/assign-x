import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/** Singleton instance of the Supabase client */
let supabaseClient: SupabaseClient | null = null

/**
 * Creates or returns the singleton Supabase client for browser/client-side usage
 * Uses singleton pattern to avoid creating multiple connections
 * @returns Supabase browser client instance
 */
export function createClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}
