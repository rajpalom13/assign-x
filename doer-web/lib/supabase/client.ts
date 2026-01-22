import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates the Supabase client for browser/client-side usage
 * Uses default configuration with localStorage storage
 * The server sets httpOnly cookies, and we use server components to pass session data to client
 * @returns Supabase browser client instance
 */
export function createClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
