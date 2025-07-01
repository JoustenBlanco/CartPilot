// Ejemplo de cómo usar Supabase en tus componentes
import { supabase } from '@/lib/supabase'

// Ejemplo para una página o componente
export async function fetchData() {
  try {
    const { data, error } = await supabase
      .from('your_table_name')
      .select('*')
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}

// Ejemplo para autenticación
export async function signUp(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error signing up:', error)
    return null
  }
}

// Ejemplo para insertar datos
export async function insertData(newItem) {
  try {
    const { data, error } = await supabase
      .from('your_table_name')
      .insert([newItem])
      .select()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error inserting data:', error)
    return null
  }
}
