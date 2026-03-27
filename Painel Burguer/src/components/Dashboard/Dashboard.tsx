import React from 'react';
import { useStore } from '../../contexts/StoreContext';
import { StatsCards } from './StatsCards';
import { RevenueChart } from './RevenueChart';
import { TopSellingItems } from './TopSellingItems';
import { RecentOrders } from './RecentOrders';
import { useTenantContext } from '../../contexts/TenantContext';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

export function Dashboard() {
  const { dashboardStats } = useStore();
  const { tenant, refetch } = useTenantContext();
  const [isPublishing, setIsPublishing] = React.useState(false);

  const handleTogglePublish = async () => {
    if (!tenant) return;

    try {
      setIsPublishing(true);

      const nextPublished = !tenant.published;
      const { error } = await supabase
        .from('tenants')
        .update({ published: nextPublished })
        .eq('id', tenant.id);

      if (error) {
        throw error;
      }

      logger.info('Status de publicação alterado', { published: nextPublished });
      refetch();
    } catch (error) {
      logger.error('Erro ao alterar publicação da loja', error);
      alert('Não foi possível alterar o status de publicação da loja.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Publicação da Loja</h3>
            <p className="text-sm text-gray-600 mt-1">
              Status atual:{' '}
              <span className={tenant?.published ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>
                {tenant?.published ? 'Publicada na vitrine' : 'Oculta da vitrine'}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Loja oculta não aparece no app principal, mas o painel continua acessível para você.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTogglePublish}
            disabled={isPublishing || !tenant}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              tenant?.published
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isPublishing ? 'Salvando...' : tenant?.published ? 'Despublicar Loja' : 'Publicar Loja'}
          </button>
        </div>
      </div>

      <StatsCards stats={dashboardStats} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart 
            dailyRevenue={dashboardStats.dailyRevenue}
            weeklyRevenue={dashboardStats.weeklyRevenue}
            monthlyRevenue={dashboardStats.monthlyRevenue}
          />
        </div>
        <div>
          <TopSellingItems items={dashboardStats.topSellingItems} />
        </div>
      </div>
      
      <div>
        <RecentOrders orders={dashboardStats.recentOrders} />
      </div>
    </div>
  );
}
