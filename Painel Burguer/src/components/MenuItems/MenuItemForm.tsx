import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Upload, Loader2, Sparkles } from 'lucide-react';
import { MenuItem } from '../../types';
import { supabase } from '../../lib/supabase';
import { CustomizationSelector } from './CustomizationSelector';
import { ImageEnhancer } from '../ImageEnhancer';

interface MenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<MenuItem, 'id' | 'createdAt' | 'soldCount'>) => void;
  editItem?: MenuItem | null;
}

const categories = [
  'Hambúrguer',
  'Pizza',
  'Salada',
  'Massas',
  'Bebidas',
  'Sobremesas',
  'Petiscos'
];

const spiceLevels: { value: 'none' | 'suave' | 'medio' | 'forte' | 'extra_forte'; label: string; emoji: string; color: string }[] = [
  { value: 'none', label: 'Sem', emoji: '🚫', color: 'gray' },
  { value: 'suave', label: 'Suave', emoji: '🌶️', color: 'green' },
  { value: 'medio', label: 'Médio', emoji: '🌶️🌶️', color: 'yellow' },
  { value: 'forte', label: 'Forte', emoji: '🌶️🌶️🌶️', color: 'orange' },
  { value: 'extra_forte', label: 'Extra', emoji: '🌶️🌶️🌶️🔥', color: 'red' }
];

const MENU_ITEM_DRAFT_KEY = 'painel_menu_item_form_draft_v1';
const EMPTY_FORM_DATA = {
  name: '',
  description: '',
  price: '',
  image: '',
  galleryImages: [] as string[],
  category: categories[0],
  available: true,
  customizations: [] as { name: string; price: string }[],
  spiceLevel: 'none' as const,
  prepTimeMin: ''
};

export function MenuItemForm({ isOpen, onClose, onSubmit, editItem }: MenuItemFormProps) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    image: string;
    galleryImages: string[];
    category: string;
    available: boolean;
    customizations: { name: string; price: string }[];
    spiceLevel: 'none' | 'suave' | 'medio' | 'forte' | 'extra_forte';
    prepTimeMin: string;
  }>(EMPTY_FORM_DATA);
  const [uploading, setUploading] = useState(false);
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const uploadImageToStorage = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
    return publicUrl;
  };

  const validateImageFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo inválido! Use apenas: JPEG, PNG, GIF ou WebP');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande! Tamanho máximo: 5MB');
    }
  };

  const handleMainFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      validateImageFile(file);

      setUploadedFile(file);
      const publicUrl = await uploadImageToStorage(file);
      setFormData((prev) => ({ ...prev, image: publicUrl }));
      alert('✅ Foto principal enviada com sucesso!');

    } catch (error) {
      alert(`❌ Erro: ${error instanceof Error ? error.message : 'Falha no upload'}`);
    } finally {
      if (mainFileInputRef.current) mainFileInputRef.current.value = '';
      setUploading(false);
    }
  };

  const handleGalleryFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const currentTotalImages = (formData.image ? 1 : 0) + formData.galleryImages.length;
      if (currentTotalImages >= 5) {
        alert('⚠️ Limite atingido: máximo de 5 fotos por produto.');
        return;
      }

      validateImageFile(file);
      const publicUrl = await uploadImageToStorage(file);

      setFormData((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, publicUrl].slice(0, 4)
      }));
      alert('✅ Foto adicional enviada com sucesso!');
    } catch (error) {
      alert(`❌ Erro: ${error instanceof Error ? error.message : 'Falha ao enviar imagem'}`);
    } finally {
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
      setUploading(false);
    }
  };

  const handleImageEnhanced = async (enhancedFile: File) => {
    // Substituir arquivo e fazer upload da versão melhorada
    setUploadedFile(enhancedFile);
    try {
      const publicUrl = await uploadImageToStorage(enhancedFile);
      setFormData((prev) => ({ ...prev, image: publicUrl }));
    } catch (error) {
      alert(`❌ Erro: ${error instanceof Error ? error.message : 'Falha ao enviar imagem melhorada'}`);
    } finally {
      setUploading(false);
    }
  };

  const hasUnsavedData = useMemo(() =>
    !!formData.name.trim() ||
    !!formData.description.trim() ||
    !!formData.price.trim() ||
    !!formData.image.trim() ||
    formData.galleryImages.length > 0 ||
    !!formData.prepTimeMin.trim() ||
    formData.customizations.length > 0
  , [formData]);

  useEffect(() => {
    if (!isOpen) return;

    if (editItem) {
      setFormData({
        name: editItem.name,
        description: editItem.description,
        price: editItem.price.toString(),
        image: editItem.image,
        galleryImages: editItem.galleryImages || [],
        category: editItem.category,
        available: editItem.available,
        customizations: (editItem.customizations || []).map(c => ({
          name: c.name,
          price: c.price.toString()
        })),
        spiceLevel: editItem.spiceLevel || 'none',
        prepTimeMin: editItem.prepTimeMin?.toString() || ''
      });
    } else {
      try {
        const rawDraft = sessionStorage.getItem(MENU_ITEM_DRAFT_KEY);
        if (rawDraft) {
          const parsedDraft = JSON.parse(rawDraft) as Partial<typeof EMPTY_FORM_DATA>;
          setFormData({
            ...EMPTY_FORM_DATA,
            ...parsedDraft,
            galleryImages: Array.isArray(parsedDraft.galleryImages) ? parsedDraft.galleryImages : []
          });
        } else {
          setFormData(EMPTY_FORM_DATA);
        }
      } catch {
        setFormData(EMPTY_FORM_DATA);
      }
    }
  }, [editItem, isOpen]);

  useEffect(() => {
    if (!isOpen || !!editItem) return;

    if (hasUnsavedData) {
      sessionStorage.setItem(MENU_ITEM_DRAFT_KEY, JSON.stringify(formData));
    } else {
      sessionStorage.removeItem(MENU_ITEM_DRAFT_KEY);
    }
  }, [formData, isOpen, editItem, hasUnsavedData]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isOpen || !hasUnsavedData) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isOpen, hasUnsavedData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      galleryImages: formData.galleryImages,
      category: formData.category,
      available: formData.available,
      customizations: formData.customizations
        .filter(c => c.name.trim() !== '')
        .map(c => ({ name: c.name, price: parseFloat(c.price) || 0 })),
      spiceLevel: formData.spiceLevel,
      prepTimeMin: formData.prepTimeMin ? parseInt(formData.prepTimeMin) : undefined
    });

    if (!editItem) {
      sessionStorage.removeItem(MENU_ITEM_DRAFT_KEY);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editItem ? 'Editar Item' : 'Adicionar Novo Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Item *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Nível de Picância e Tempo de Preparo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nível de Picância */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Picância
              </label>
              <div className="grid grid-cols-3 gap-2">
                {spiceLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, spiceLevel: level.value })}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${formData.spiceLevel === level.value
                      ? `border-${level.color}-500 bg-${level.color}-50 shadow-md`
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <span className="text-2xl">{level.emoji}</span>
                    <span className="text-xs font-medium">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tempo de Preparo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo de Preparo (minutos)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Ex: 15"
                  value={formData.prepTimeMin}
                  onChange={(e) => setFormData({ ...formData, prepTimeMin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-500">min</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Deixe vazio se não se aplica</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotos do Produto
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Até 5 fotos por produto: 1 principal (fixa) + até 4 adicionais.
            </p>

            <div className="space-y-3">
              <div
                onClick={() => !uploading && mainFileInputRef.current?.click()}
                className={`relative h-64 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${formData.image
                  ? 'border-green-500 bg-green-50/5'
                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-gray-100'
                  }`}
              >
                {formData.image ? (
                  <>
                    <img
                      src={formData.image}
                      alt="Foto principal"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                      Principal
                    </div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div
                        className="bg-white p-3 rounded-full text-red-600 shadow-lg hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({ ...prev, image: '' }));
                        }}
                      >
                        <X className="h-6 w-6" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-lg text-blue-600 font-bold">Enviando para o servidor...</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-blue-100 p-5 rounded-full inline-block mb-4">
                          <Upload className="h-10 w-10 text-blue-600" />
                        </div>
                        <p className="text-lg text-gray-700 font-bold">📸 Clique para enviar a foto principal</p>
                        <p className="text-sm text-gray-500 mt-2">Essa imagem fica fixa na vitrine</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {formData.image && (
                <button
                  type="button"
                  onClick={() => mainFileInputRef.current?.click()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Trocar Foto Principal
                </button>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Fotos adicionais ({formData.galleryImages.length}/4)</h4>
                <button
                  type="button"
                  onClick={() => galleryFileInputRef.current?.click()}
                  disabled={uploading || formData.galleryImages.length >= 4}
                  className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Adicionar Foto
                </button>
              </div>

              {formData.galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.galleryImages.map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img src={imageUrl} alt={`Foto adicional ${index + 1}`} className="w-full h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            galleryImages: prev.galleryImages.filter((_, itemIndex) => itemIndex !== index)
                          }))
                        }
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black"
                        aria-label="Remover foto adicional"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Adicione fotos extras para enriquecer o card na vitrine.</p>
              )}
            </div>

            {/* Botão Melhorar com IA */}
            {formData.image && uploadedFile && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowEnhancer(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-md hover:shadow-lg"
                >
                  <Sparkles className="h-5 w-5" />
                  ✨ Melhorar com IA
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Aumente a qualidade ou remova o fundo da imagem
                </p>
              </div>
            )}

            <input
              type="file"
              ref={mainFileInputRef}
              onChange={handleMainFileUpload}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={galleryFileInputRef}
              onChange={handleGalleryFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Complementos (Customizations) */}
          <div className="border-t border-gray-100 pt-4">
            <CustomizationSelector
              selectedCustomizations={formData.customizations}
              onCustomizationsChange={(customizations) => setFormData({ ...formData, customizations })}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
              Item disponível para venda
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {editItem ? 'Atualizar Item' : 'Criar Item'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de IA */}
      {showEnhancer && uploadedFile && (
        <ImageEnhancer
          originalImage={uploadedFile}
          onImageEnhanced={handleImageEnhanced}
          onClose={() => setShowEnhancer(false)}
        />
      )}
    </div>
  );
}
