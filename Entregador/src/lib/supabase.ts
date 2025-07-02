import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Order = {
  id: string
  customer_name: string
  delivery_address: string
  items_count: number
  status: 'pending' | 'preparing' | 'ready' | 'awaiting_pickup' | 'in_transit' | 'delivered'
  motoboy_arrived: boolean
  created_at: string
  total_amount: number
  payment_method?: string // Adicionado para exibir tipo de pagamento
  change_for?: number | string // Adicionado para exibir troco
  motoboy_id?: string // Adicionado para controle de quem aceitou o pedido
}