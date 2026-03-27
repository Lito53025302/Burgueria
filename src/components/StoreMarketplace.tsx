import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Clock, Star, TrendingUp, UtensilsCrossed, Store as StoreIcon } from 'lucide-react';
import AnimatedStoreCard from './AnimatedStoreCard';
import ScrollReveal from './ScrollReveal';
import CategoryFilter from './CategoryFilter';
import { getUserLocation, calculateDistance, formatDistance } from '../utils/geolocation';

interface MenuItem {
    id: string;
    name: string;
    image: string;
    price: number;
}

interface MenuItemRow {
    id: string;
    name: string;
    image: string;
    price: number;
    gallery_images?: string[] | null;
}

interface Store {
    id: string;
    name: string;
    subdomain: string;
    logo_url: string | null;
    banner_url: string | null;
    primary_color: string;
    secondary_color: string;
    address: string | null;
    city: string | null;
    state: string | null;
    opening_time: string;
    closing_time: string;
    is_active: boolean;
    latitude?: number;
    longitude?: number;
    distance?: number; // Distância calculada em km
    menu_items: MenuItem[];
}

type TenantRow = Omit<Store, 'menu_items' | 'distance'>;

export default function StoreMarketplace() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const navigate = useNavigate();

    // Obter localização do usuário ao carregar
    useEffect(() => {
        const getLocation = async () => {
            const position = await getUserLocation();
            if (position) {
                setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            }
        };
        getLocation();
    }, []);

    const fetchStores = useCallback(async () => {
        try {
            // 1. Buscar todas as lojas ativas
            const { data: tenantsData, error: tenantsError } = await supabase
                .from('tenants')
                .select('*')
                .eq('is_active', true)
                .eq('published', true)
                .order('created_at', { ascending: false });

            if (tenantsError) throw tenantsError;

            // 2. Para cada loja, buscar produtos (máximo 10 para ter variedade na rotação)
            const storesWithItems = await Promise.all(
                ((tenantsData as TenantRow[]) || []).map(async (tenant) => {
                    const { data: itemsData } = await supabase
                        .from('menu_items')
                        .select('id, name, image, price, gallery_images')
                        .eq('tenant_id', tenant.id)
                        .eq('available', true)
                        .limit(10);

                    const itemImages: MenuItem[] = ((itemsData as MenuItemRow[]) || []).flatMap((item) => {
                        const extraImages = Array.isArray(item.gallery_images)
                            ? item.gallery_images.filter((url): url is string => !!url && typeof url === 'string')
                            : [];
                        const allImages = [item.image, ...extraImages].filter((url, index, arr) =>
                            !!url && arr.indexOf(url) === index
                        ).slice(0, 5);

                        return allImages.map((imageUrl, index) => ({
                            id: `${item.id}-${index}`,
                            name: item.name,
                            image: imageUrl,
                            price: item.price
                        }));
                    });

                    // Embaralhar e pegar 6 aleatórios para a animação (1 fixa + secundárias rotativas)
                    const shuffled = itemImages.sort(() => Math.random() - 0.5);
                    const randomItems = shuffled.slice(0, 6);

                    return {
                        ...tenant,
                        menu_items: randomItems
                    };
                })
            );

            setStores(storesWithItems);
        } catch (err) {
            console.error('Erro ao carregar lojas:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    // Recalcular distâncias quando a localização do usuário for obtida
    useEffect(() => {
        if (!userLocation) return;

        setStores(prevStores =>
            prevStores.map(store => {
                if (store.latitude && store.longitude) {
                    const distance = calculateDistance(
                        userLocation.lat,
                        userLocation.lon,
                        store.latitude,
                        store.longitude
                    );
                    return { ...store, distance };
                }
                return store;
            })
        );
    }, [userLocation]); // Só roda quando userLocation muda

    // Mapeamento de categorias para nomes de lojas
    const categoryMap: Record<string, string[]> = {
        'burger': ['burger', 'hamburguer', 'king'],
        'pizza': ['pizza', 'napoli'],
        'japanese': ['sushi', 'master', 'japonês', 'japanese'],
        'mexican': ['taco', 'loco', 'mexicano', 'mexican'],
        'healthy': ['açaí', 'acai', 'bem', 'saudável', 'healthy'],
        'drinks': ['bebidas', 'drinks', 'bar'],
        'desserts': ['sobremesa', 'doce', 'dessert'],
        'grill': ['churrasco', 'grill', 'carne'],
        'bakery': ['padaria', 'pão', 'bakery']
    };

    const filteredStores = stores.filter(store => {
        // Filtro por busca
        const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.city?.toLowerCase().includes(searchTerm.toLowerCase());

        // Filtro por categoria
        if (selectedCategory === 'all') {
            return matchesSearch;
        }

        const categoryKeywords = categoryMap[selectedCategory] || [];
        const matchesCategory = categoryKeywords.some(keyword =>
            store.name.toLowerCase().includes(keyword)
        );

        return matchesSearch && matchesCategory;
    });

    const handleStoreClick = (subdomain: string) => {
        navigate(`/${subdomain}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-400 text-lg">Carregando lojas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Header */}
            <div className="bg-black/50 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                        <div className="flex-1">
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                🍔 FoodHub
                            </h1>
                            <p className="text-gray-400 mt-1">Descubra as melhores lojas da região</p>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                            <span className="text-sm text-gray-400 whitespace-nowrap">
                                <TrendingUp className="inline h-4 w-4 mr-1" />
                                {stores.length} lojas disponíveis
                            </span>

                            <button
                                onClick={() => navigate('/pricing')}
                                className="w-full md:w-auto px-4 py-2 text-gray-300 hover:text-orange-400 transition-colors font-medium border border-gray-700 rounded-lg md:border-0 md:rounded-none"
                            >
                                Como Funciona
                            </button>

                            <button
                                onClick={() => navigate('/cadastro')}
                                className="hidden md:inline-flex px-4 py-2 text-gray-300 border border-gray-700 rounded-lg hover:text-orange-400 hover:border-orange-500 transition-colors font-medium items-center gap-2"
                            >
                                <StoreIcon className="h-4 w-4" />
                                Cadastro de Loja
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome da loja ou cidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Store Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Category Filter */}
                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                />

                {filteredStores.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-300 mb-2">
                            {searchTerm ? 'Nenhuma loja encontrada' : 'Nenhuma loja cadastrada ainda'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Tente buscar por outro termo' : 'Em breve teremos lojas disponíveis!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStores.map((store, index) => (
                            <ScrollReveal
                                key={store.id}
                                delay={index * 100}
                                direction="up"
                            >
                                <div>
                                    {/* Card animado com produtos rotacionando */}
                                    <AnimatedStoreCard
                                        store={store}
                                        onClick={() => handleStoreClick(store.subdomain)}
                                    />

                                    {/* Content (info da loja) */}
                                    <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-b-2xl border-x border-b border-gray-700">
                                        {/* Header com nome e logo */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold text-white mb-2 hover:text-orange-500 transition-colors">
                                                    {store.name}
                                                </h3>

                                                {/* Info */}
                                                <div className="space-y-2">
                                                    {store.address && (
                                                        <div className="flex items-start gap-2 text-gray-400 text-sm">
                                                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                            <span className="truncate">
                                                                {store.city && `${store.city}`}
                                                                {store.state && ` - ${store.state}`}
                                                                {store.distance && (
                                                                    <span className="text-orange-400 font-semibold ml-1">
                                                                        • {formatDistance(store.distance)}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                        <Clock className="h-4 w-4 flex-shrink-0" />
                                                        <span>
                                                            {store.opening_time} - {store.closing_time}
                                                        </span>
                                                    </div>

                                                    {/* Rating */}
                                                    <div className="flex items-center gap-1 text-yellow-500">
                                                        <Star className="h-4 w-4 fill-current" />
                                                        <Star className="h-4 w-4 fill-current" />
                                                        <Star className="h-4 w-4 fill-current" />
                                                        <Star className="h-4 w-4 fill-current" />
                                                        <Star className="h-4 w-4" />
                                                        <span className="text-gray-400 text-sm ml-1">(4.0)</span>
                                                    </div>

                                                    {/* Número de produtos */}
                                                    {store.menu_items.length > 0 && (
                                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                            <UtensilsCrossed className="h-4 w-4" />
                                                            <span>{store.menu_items.length}+ produtos disponíveis</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Logo redondo da loja */}
                                            {store.logo_url && (
                                                <div className="ml-4 flex-shrink-0">
                                                    <div className="w-20 h-20 rounded-full border-4 border-gray-700 overflow-hidden shadow-xl bg-white">
                                                        <img
                                                            src={store.logo_url}
                                                            alt={store.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* CTA Button */}
                                        <button
                                            onClick={() => handleStoreClick(store.subdomain)}
                                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all hover:shadow-lg hover:shadow-orange-500/50"
                                        >
                                            Ver Cardápio Completo →
                                        </button>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-black/50 border-t border-gray-800 mt-20 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 space-y-3">
                    <button
                        onClick={() => navigate('/cadastro')}
                        className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                    >
                        Tem uma loja? Cadastre-se
                    </button>
                    <p>© 2026 FoodHub - Todas as lojas em um só lugar</p>
                </div>
            </footer>
        </div>
    );
}
