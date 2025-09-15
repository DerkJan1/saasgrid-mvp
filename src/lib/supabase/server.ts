import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // In Next.js 15, we can only read cookies in server components
          // Cookie setting should happen in Route Handlers or Server Actions
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Silently ignore cookie setting errors in server components
            console.warn('Cookie setting failed - this is expected in server components:', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Silently ignore cookie removal errors in server components
            console.warn('Cookie removal failed - this is expected in server components:', error)
          }
        },
      },
    }
  )
}

// Create a read-only client for server components that only reads user data
export async function createReadOnlyClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {
          // No-op for read-only client
        },
        remove() {
          // No-op for read-only client
        },
      },
    }
  )
}
