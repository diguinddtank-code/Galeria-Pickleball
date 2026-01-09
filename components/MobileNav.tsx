import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Instagram, LayoutGrid, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { itemsCount, openCart } = useCart();

  const isActive = (path: string) => location.pathname === path;

  // Function to scroll to top (acting as "Home" refresh or "Events" find)
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[49] pointer-events-none">
        {/* Floating gradient shadow for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />

        <div className="pointer-events-auto bg-white/90 backdrop-blur-xl border-t border-gray-200/60 pb-5 pt-2 px-6 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center max-w-sm mx-auto">
                
                {/* Home */}
                <Link 
                to="/" 
                onClick={scrollToTop}
                className="group flex flex-col items-center justify-center w-14 transition-all"
                >
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive('/') ? 'bg-pickle/20' : 'bg-transparent group-hover:bg-gray-100'}`}>
                        <Home className={`w-6 h-6 transition-all ${isActive('/') ? 'text-brand-dark fill-brand-dark' : 'text-gray-400'}`} />
                    </div>
                    <span className={`text-[9px] font-bold mt-1 tracking-wide transition-colors ${isActive('/') ? 'text-brand-dark' : 'text-gray-400'}`}>
                        Início
                    </span>
                </Link>

                {/* Eventos / Grid */}
                <Link
                    to="/"
                    onClick={() => {
                        scrollToTop();
                        setTimeout(() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }}
                    className="group flex flex-col items-center justify-center w-14 transition-all"
                >
                    <div className="p-1.5 rounded-xl transition-all duration-300 bg-transparent group-hover:bg-gray-100">
                        <LayoutGrid className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                    <span className="text-[9px] font-bold mt-1 tracking-wide text-gray-400 group-hover:text-gray-600 transition-colors">
                        Eventos
                    </span>
                </Link>

                {/* Main Action: CART (Floating Effect Integration) */}
                <div className="relative -top-5">
                    <button 
                        onClick={openCart}
                        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-[0_8px_20px_rgba(204,255,0,0.4)] border-4 border-gray-50 transition-all transform active:scale-95 ${itemsCount > 0 ? 'bg-pickle text-brand-dark' : 'bg-gray-900 text-white'}`}
                    >
                        <ShoppingCart className="w-6 h-6" />
                        {itemsCount > 0 && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                {itemsCount}
                            </div>
                        )}
                    </button>
                </div>

                {/* Instagram (Replaces Admin) */}
                <a 
                    href="https://instagram.com/remakingagency"
                    target="_blank"
                    rel="noreferrer" 
                    className="group flex flex-col items-center justify-center w-14 transition-all"
                >
                    <div className="p-1.5 rounded-xl transition-all duration-300 bg-transparent group-hover:bg-gray-100">
                        <Instagram className="w-6 h-6 text-gray-400 group-hover:text-pink-600 transition-colors" />
                    </div>
                    <span className="text-[9px] font-bold mt-1 tracking-wide text-gray-400 group-hover:text-pink-600 transition-colors">
                        Insta
                    </span>
                </a>

                {/* Help / WhatsApp */}
                <a 
                    href="https://wa.me/5531993430851" 
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col items-center justify-center w-14 transition-all"
                >
                     <div className="p-1.5 rounded-xl transition-all duration-300 bg-transparent group-hover:bg-gray-100">
                        <MessageCircle className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
                     </div>
                    <span className="text-[9px] font-bold mt-1 tracking-wide text-gray-400 group-hover:text-green-600 transition-colors">
                        Ajuda
                    </span>
                </a>

            </div>
        </div>
    </div>
  );
};