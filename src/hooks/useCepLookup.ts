import { useState } from 'react';
import { logger } from '../utils/logger';

export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export function useCepLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCep = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara: 12345-678
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const searchCep = async (cep: string): Promise<CepData | null> => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');

    // Valida se tem 8 dígitos
    if (cleanCep.length !== 8) {
      setError('CEP deve ter 8 dígitos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      logger.time('Buscar CEP');
      
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }

      const data: CepData = await response.json();

      logger.timeEnd('Buscar CEP');

      if (data.erro) {
        setError('CEP não encontrado');
        logger.warn('CEP não encontrado', { cep: cleanCep });
        return null;
      }

      logger.info('CEP encontrado', { 
        cep: data.cep, 
        cidade: data.localidade, 
        estado: data.uf 
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar CEP';
      setError(errorMessage);
      logger.error('Erro ao buscar CEP', err, { cep: cleanCep });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    searchCep,
    formatCep,
    loading,
    error,
    clearError: () => setError(null)
  };
}
