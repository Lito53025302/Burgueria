import { useState, useEffect, forwardRef } from 'react';
import { ShoppingCart, Menu as MenuIcon, X, User } from 'lucide-react';

import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  cartItemCount: number;
  onCartToggle: () => void;
  onProfileToggle: () => void;
}

const Header = ({ cartItemCount, onCartToggle, onProfileToggle }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useCustomerAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleProfileClick = () => {
    if (user) {
      onProfileToggle();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Cardápio', href: '#menu' },
    { name: 'Sobre', href: '#about' },
    { name: 'Contato', href: '#contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled
          ? 'bg-gray-900/95 backdrop-blur-lg border-b border-gray-800/50 shadow-2xl'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">
                Gourmet<span className="text-yellow-400">.</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-300 relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Profile Button */}
              <button
                onClick={handleProfileClick}
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 border flex items-center gap-2 ${user
                  ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                  }`}
                title={user ? "Minha Conta" : "Fazer Login"}
              >
                <User className="w-5 h-5" />
                {user && <span className="text-sm font-medium hidden md:inline">{user.user_metadata?.name?.split(' ')[0] || 'Perfil'}</span>}
              </button>

              {/* Cart Button */}
              <button
                onClick={onCartToggle}
                className="relative p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-105 border border-gray-700 hover:border-yellow-500/50"
              >
                <ShoppingCart className="w-5 h-5 text-gray-300" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>


              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 border border-gray-700"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-300" />
                ) : (
                  <MenuIcon className="w-5 h-5 text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800/50 animate-slide-down">
              <nav className="py-6 px-4 space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-300 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>



      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Header;
