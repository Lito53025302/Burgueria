import React from 'react';
import { BarChart3 } from 'lucide-react';

interface RevenueChartProps {
  dailyRevenue: number[];
  weeklyRevenue: number[];
  monthlyRevenue: number[];
}

export function RevenueChart({ dailyRevenue, weeklyRevenue }: RevenueChartProps) {
  const maxDaily = Math.max(...dailyRevenue);
  const maxWeekly = Math.max(...weeklyRevenue);
  
  const dailyLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const weeklyLabels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Receita</h3>
            <p className="text-sm text-gray-600">Últimos 7 dias e semanas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Revenue */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Receita Diária</h4>
          <div className="space-y-3">
            {dailyRevenue.map((value, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600 w-8">
                  {dailyLabels[index]}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(value / maxDaily) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  R$ {value.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Revenue */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Receita Semanal</h4>
          <div className="space-y-3">
            {weeklyRevenue.map((value, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-600 w-12">
                  {weeklyLabels[index]}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(value / maxWeekly) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  R$ {(value / 1000).toFixed(1)}k
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}