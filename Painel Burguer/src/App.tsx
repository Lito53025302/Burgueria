import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { MenuItems } from './components/MenuItems/MenuItems';
import { Orders } from './components/Orders/Orders';
import { StoreStatus } from './components/StoreStatus/StoreStatus';
import { Reports } from './components/Reports/Reports';
import { Settings } from './components/Settings/Settings';
import { TestSupabase } from './components/TestSupabase';
import { RegisterEntregador } from './components/RegisterEntregador';

const sectionTitles = {
  dashboard: 'Dashboard',
  items: 'Gerenciar Cardápio',
  orders: 'Gerenciar Pedidos',
  'store-status': 'Status da Loja',
  reports: 'Relatórios',
  settings: 'Configurações',
  entregadores: 'Entregadores', // Novo título
};

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'items':
        return <MenuItems />;
      case 'orders':
        return <Orders />;
      case 'store-status':
        return <StoreStatus />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'entregadores':
        return <RegisterEntregador />; // Novo componente
      default:
        return <Dashboard />;
    }
  };

  return (
    <StoreProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar 
            activeSection={activeSection}
            onSectionChange={(section) => {
              setActiveSection(section);
              setSidebarOpen(false);
            }}
          />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            title={sectionTitles[activeSection as keyof typeof sectionTitles]}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          
          <main className="flex-1 overflow-y-auto p-6">
            {/* Adiciona o componente de teste do Supabase no topo para debug */}
            {/* Remova depois de testar */}
            <TestSupabase />
            {renderSection()}
          </main>
        </div>
      </div>
    </StoreProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;