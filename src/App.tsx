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
import SnakeGame from './components/SnakeGame';

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
    addPurchase
  } = useRewards();

  const [isSnakeGameOpen, setIsSnakeGameOpen] = useState(false);

  // Detectar parâmetros da URL para ações PWA
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'game') {
      setIsSnakeGameOpen(true);
    } else if (action === 'order') {
      toggleCart();
    }
  }, []);

  const handleOrderComplete = () => {
    addPurchase(); // Incrementa o contador de compras
    setIsSnakeGameOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header cartItemCount={totalItems} onCartToggle={toggleCart} />
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

      <RewardFloatingButton
        userRewards={userRewards}
        onClick={() => setIsSnakeGameOpen(true)}
      />

      <SnakeGame
        isOpen={isSnakeGameOpen}
        onClose={() => setIsSnakeGameOpen(false)}
      />

      <PWAInstaller />
    </div>
  );
}

function App() {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <BrowserRouter>
      <PWAInstallButton />
      <Routes>
        <Route path="/" element={<MainLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
