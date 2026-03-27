import { useState, useEffect } from 'react';
import { ShoppingCart, Menu as MenuIcon, X, User, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  cartItemCount: number;
  onCartToggle: () => void;
  onProfileToggle: () => void;
  storeLogoUrl?: string | null;
  storeName?: string;
  openingTime?: string;
  closingTime?: string;
}

const Header = ({ cartItemCount, onCartToggle, onProfileToggle, storeLogoUrl, storeName, openingTime, closingTime }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useCustomerAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const { subdomain } = useParams<{ subdomain: string }>();

  const handleProfileClick = () => {
    if (user) {
      onProfileToggle();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleBackToMarketplace = () => {
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { name: 'Cardápio', href: '#menu' },
    { name: 'Sobre', href: '#about' },
    { name: 'Contato', href: '#contact' },
  ];

  const primaryColor = 'var(--primary-color, #facc15)';

  const parseTimeToMinutes = (time?: string) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const getStoreStatus = () => {
    const openingMinutes = parseTimeToMinutes(openingTime);
    const closingMinutes = parseTimeToMinutes(closingTime);

    if (openingMinutes === null || closingMinutes === null) {
      return {
        label: 'HORÁRIO INDISPONÍVEL',
        className: 'bg-gray-600 text-white'
      };
    }

    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const isOvernightSchedule = closingMinutes <= openingMinutes;

    let isOpen = false;
    let minutesUntilClose = 0;

    if (!isOvernightSchedule) {
      isOpen = nowMinutes >= openingMinutes && nowMinutes < closingMinutes;
      if (isOpen) minutesUntilClose = closingMinutes - nowMinutes;
    } else {
      isOpen = nowMinutes >= openingMinutes || nowMinutes < closingMinutes;
      if (isOpen) {
        minutesUntilClose = nowMinutes >= openingMinutes
          ? (24 * 60 - nowMinutes) + closingMinutes
          : closingMinutes - nowMinutes;
      }
    }

    if (!isOpen) {
      return { label: 'FECHADO', className: 'bg-red-500 text-white' };
    }

    if (minutesUntilClose <= 40) {
      return { label: 'FECHA EM BREVE', className: 'bg-amber-500 text-white' };
    }

    return { label: 'ABERTO', className: 'bg-green-500 text-white' };
  };

  const storeStatus = getStoreStatus();

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
            {/* Logo com botão de voltar */}
            <div className="flex items-center gap-3">
              {/* Botão de voltar (aparece quando está em uma loja) */}
              {subdomain && (
                <button
                  onClick={handleBackToMarketplace}
                  className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-105 border border-gray-700 hover:border-yellow-500/50 flex items-center gap-2 text-gray-300 hover:text-yellow-400"
                  title="Voltar para o marketplace"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Voltar</span>
                </button>
              )}

              {storeLogoUrl ? (
                <img
                  src={storeLogoUrl}
                  alt={storeName || 'Logo da loja'}
                  className="w-14 h-14 rounded-full object-cover border-2"
                  style={{ borderColor: primaryColor }}
                />
              ) : (
                <span className="text-xl font-bold text-white">
                  {storeName || 'Loja'}
                </span>
              )}

              <span className={`hidden md:inline-flex px-3 py-1 rounded-full text-xs font-bold ${storeStatus.className}`}>
                {storeStatus.label}
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors duration-300 relative group"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = primaryColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '';
                  }}
                >
                  {link.name}
                  <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: primaryColor }}
                  ></span>
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Profile Button */}
              <button
                onClick={handleProfileClick}
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 border flex items-center gap-2 ${user
                  ? 'hover:bg-yellow-500/20'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                  }`}
                style={user
                  ? {
                    backgroundColor: 'color-mix(in srgb, var(--primary-color, #facc15) 10%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--primary-color, #facc15) 45%, transparent)',
                    color: primaryColor
                  }
                  : undefined}
                title={user ? "Minha Conta" : "Fazer Login"}
              >
                <User className="w-5 h-5" />
                {user && <span className="text-sm font-medium hidden md:inline">{user.user_metadata?.name?.split(' ')[0] || 'Perfil'}</span>}
              </button>

              {/* Cart Button */}
              <button
                onClick={onCartToggle}
                className="relative p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-105 border border-gray-700"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary-color, #facc15) 50%, transparent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '';
                }}
              >
                <ShoppingCart className="w-5 h-5 text-gray-300" />
                {cartItemCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse"
                    style={{ backgroundColor: primaryColor }}
                  >
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
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${storeStatus.className}`}>
                  {storeStatus.label}
                </div>
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block text-gray-300 font-medium transition-colors duration-300 py-2"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = primaryColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '';
                    }}
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
