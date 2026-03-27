import { useState, useEffect } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface MenuItem {
    id: string;
    name: string;
    image: string;
    price: number;
}

interface AnimatedStoreCardProps {
    store: {
        id: string;
        name: string;
        subdomain: string;
        logo_url: string | null;
        opening_time: string;
        closing_time: string;
        menu_items: MenuItem[];
    };
    onClick: () => void;
}

export default function AnimatedStoreCard({ store, onClick }: AnimatedStoreCardProps) {
    const [currentSmallIndex, setCurrentSmallIndex] = useState(1);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const parseTimeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
        return hours * 60 + minutes;
    };

    const getStoreStatus = () => {
        const openingMinutes = parseTimeToMinutes(store.opening_time);
        const closingMinutes = parseTimeToMinutes(store.closing_time);
        const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

        const isOvernightSchedule = closingMinutes <= openingMinutes;
        let isOpen = false;
        let minutesUntilClose = 0;

        if (!isOvernightSchedule) {
            isOpen = nowMinutes >= openingMinutes && nowMinutes < closingMinutes;
            if (isOpen) {
                minutesUntilClose = closingMinutes - nowMinutes;
            }
        } else {
            isOpen = nowMinutes >= openingMinutes || nowMinutes < closingMinutes;
            if (isOpen) {
                minutesUntilClose = nowMinutes >= openingMinutes
                    ? (24 * 60 - nowMinutes) + closingMinutes
                    : closingMinutes - nowMinutes;
            }
        }

        if (!isOpen) {
            return {
                label: 'FECHADO',
                badgeClass: 'bg-red-500',
                dotClass: 'bg-white'
            };
        }

        if (minutesUntilClose <= 40) {
            return {
                label: 'FECHA EM BREVE',
                badgeClass: 'bg-amber-500',
                dotClass: 'bg-white'
            };
        }

        return {
            label: 'ABERTO',
            badgeClass: 'bg-green-500',
            dotClass: 'bg-white'
        };
    };

    const storeStatus = getStoreStatus();

    // Rotacionar os 2 quadradinhos menores a cada 3 segundos
    useEffect(() => {
        // Precisa de pelo menos 4 produtos para ter rotação (1 fixo + 3 para rodar)
        if (store.menu_items.length < 4) {
            return;
        }


        const interval = setInterval(() => {
            setCurrentSmallIndex((prev) => {
                // Incrementa 1 (não 2) para ter mais variedade
                const nextIndex = prev + 1;
                // Se ultrapassar o limite, volta para 1 (pula o 0 que é fixo)
                if (nextIndex >= store.menu_items.length - 1) {
                    return 1;
                }
                return nextIndex;
            });
        }, 3000); // Muda a cada 3 segundos

        return () => {
            clearInterval(interval);
        };
    }, [store.menu_items.length, store.name]);

    // Pegar os produtos para exibir
    const mainProduct = store.menu_items[0]; // Produto grande (fixo)
    const smallProducts = store.menu_items.length > 1
        ? [
            store.menu_items[currentSmallIndex % store.menu_items.length],
            store.menu_items[(currentSmallIndex + 1) % store.menu_items.length]
        ]
        : [];

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-orange-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20"
        >
            {/* Grid de Produtos (3 fotos com animação) */}
            {store.menu_items && store.menu_items.length > 0 ? (
                <div className="relative">
                    {/* Badge Status */}
                    <div className={`absolute top-4 right-4 ${storeStatus.badgeClass} text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-20`}>
                        <div className={`w-2 h-2 ${storeStatus.dotClass} rounded-full animate-pulse`}></div>
                        {storeStatus.label}
                    </div>

                    {/* Nome da Loja Sobreposto */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent z-10 p-4">
                        <h3 className="text-xl font-bold text-white truncate">
                            {store.name}
                        </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-1 h-48 bg-gray-900">
                        {/* Produto grande (fixo) - col-span-2 row-span-2 */}
                        {mainProduct && (
                            <div className="relative overflow-hidden col-span-2 row-span-2">
                                <img
                                    src={mainProduct.image}
                                    alt={mainProduct.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                    <span className="text-white font-bold text-sm truncate">
                                        {mainProduct.name}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Produtos pequenos (animados) */}
                        {smallProducts.map((item, index) => (
                            <div
                                key={`${item.id}-${currentSmallIndex}-${index}`}
                                className="relative overflow-hidden"
                                style={{
                                    animation: 'fadeIn 0.5s ease-in-out'
                                }}
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Adicionar keyframes CSS */}
                    <style>{`
                        @keyframes fadeIn {
                            from {
                                opacity: 0;
                                transform: scale(0.95);
                            }
                            to {
                                opacity: 1;
                                transform: scale(1);
                            }
                        }
                    `}</style>
                </div>
            ) : (
                // Fallback se não tiver produtos
                <div className="h-48 bg-gradient-to-r from-orange-500 to-red-500 flex flex-col items-center justify-center">
                    <h3 className="text-white text-xl font-bold mb-2">{store.name}</h3>
                    <UtensilsCrossed className="h-16 w-16 text-white/50" />
                </div>
            )}
        </div>
    );
}
