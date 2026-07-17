import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and fill in ' +
      'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from your Supabase project settings (API).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Keeps her logged in across app restarts / home-screen launches.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

export const STORAGE_BUCKET = 'activity-images'
