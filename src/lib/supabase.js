import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Configurar el manejo de errores de token
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  // Configurar el global para manejar errores de API
  global: {
    headers: {
      'X-Client-Info': 'cart-pilot-app'
    }
  }
})
