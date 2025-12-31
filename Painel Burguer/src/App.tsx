import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useAdmin } from './hooks/useAdmin';
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
import { RegisterEntregador } from './components/RegisterEntregador';
import { ErrorBoundary } from './components/ErrorBoundary';

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
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (authLoading || (user && adminLoading)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">
            Você não tem permissão de administrador para acessar este painel.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
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
        <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;