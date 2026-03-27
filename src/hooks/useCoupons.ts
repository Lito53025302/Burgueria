import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_discount?: number;
  is_active: boolean;
  expires_at?: string;
}

export const useCoupons = (tenantId: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const validateCoupon = async (code: string, currentTotal: number) => {
    if (!tenantId || !code) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('coupons')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Cupom inválido ou não encontrado.');
        return null;
      }

      const coupon = data as Coupon;

      // Verificar validade
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        setError('Este cupom expirou.');
        return null;
      }

      // Verificar valor mínimo
      if (currentTotal < coupon.min_purchase) {
        setError(`Este cupom exige uma compra mínima de R$ ${coupon.min_purchase.toFixed(2)}`);
        return null;
      }

      setAppliedCoupon(coupon);
      return coupon;
    } catch (err) {
      logger.error('Erro ao validar cupom', err);
      setError('Erro ao validar cupom. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (total: number, coupon: Coupon) => {
    if (coupon.discount_type === 'fixed') {
      return Math.min(total, coupon.discount_value);
    } else {
      let discount = total * (coupon.discount_value / 100);
      if (coupon.max_discount) {
        discount = Math.min(discount, coupon.max_discount);
      }
      return discount;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setError(null);
  };

  return {
    validateCoupon,
    calculateDiscount,
    removeCoupon,
    appliedCoupon,
    loading,
    error
  };
};
