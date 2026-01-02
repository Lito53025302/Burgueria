import { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { MenuItem } from '../../types';
import { supabase } from '../../lib/supabase';

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

export function MenuItemForm({ isOpen, onClose, onSubmit, editItem }: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: categories[0],
    available: true
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('❌ Tipo de arquivo inválido! Use apenas: JPEG, PNG, GIF ou WebP');
        return;
      }

      // Validar tamanho (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB em bytes
      if (file.size > maxSize) {
        alert('❌ Arquivo muito grande! Tamanho máximo: 5MB');
        return;
      }

      console.log('📤 Iniciando upload...', {
        nome: file.name,
        tipo: file.type,
        tamanho: `${(file.size / 1024).toFixed(2)} KB`
      });

      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('📂 Enviando para bucket "products":', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload concluído:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      console.log('🔗 URL pública gerada:', publicUrl);

      setFormData({ ...formData, image: publicUrl });
      alert('✅ Imagem enviada com sucesso!');

    } catch (error: any) {
      console.error('❌ Erro completo:', error);

      let errorMessage = 'Erro ao fazer upload da imagem';

      if (error.message?.includes('new row violates row-level security')) {
        errorMessage = '🔒 Erro de permissão! O bucket "products" precisa ter políticas de acesso configuradas.\n\nVeja o arquivo CONFIGURAR_STORAGE.md para instruções.';
      } else if (error.message?.includes('Bucket not found')) {
        errorMessage = '📦 Bucket "products" não encontrado!\n\nVocê precisa criar o bucket no Supabase Storage.\n\nVeja o arquivo CONFIGURAR_STORAGE.md para instruções.';
      } else if (error.message) {
        errorMessage = `❌ ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setUploading(false);
      // Limpar o input para permitir re-upload do mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        description: editItem.description,
        price: editItem.price.toString(),
        image: editItem.image,
        category: editItem.category,
        available: editItem.available
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        category: categories[0],
        available: true
      });
    }
  }, [editItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: formData.category,
      available: formData.available
    });

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto do Produto
            </label>
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative h-64 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${formData.image
                ? 'border-green-500 bg-green-50/5'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-gray-100'
                }`}
            >
              {formData.image ? (
                <>
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-white p-3 rounded-full text-red-600 shadow-lg hover:scale-110 transition-transform" onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, image: '' });
                    }}>
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
                      <p className="text-lg text-gray-700 font-bold">📸 Clique para selecionar a foto</p>
                      <p className="text-sm text-gray-500 mt-2">Envio direto para Supabase Storage</p>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-gray-400">✓ JPG, PNG, GIF ou WebP</p>
                        <p className="text-xs text-gray-400">✓ Tamanho máximo: 5MB</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
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
              {editItem ? 'Atualizar' : 'Adicionar'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}