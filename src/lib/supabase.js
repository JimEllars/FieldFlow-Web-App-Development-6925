import { createClient } from '@supabase/supabase-js'

// Use actual Supabase credentials
const SUPABASE_URL = 'https://pehaktnlutpofluqcele.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaGFrdG5sdXRwb2ZsdXFjZWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzU4MDksImV4cCI6MjA3MTY1MTgwOX0.z_e7IsTMytAVO9YPVVJURY6qw3w_--DHy9hmMAWZNco'

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables')
  // Don't throw in test mode to allow development
  if (import.meta.env.VITE_TEST_MODE !== 'true') {
    throw new Error('Missing Supabase environment variables')
  }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'FieldFlow-Advanced'
    }
  }
})

export default supabase