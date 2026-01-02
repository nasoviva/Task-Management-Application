import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars: string[] = []
    if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}. ` +
      `Please create a .env.local file with your Supabase credentials. ` +
      `See README.md for setup instructions.`
    )
  }

  console.log("[Supabase Client] Initializing client with URL:", supabaseUrl.substring(0, 30) + "...")
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
