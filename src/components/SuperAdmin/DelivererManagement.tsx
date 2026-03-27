import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Link2, Store, Truck, Unlink } from 'lucide-react';

interface DelivererProfile {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

interface Tenant {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  is_active: boolean;
}

interface DelivererTenantLink {
  id: string;
  deliverer_id: string;
  tenant_id: string;
  is_active: boolean;
}

export default function DelivererManagement() {
  const [deliverers, setDeliverers] = useState<DelivererProfile[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [links, setLinks] = useState<DelivererTenantLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [storeSearchTerm, setStoreSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [selectedDelivererId, setSelectedDelivererId] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [deliverersResult, tenantsResult, linksResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, email, name, created_at')
          .eq('role', 'deliverer')
          .order('created_at', { ascending: false }),
        supabase
          .from('tenants')
          .select('id, name, city, state, is_active')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('deliverer_tenants')
          .select('id, deliverer_id, tenant_id, is_active')
      ]);

      if (deliverersResult.error) throw deliverersResult.error;
      if (tenantsResult.error) throw tenantsResult.error;
      if (linksResult.error) throw linksResult.error;

      setDeliverers((deliverersResult.data || []) as DelivererProfile[]);
      setTenants((tenantsResult.data || []) as Tenant[]);
      setLinks((linksResult.data || []) as DelivererTenantLink[]);
    } catch (error) {
      console.error('Erro ao carregar gestão de entregadores:', error);
      alert('Erro ao carregar dados de entregadores.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkDelivererToStore = async () => {
    if (!selectedDelivererId || !selectedTenantId) {
      alert('Selecione um entregador e uma loja.');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('deliverer_tenants')
        .upsert(
          {
            deliverer_id: selectedDelivererId,
            tenant_id: selectedTenantId,
            is_active: true
          },
          { onConflict: 'deliverer_id,tenant_id' }
        );

      if (error) throw error;

      setSelectedTenantId('');
      await fetchData();
      alert('Entregador vinculado com sucesso!');
    } catch (error) {
      console.error('Erro ao vincular entregador:', error);
      alert('Erro ao vincular entregador à loja.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateLink = async (linkId: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('deliverer_tenants')
        .update({ is_active: false })
        .eq('id', linkId);

      if (error) throw error;

      await fetchData();
    } catch (error) {
      console.error('Erro ao desativar vínculo:', error);
      alert('Erro ao desativar vínculo.');
    } finally {
      setSaving(false);
    }
  };

  const activeLinks = useMemo(
    () => links.filter((link) => link.is_active),
    [links]
  );

  const activeLinksByDeliverer = useMemo(() => {
    const map = new Map<string, DelivererTenantLink[]>();
    for (const link of activeLinks) {
      if (!map.has(link.deliverer_id)) map.set(link.deliverer_id, []);
      map.get(link.deliverer_id)?.push(link);
    }
    return map;
  }, [activeLinks]);

  const tenantById = useMemo(() => {
    const map = new Map<string, Tenant>();
    for (const tenant of tenants) map.set(tenant.id, tenant);
    return map;
  }, [tenants]);

  const filteredDeliverers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return deliverers;
    return deliverers.filter((deliverer) =>
      deliverer.name?.toLowerCase().includes(query) ||
      deliverer.email.toLowerCase().includes(query)
    );
  }, [deliverers, searchTerm]);

  const availableStates = useMemo(() => {
    const states = new Set<string>();
    tenants.forEach((tenant) => {
      if (tenant.state) states.add(tenant.state);
    });
    return ['all', ...Array.from(states).sort((a, b) => a.localeCompare(b, 'pt-BR'))];
  }, [tenants]);

  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    tenants.forEach((tenant) => {
      const matchState = stateFilter === 'all' || tenant.state === stateFilter;
      if (matchState && tenant.city) cities.add(tenant.city);
    });
    return ['all', ...Array.from(cities).sort((a, b) => a.localeCompare(b, 'pt-BR'))];
  }, [stateFilter, tenants]);

  const filteredTenants = useMemo(() => {
    const term = storeSearchTerm.trim().toLowerCase();
    return tenants.filter((tenant) => {
      const matchState = stateFilter === 'all' || tenant.state === stateFilter;
      const matchCity = cityFilter === 'all' || tenant.city === cityFilter;
      const matchText = !term ||
        tenant.name.toLowerCase().includes(term) ||
        (tenant.city || '').toLowerCase().includes(term) ||
        (tenant.state || '').toLowerCase().includes(term);

      return matchState && matchCity && matchText;
    });
  }, [cityFilter, stateFilter, storeSearchTerm, tenants]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">🛵 Entregadores</h2>
        <p className="text-gray-400">Vincule entregadores a uma ou mais lojas (modelo híbrido)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Truck className="h-8 w-8" />
            <span className="text-3xl font-bold">{deliverers.length}</span>
          </div>
          <p className="text-blue-100 text-sm">Entregadores cadastrados</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Link2 className="h-8 w-8" />
            <span className="text-3xl font-bold">{activeLinks.length}</span>
          </div>
          <p className="text-green-100 text-sm">Vínculos ativos</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Store className="h-8 w-8" />
            <span className="text-3xl font-bold">{tenants.length}</span>
          </div>
          <p className="text-purple-100 text-sm">Lojas ativas</p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-white">Vincular Entregador à Loja</h3>
          <button
            type="button"
            onClick={() => {
              setStateFilter('all');
              setCityFilter('all');
              setStoreSearchTerm('');
            }}
            className="px-3 py-2 text-sm font-semibold rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setCityFilter('all');
            }}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todos os estados</option>
            {availableStates
              .filter((state) => state !== 'all')
              .map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todas as cidades</option>
            {availableCities
              .filter((city) => city !== 'all')
              .map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
          </select>

          <input
            type="text"
            value={storeSearchTerm}
            onChange={(e) => setStoreSearchTerm(e.target.value)}
            placeholder="Buscar loja por nome/cidade..."
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedDelivererId}
            onChange={(e) => setSelectedDelivererId(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Selecione o entregador</option>
            {deliverers.map((deliverer) => (
              <option key={deliverer.id} value={deliverer.id}>
                {deliverer.name || deliverer.email} ({deliverer.email})
              </option>
            ))}
          </select>

          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Selecione a loja</option>
            {filteredTenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name} {tenant.city ? `(${tenant.city}/${tenant.state || '-'})` : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleLinkDelivererToStore}
            disabled={saving}
            className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Vincular'}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Lojas exibidas: <span className="font-semibold text-white">{filteredTenants.length}</span>
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar entregador por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Entregador</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Lojas Vinculadas</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredDeliverers.map((deliverer) => {
                const delivererLinks = (activeLinksByDeliverer.get(deliverer.id) || []).filter((link) => {
                  const tenant = tenantById.get(link.tenant_id);
                  if (!tenant) return false;
                  const matchState = stateFilter === 'all' || tenant.state === stateFilter;
                  const matchCity = cityFilter === 'all' || tenant.city === cityFilter;
                  const term = storeSearchTerm.trim().toLowerCase();
                  const matchText = !term ||
                    tenant.name.toLowerCase().includes(term) ||
                    (tenant.city || '').toLowerCase().includes(term) ||
                    (tenant.state || '').toLowerCase().includes(term);
                  return matchState && matchCity && matchText;
                });
                return (
                  <tr key={deliverer.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <p className="text-white font-semibold">{deliverer.name || 'Sem nome'}</p>
                      <p className="text-gray-400 text-sm">{deliverer.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {delivererLinks.length === 0 ? (
                        <span className="text-yellow-400 text-sm">Sem vínculos ativos</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {delivererLinks.map((link) => {
                            const tenant = tenantById.get(link.tenant_id);
                            return (
                              <span
                                key={link.id}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold"
                              >
                                {tenant?.name || 'Loja'}
                                <button
                                  onClick={() => handleDeactivateLink(link.id)}
                                  disabled={saving}
                                  className="hover:text-red-300"
                                  title="Desvincular loja"
                                >
                                  <Unlink className="h-3.5 w-3.5" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(deliverer.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
