import React, { useState } from 'react';
import { Download, TrendingUp, Calendar, DollarSign, FileText } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';

export function Reports() {
  const { dashboardStats, orders, menuItems } = useStore();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('week');

  const generateReport = (type: string) => {
    // Simulate report generation
    const filename = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    console.log(`Gerando relatório: ${filename}`);
    alert(`Relatório ${filename} gerado com sucesso!`);
  };

  const reportTypes = [
    { id: 'sales', label: 'Vendas', icon: DollarSign, description: 'Relatório detalhado de vendas' },
    { id: 'items', label: 'Itens', icon: FileText, description: 'Performance dos itens do cardápio' },
    { id: 'orders', label: 'Pedidos', icon: TrendingUp, description: 'Histórico completo de pedidos' },
  ];

  const dateRanges = [
    { id: 'today', label: 'Hoje' },
    { id: 'week', label: 'Esta semana' },
    { id: 'month', label: 'Este mês' },
    { id: 'quarter', label: 'Este trimestre' },
    { id: 'custom', label: 'Período personalizado' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
        <p className="text-gray-600">Gere relatórios detalhados sobre seu negócio</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-xl font-bold text-gray-900">
                R$ {dashboardStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pedidos</p>
              <p className="text-xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-50 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ticket Médio</p>
              <p className="text-xl font-bold text-gray-900">
                R$ {dashboardStats.averageOrderValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-50 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Itens no Cardápio</p>
              <p className="text-xl font-bold text-gray-900">{menuItems.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Generator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Gerar Relatórios</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Report Type Selection */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Tipo de Relatório</h4>
            <div className="space-y-3">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <label
                    key={type.id}
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      reportType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type.id}
                      checked={reportType === type.id}
                      onChange={(e) => setReportType(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{type.label}</p>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Período</h4>
            <div className="space-y-3 mb-6">
              {dateRanges.map((range) => (
                <label
                  key={range.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    dateRange === range.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="dateRange"
                    value={range.id}
                    checked={dateRange === range.id}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{range.label}</span>
                </label>
              ))}
            </div>

            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Final
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => generateReport(reportType)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Gerar e Baixar Relatório</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Relatórios Recentes</h3>
        
        <div className="space-y-3">
          {[
            { name: 'relatorio-vendas-2024-01-25.csv', type: 'Vendas', date: '25/01/2024', size: '2.4 MB' },
            { name: 'relatorio-itens-2024-01-24.csv', type: 'Itens', date: '24/01/2024', size: '1.8 MB' },
            { name: 'relatorio-pedidos-2024-01-23.csv', type: 'Pedidos', date: '23/01/2024', size: '3.1 MB' },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-600">{report.type} • {report.date} • {report.size}</p>
                </div>
              </div>
              
              <button className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center space-x-1">
                <Download className="h-4 w-4" />
                <span>Baixar</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}