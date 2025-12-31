import { createClient } from '@supabase/supabase-js'
import { logger } from '../utils/logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

// Criar uma única instância do cliente Supabase
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Função para inicializar o cliente Supabase
const initSupabase = () => {
  if (!supabaseInstance) {
    // Validar URL do Supabase
    if (!supabaseUrl || typeof supabaseUrl !== 'string' || !supabaseUrl.startsWith('https://')) {
      logger.error('URL do Supabase inválida ou não encontrada nas variáveis de ambiente', null, {
        providedUrl: import.meta.env.VITE_SUPABASE_URL
      });
      throw new Error('URL do Supabase inválida ou não encontrada nas variáveis de ambiente')
    }

    // Validar chave anônima
    if (!supabaseAnonKey || typeof supabaseAnonKey !== 'string') {
      logger.error('Chave anônima do Supabase não encontrada nas variáveis de ambiente', null, {
        keyPresent: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'presente' : 'ausente'
      });
      throw new Error('Chave anônima do Supabase não encontrada nas variáveis de ambiente')
    }

    try {
      // Testar se a URL é válida
      new URL(supabaseUrl)
    } catch (error) {
      logger.error('URL do Supabase inválida', error);
      throw new Error('URL do Supabase inválida')
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'burgueria-entregador-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }
  return supabaseInstance
}

// Exportar o cliente Supabase
export const supabase = initSupabase()

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