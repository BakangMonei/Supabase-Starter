import { createClient } from "@supabase/supabase-js"
import { DEMO_DATA } from "./constants"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isDemo = !supabaseUrl || !supabaseAnonKey

let supabase

if (isDemo) {
  // Create a mock client for demo mode
  supabase = DEMO_DATA
} else {
  supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false,
    },
  })
}

export { supabase }

