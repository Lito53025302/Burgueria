import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export interface PaymentPreference {
  id: string;
  init_point: string; // URL para redirecionar o usuário para o checkout do Mercado Pago
  sandbox_init_point: string;
}

export const paymentService = {
  /**
   * Cria uma preferência de pagamento no Mercado Pago via Edge Function ou API
   * Por enquanto, simulamos a criação para preparar o fluxo
   */
  createPreference: async (orderId: string, items: any[], total: number): Promise<PaymentPreference | null> => {
    try {
      logger.info('Iniciando criação de preferência de pagamento', { orderId, total });

      // Aqui chamaremos uma Edge Function do Supabase ou nossa API Node
      // const { data, error } = await supabase.functions.invoke('create-mercado-pago-preference', {
      //   body: { orderId, items, total }
      // });

      // Simulação de resposta do Mercado Pago
      const mockPreference: PaymentPreference = {
        id: `pref_${Math.random().toString(36).substr(2, 9)}`,
        init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock_${orderId}`,
        sandbox_init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=mock_${orderId}`
      };

      // Atualizar o pedido com o ID da preferência
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_id: mockPreference.id,
          payment_status: 'pending' 
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      return mockPreference;
    } catch (error) {
      logger.error('Erro ao criar preferência de pagamento', error);
      return null;
    }
  },

  /**
   * Consulta o status de um pagamento
   */
  checkPaymentStatus: async (paymentId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('payment_status')
        .eq('payment_id', paymentId)
        .single();

      if (error) throw error;
      return data.payment_status;
    } catch (error) {
      logger.error('Erro ao verificar status do pagamento', error);
      return null;
    }
  }
};
