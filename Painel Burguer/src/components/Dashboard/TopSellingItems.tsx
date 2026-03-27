import React from 'react';
import { Crown, TrendingUp } from 'lucide-react';
import { MenuItem } from '../../types';

interface TopSellingItemsProps {
  items: MenuItem[];
}

export function TopSellingItems({ items }: TopSellingItemsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-yellow-50 p-2 rounded-lg">
          <Crown className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Mais Vendidos</h3>
          <p className="text-sm text-gray-600">Top 5 itens do cardápio</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-100 text-gray-800' :
                index === 2 ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {index + 1}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
              <p className="text-xs text-gray-600">{item.category}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{item.soldCount} vendas</p>
                <p className="text-xs text-gray-600">R$ {item.price.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}