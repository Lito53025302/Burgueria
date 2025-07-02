import React from 'react';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { MenuItem } from '../../types';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string, available: boolean) => void;
}

export function MenuItemCard({ item, onEdit, onDelete, onToggleAvailability }: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {item.available ? 'Disponível' : 'Indisponível'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.category}</p>
          </div>
          <span className="text-xl font-bold text-green-600">
            R$ {item.price.toFixed(2)}
          </span>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{item.soldCount}</span> vendas
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleAvailability(item.id, !item.available)}
              className={`p-2 rounded-lg transition-colors ${
                item.available 
                  ? 'bg-red-50 hover:bg-red-100 text-red-600' 
                  : 'bg-green-50 hover:bg-green-100 text-green-600'
              }`}
              title={item.available ? 'Tornar indisponível' : 'Tornar disponível'}
            >
              {item.available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => onEdit(item)}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
              title="Editar item"
            >
              <Edit className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
              title="Excluir item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}