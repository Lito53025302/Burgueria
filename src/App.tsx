import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import { useRewards } from './hooks/useRewards';
import IntroAnimation from './components/IntroAnimation';
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

import UserProfile from './components/UserProfile';

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

  const [isContadorGameOpen, setIsContadorGameOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Detectar parâmetros da URL para ações PWA
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action === 'game' && userRewards.canSpin) {
      setIsContadorGameOpen(true);
    } else if (action === 'order') {
      toggleCart();
    }
  }, []);

  const handleOrderComplete = (amount: number) => {
    addPurchase(amount); // Incrementa o contador de compras

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
          redeemReward(); // Bloqueia até próxima compra
        }}
        canPlay={userRewards.canSpin}
      />

      <PWAInstaller />
    </div>
  );
}

import { AuthProvider } from './contexts/CustomerAuthContext';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <PWAInstallButton />
          <Routes>
            <Route path="/" element={<MainLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
