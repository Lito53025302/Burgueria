import {
    Pizza,
    Coffee,
    IceCream,
    Salad,
    Soup,
    Beef,
    Fish,
    Sandwich,
    Cookie,
    Sparkles
} from 'lucide-react';

interface Category {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
}

interface CategoryFilterProps {
    selectedCategory: string;
    onCategoryChange: (categoryId: string) => void;
}

const categories: Category[] = [
    {
        id: 'all',
        name: 'Todos',
        icon: <Sparkles className="w-6 h-6" />,
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'burger',
        name: 'Hambúrgueres',
        icon: <Sandwich className="w-6 h-6" />,
        color: 'from-orange-500 to-red-500'
    },
    {
        id: 'pizza',
        name: 'Pizzas',
        icon: <Pizza className="w-6 h-6" />,
        color: 'from-red-500 to-orange-600'
    },
    {
        id: 'japanese',
        name: 'Japonês',
        icon: <Fish className="w-6 h-6" />,
        color: 'from-red-600 to-pink-600'
    },
    {
        id: 'mexican',
        name: 'Mexicano',
        icon: <Soup className="w-6 h-6" />,
        color: 'from-yellow-500 to-orange-500'
    },
    {
        id: 'healthy',
        name: 'Saudável',
        icon: <Salad className="w-6 h-6" />,
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 'drinks',
        name: 'Bebidas',
        icon: <Coffee className="w-6 h-6" />,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'desserts',
        name: 'Sobremesas',
        icon: <IceCream className="w-6 h-6" />,
        color: 'from-pink-500 to-rose-500'
    },
    {
        id: 'grill',
        name: 'Churrasco',
        icon: <Beef className="w-6 h-6" />,
        color: 'from-amber-600 to-orange-700'
    },
    {
        id: 'bakery',
        name: 'Padaria',
        icon: <Cookie className="w-6 h-6" />,
        color: 'from-yellow-600 to-amber-600'
    }
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
    return (
        <div className="mb-8">
            {/* Título */}
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-white">Categorias</h2>
                <p className="text-gray-400 text-sm">Encontre o que você procura</p>
            </div>

            {/* Filtros - Scroll horizontal no mobile */}
            <div className="relative">
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                    {categories.map((category) => {
                        const isSelected = selectedCategory === category.id;

                        return (
                            <button
                                key={category.id}
                                onClick={() => onCategoryChange(category.id)}
                                className={`
                                    group relative flex-shrink-0 snap-start
                                    flex flex-col items-center justify-center
                                    min-w-[100px] h-[100px] rounded-2xl
                                    transition-all duration-300
                                    ${isSelected
                                        ? 'scale-105 shadow-2xl'
                                        : 'hover:scale-105 hover:shadow-xl'
                                    }
                                `}
                            >
                                {/* Background gradient */}
                                <div className={`
                                    absolute inset-0 rounded-2xl bg-gradient-to-br ${category.color}
                                    ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'}
                                    transition-opacity duration-300
                                `} />

                                {/* Brilho/Glow effect */}
                                {isSelected && (
                                    <div className={`
                                        absolute inset-0 rounded-2xl bg-gradient-to-br ${category.color}
                                        blur-xl opacity-50 animate-pulse
                                    `} />
                                )}

                                {/* Conteúdo */}
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    {/* Ícone */}
                                    <div className={`
                                        text-white transition-transform duration-300
                                        ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
                                    `}>
                                        {category.icon}
                                    </div>

                                    {/* Nome */}
                                    <span className={`
                                        text-white text-xs font-bold text-center px-2
                                        ${isSelected ? 'opacity-100' : 'opacity-90'}
                                    `}>
                                        {category.name}
                                    </span>
                                </div>

                                {/* Indicador de seleção */}
                                {isSelected && (
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Gradient fade nas bordas (mobile) */}
                <div className="absolute top-0 left-0 bottom-4 w-8 bg-gradient-to-r from-black to-transparent pointer-events-none md:hidden" />
                <div className="absolute top-0 right-0 bottom-4 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none md:hidden" />
            </div>

            {/* Contador de lojas filtradas */}
            {selectedCategory !== 'all' && (
                <div className="mt-4 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full text-sm text-gray-300 border border-gray-700">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        Mostrando lojas de {categories.find(c => c.id === selectedCategory)?.name}
                    </span>
                </div>
            )}
        </div>
    );
}
