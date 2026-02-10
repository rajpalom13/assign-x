import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

/**
 * Returns a singleton Supabase browser client.
 * Prevents creating multiple client instances which cause duplicate
 * auth listeners, session re-fetches, and real-time subscription issues.
 */
export function createClient(): SupabaseClient {
  if (_client) return _client

  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return _client
}
