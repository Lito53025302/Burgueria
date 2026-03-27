import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import { useRewards } from './hooks/useRewards';
import { useStoreTenant } from './hooks/useStoreTenant';
import { supabase } from './lib/supabase';
import SplashScreen from './components/SplashScreen';
import Header from './components/Header';
import Hero from './components/Hero';
import Menu from './components/Menu';
import Cart from './components/Cart';
import About from './components/About';
import Contact from './components/Contact';
import RewardFloatingButton from './components/RewardFloatingButton';
import { PWAInstallButton } from './components/PWAInstall';
import PWAInstaller from './components/PWAInstaller';
import ContadorGame from './components/ContadorGame';
import { ErrorBoundary } from './components/ErrorBoundary';
import StoreMarketplace from './components/StoreMarketplace';
import UserProfile from './components/UserProfile';
import StoreSignup from './components/StoreSignup';
import PricingPage from './components/PricingPage';
import SuperAdminLayout from './components/SuperAdmin/SuperAdminLayout';
import { AuthProvider, useCustomerAuth } from './contexts/CustomerAuthContext';

function MainLayout() {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isOpen: isCartOpen,
    toggleCart,
    totalItems,
    totalPrice
  } = useCart();

  const {
    userRewards,
    addPurchase,
    redeemReward
  } = useRewards();

  const { tenant } = useStoreTenant();

  const [isContadorGameOpen, setIsContadorGameOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Detectar parâmetros da URL para ações PWA
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action === 'game' && userRewards.canSpin) {
      setIsContadorGameOpen(true);
    } else if (action === 'order') {
      toggleCart();
    }
  }, [toggleCart, userRewards.canSpin]);

  const handleOrderComplete = (amount: number, orderId?: string) => {
    addPurchase(amount); // Incrementa o contador de compras
    if (orderId) setLastOrderId(orderId);

    // Abre a tela de meus pedidos para o cliente acompanhar
    setIsProfileOpen(true);

    // Libera jogo se a compra atual foi > 30
    if (amount >= 30) {
      // Pequeno delay para garantir que o perfil renderizou antes do jogo abrir por cima
      setTimeout(() => setIsContadorGameOpen(true), 300);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        cartItemCount={totalItems}
        onCartToggle={toggleCart}
        onProfileToggle={() => setIsProfileOpen(true)}
        storeLogoUrl={tenant?.logoUrl}
        storeName={tenant?.name}
        openingTime={tenant?.openingTime}
        closingTime={tenant?.closingTime}
      />
      <Hero />
      <Menu onAddToCart={addToCart} />
      <About />
      <Contact />

      <Cart
        isOpen={isCartOpen}
        onClose={toggleCart}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        totalPrice={totalPrice}
        onOrderComplete={handleOrderComplete}
        openingTime={tenant?.openingTime}
        closingTime={tenant?.closingTime}
      />

      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <RewardFloatingButton
        userRewards={userRewards}
        onClick={() => {
          if (userRewards.canSpin) setIsContadorGameOpen(true);
        }}
        disabled={!userRewards.canSpin}
      />

      <ContadorGame
        isOpen={isContadorGameOpen}
        onClose={() => {
          setIsContadorGameOpen(false);
          setLastOrderId(null);
          redeemReward(); // Bloqueia até próxima compra
        }}
        canPlay={userRewards.canSpin}
        orderId={lastOrderId}
      />

      <PWAInstaller />
      <PWAInstallButton />
    </div>
  );
}

function SuperAdminLogin() {
  const navigate = useNavigate();
  const { user, loading } = useCustomerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    let mounted = true;
    async function checkRoleAndRedirect() {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!mounted) return;
      if (data?.role === 'super_admin') {
        navigate('/super-admin', { replace: true });
      }
    }

    checkRoleAndRedirect();
    return () => {
      mounted = false;
    };
  }, [loading, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (signInError || !authData.user) {
      setError('Credenciais inválidas.');
      setSubmitting(false);
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileData?.role !== 'super_admin') {
      await supabase.auth.signOut();
      setError('Acesso negado. Esta conta não possui permissão de Super Admin.');
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    navigate('/super-admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-900/80 border border-gray-700 rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-white">Login Super Admin</h1>
        <p className="text-gray-400 text-sm">Entre com uma conta autorizada.</p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold disabled:opacity-50"
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ProtectedSuperAdminRoute() {
  const { user, loading } = useCustomerAuth();
  const [checkingRole, setCheckingRole] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsSuperAdmin(false);
      setCheckingRole(false);
      return;
    }

    let mounted = true;
    async function checkRole() {
      setCheckingRole(true);
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!mounted) return;
      setIsSuperAdmin(data?.role === 'super_admin');
      setCheckingRole(false);
    }

    checkRole();
    return () => {
      mounted = false;
    };
  }, [loading, user]);

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/super-admin/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <SuperAdminLayout />;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Mostrar splash screen antes de tudo
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Marketplace Home */}
            <Route path="/" element={<StoreMarketplace />} />

            {/* Pricing/Assinatura */}
            <Route path="/pricing" element={<PricingPage />} />

            {/* Super Admin Dashboard */}
            <Route path="/super-admin/login" element={<SuperAdminLogin />} />
            <Route path="/super-admin" element={<ProtectedSuperAdminRoute />} />
            <Route path="/admin" element={<Navigate to="/super-admin/login" replace />} />

            {/* Cadastro de Nova Loja */}
            <Route path="/cadastro" element={<StoreSignup />} />

            {/* Loja Individual */}
            <Route path="/:subdomain" element={<MainLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
