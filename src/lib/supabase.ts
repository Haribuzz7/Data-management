import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvfwuoytlfnmfrrnrhrt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Znd1b3l0bGZubWZycm5yaHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNjkxMTgsImV4cCI6MjA5OTg0NTExOH0.NOvffzh7b0LqVberyW06e2PbVvoD_e9M7IIN8d8eJeU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Keeps her logged in across app restarts / home-screen launches.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

export const STORAGE_BUCKET = 'activity-images'
