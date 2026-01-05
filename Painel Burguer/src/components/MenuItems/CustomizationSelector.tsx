import { useEffect, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CustomizationOption {
    id: string;
    name: string;
    price: number;
    category: string;
}

interface CustomizationSelectorProps {
    selectedCustomizations: { name: string; price: string }[];
    onCustomizationsChange: (customizations: { name: string; price: string }[]) => void;
}

export function CustomizationSelector({ selectedCustomizations, onCustomizationsChange }: CustomizationSelectorProps) {
    const [availableCustomizations, setAvailableCustomizations] = useState<CustomizationOption[]>([]);
    const [showAddNew, setShowAddNew] = useState(false);
    const [newCustomization, setNewCustomization] = useState({ name: '', price: '', category: 'Molhos' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAvailableCustomizations();
    }, []);

    const fetchAvailableCustomizations = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('available_customizations')
                .select('*')
                .order('category', { ascending: true })
                .order('name', { ascending: true });

            if (error) throw error;
            setAvailableCustomizations(data || []);
        } catch (error) {
            console.error('Erro ao carregar complementos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleCustomization = (customization: CustomizationOption) => {
        const isSelected = selectedCustomizations.some(c => c.name === customization.name);

        if (isSelected) {
            // Remover
            onCustomizationsChange(
                selectedCustomizations.filter(c => c.name !== customization.name)
            );
        } else {
            // Adicionar
            onCustomizationsChange([
                ...selectedCustomizations,
                { name: customization.name, price: customization.price.toString() }
            ]);
        }
    };

    const handleAddNewCustomization = async () => {
        if (!newCustomization.name.trim() || !newCustomization.price) {
            alert('Preencha nome e preço do complemento');
            return;
        }

        try {
            const { data, error } = await (supabase as any)
                .from('available_customizations')
                .insert([{
                    name: newCustomization.name,
                    price: parseFloat(newCustomization.price),
                    category: newCustomization.category
                }])
                .select()
                .single();

            if (error) throw error;

            // Adicionar à lista local
            setAvailableCustomizations(prev => [...prev, data as CustomizationOption]);

            // Adicionar à seleção atual
            onCustomizationsChange([
                ...selectedCustomizations,
                { name: (data as any).name, price: (data as any).price.toString() }
            ]);

            // Limpar formulário
            setNewCustomization({ name: '', price: '', category: 'Molhos' });
            setShowAddNew(false);
            alert('✅ Complemento adicionado ao catálogo!');
        } catch (error: any) {
            alert(`❌ Erro: ${error.message}`);
        }
    };

    if (loading) {
        return <div className="text-center py-4 text-gray-500">Carregando complementos...</div>;
    }

    // Agrupar por categoria
    const groupedCustomizations = availableCustomizations.reduce((acc, customization) => {
        const category = customization.category || 'Outros';
        if (!acc[category]) acc[category] = [];
        acc[category].push(customization);
        return acc;
    }, {} as Record<string, CustomizationOption[]>);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-gray-900">
                    Complementos Disponíveis
                </label>
                <button
                    type="button"
                    onClick={() => setShowAddNew(!showAddNew)}
                    className="text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1"
                >
                    {showAddNew ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showAddNew ? 'Cancelar' : 'Criar Novo'}
                </button>
            </div>

            {/* Formulário para adicionar novo complemento */}
            {showAddNew && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-200">
                    <h4 className="font-semibold text-blue-900">Adicionar ao Catálogo</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Nome do complemento"
                            value={newCustomization.name}
                            onChange={(e) => setNewCustomization({ ...newCustomization, name: e.target.value })}
                            className="px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Preço (R$)"
                            value={newCustomization.price}
                            onChange={(e) => setNewCustomization({ ...newCustomization, price: e.target.value })}
                            className="px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={newCustomization.category}
                        onChange={(e) => setNewCustomization({ ...newCustomization, category: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Molhos">Molhos</option>
                        <option value="Ingredientes">Ingredientes</option>
                        <option value="Bebidas">Bebidas</option>
                        <option value="Outros">Outros</option>
                    </select>
                    <button
                        type="button"
                        onClick={handleAddNewCustomization}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        Salvar no Catálogo
                    </button>
                </div>
            )}

            {/* Lista de complementos disponíveis agrupados por categoria */}
            <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                {Object.entries(groupedCustomizations).map(([category, customizations]) => (
                    <div key={category}>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{category}</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {customizations.map((customization) => {
                                const isSelected = selectedCustomizations.some(c => c.name === customization.name);
                                return (
                                    <button
                                        key={customization.id}
                                        type="button"
                                        onClick={() => handleToggleCustomization(customization)}
                                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${isSelected
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                                }`}>
                                                {isSelected && <Check className="h-4 w-4 text-white" />}
                                            </div>
                                            <span className="font-medium text-gray-900">{customization.name}</span>
                                        </div>
                                        <span className="text-green-600 font-bold">
                                            +R$ {customization.price.toFixed(2)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Complementos selecionados */}
            {selectedCustomizations.length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <h4 className="text-sm font-bold text-green-900 mb-2">
                        Selecionados ({selectedCustomizations.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedCustomizations.map((customization, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                            >
                                {customization.name} (+R$ {parseFloat(customization.price).toFixed(2)})
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
