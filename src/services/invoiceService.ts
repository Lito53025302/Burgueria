import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export interface InvoiceResult {
  success: boolean;
  invoice_id?: string;
  invoice_url?: string;
  nfe_access_key?: string;
  error?: string;
}

export const invoiceService = {
  /**
   * Prepara os dados para a emissão da Nota Fiscal (NFC-e ou NF-e)
   */
  prepareInvoice: async (orderId: string): Promise<InvoiceResult> => {
    try {
      logger.info('Preparando emissão de nota fiscal para o pedido', { orderId });

      // Buscar dados do pedido, itens e tenant
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, tenant:tenants(*)')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Verificar se o tenant tem configurações de nota fiscal
      const { data: settings, error: settingsError } = await supabase
        .from('tenant_invoice_settings')
        .select('*')
        .eq('tenant_id', order.tenant_id)
        .single();

      if (settingsError || !settings) {
        return { success: false, error: 'Configurações de nota fiscal não encontradas para esta loja.' };
      }

      // Simulação de chamada para API de emissão (ex: Focus NFe)
      // Aqui ocorreria a integração real com o emissor
      
      const mockResult: InvoiceResult = {
        success: true,
        invoice_id: `nfe_${Math.random().toString(36).substr(2, 9)}`,
        invoice_url: `https://api.emissor.com/v2/nfe/${orderId}.pdf`,
        nfe_access_key: '35210100000000000000000000000000000000000000'
      };

      // Atualizar o pedido com as informações da nota
      await supabase
        .from('orders')
        .update({
          invoice_id: mockResult.invoice_id,
          invoice_status: 'issued',
          invoice_url: mockResult.invoice_url,
          nfe_access_key: mockResult.nfe_access_key
        })
        .eq('id', orderId);

      return mockResult;
    } catch (error) {
      logger.error('Erro ao emitir nota fiscal', error);
      return { success: false, error: 'Erro interno ao processar nota fiscal.' };
    }
  },

  /**
   * Consulta o status da nota fiscal
   */
  checkInvoiceStatus: async (orderId: string) => {
    const { data } = await supabase
      .from('orders')
      .select('invoice_status, invoice_url, nfe_access_key')
      .eq('id', orderId)
      .single();
    
    return data;
  }
};
