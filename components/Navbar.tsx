import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LayoutGrid, ShoppingBag, Instagram } from 'lucide-react';
import { dataService } from '../services/dataService';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = dataService.isAdmin();
  const { itemsCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  
  // Secret Access State
  const [clickCount, setClickCount] = useState(0);

  const handleLogout = () => {
    dataService.logout();
    window.location.reload();
  };

  const handleSecretAccess = () => {
    setClickCount(prev => prev + 1);
    if (clickCount + 1 === 3) {
        navigate('/login');
        setClickCount(0);
    }
    // Reset count after 1 second if not clicked enough
    setTimeout(() => setClickCount(0), 1000);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        scrolled 
          ? 'bg-brand-dark/90 backdrop-blur-md py-3 shadow-xl border-white/5' 
          : 'bg-transparent py-6 border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-3 md:gap-4 group z-50 relative select-none">
            <img 
              src="https://i.imgur.com/KFvjnX6.jpeg" 
              alt="Remaking Agency" 
              className="h-10 md:h-12 w-auto group-hover:scale-105 transition-transform duration-300 rounded-sm" 
            />
            <div className="flex flex-col">
               <span className="text-white font-display font-bold text-lg md:text-xl leading-none tracking-wide group-hover:text-gray-300 transition-colors uppercase">
                  Remaking <span className="text-pickle-400 group-hover:text-white transition-colors">Agency</span>
               </span>
               <span 
                 onClick={(e) => { e.preventDefault(); handleSecretAccess(); }}
                 className="text-gray-400 text-[9px] md:text-[10px] uppercase tracking-[0.35em] font-medium opacity-70 hover:opacity-100 hover:text-white transition-all cursor-default"
               >
                  Fotografia Esportiva
               </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
             <Link 
                to="/" 
                className={`px-4 py-2 text-white font-bold uppercase text-xs tracking-wider transition-all rounded-full hover:bg-white/5 ${location.pathname === '/' ? 'text-pickle' : 'text-gray-300'}`}
             >
                Galeria
             </Link>
             
             <a 
                href="https://instagram.com/remakingagency" 
                target="_blank" 
                rel="noreferrer" 
                className="px-4 py-2 text-white hover:text-white font-bold uppercase text-xs tracking-wider transition-all rounded-full hover:bg-white/5 flex items-center gap-2 group"
             >
                <Instagram className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors" />
                Instagram
             </a>

             {/* Desktop Cart Trigger */}
             <button 
                onClick={openCart}
                className="ml-4 flex items-center gap-2 px-5 py-2.5 bg-white text-brand-dark rounded-full font-bold uppercase text-xs tracking-wide hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
             >
                <div className="relative">
                    <ShoppingBag className="w-4 h-4" />
                    {itemsCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-white"></span>
                    )}
                </div>
                <span>Minha Seleção {itemsCount > 0 && `(${itemsCount})`}</span>
             </button>

            {isAdmin && (
              <div className="flex items-center space-x-2 pl-4 ml-4 border-l border-white/10">
                <Link 
                  to="/admin" 
                  className={`flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                    location.pathname === '/admin' 
                    ? 'bg-pickle text-brand-dark shadow-lg' 
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LayoutGrid className="w-3 h-3 mr-2" />
                  Painel
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-400 transition-all hover:bg-white/5 rounded-full"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};