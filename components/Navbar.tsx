import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, LogOut, LayoutGrid, Menu, X, Camera } from 'lucide-react';
import { dataService } from '../services/dataService';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isAdmin = dataService.isAdmin();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    dataService.logout();
    window.location.reload();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
          scrolled 
            ? 'bg-brand-dark/95 backdrop-blur-xl border-white/10 py-3 shadow-2xl' 
            : 'bg-gradient-to-b from-black/90 to-transparent border-transparent py-6 md:py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo Area - Official Image */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-pickle/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Official Logo */}
                  <img 
                    src="https://i.imgur.com/cxjGH3m.png" 
                    alt="PickleballBH" 
                    className="h-12 md:h-14 w-auto relative drop-shadow-md transition-transform duration-300 group-hover:scale-105" 
                  />
              </div>
              <div className="flex flex-col">
                 <span className="text-white font-display font-bold text-xl leading-none tracking-wide group-hover:text-pickle transition-colors shadow-black drop-shadow-lg">PICKLEBALL<span className="text-pickle group-hover:text-white transition-colors">BH</span></span>
                 <span className="text-gray-300 text-[10px] uppercase tracking-[0.3em] font-medium opacity-80">Galeria Oficial</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
               <Link to="/" className="text-white hover:text-pickle font-bold uppercase text-xs tracking-wider transition-colors relative group">
                  Galeria
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pickle transition-all duration-300 group-hover:w-full"></span>
               </Link>
               <a href="https://instagram.com/pickleballbh" target="_blank" rel="noreferrer" className="text-white hover:text-pickle font-bold uppercase text-xs tracking-wider transition-colors relative group">
                  Instagram
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pickle transition-all duration-300 group-hover:w-full"></span>
               </a>

              {isAdmin ? (
                <div className="flex items-center space-x-4 pl-8 border-l border-white/20">
                  <Link 
                    to="/admin" 
                    className={`flex items-center px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                      location.pathname === '/admin' 
                      ? 'bg-pickle text-brand-dark shadow-[0_0_15px_rgba(204,255,0,0.4)]' 
                      : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'
                    }`}
                  >
                    <LayoutGrid className="w-3 h-3 mr-2" />
                    Painel
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-300 hover:text-red-400 transition-all hover:bg-white/10 rounded-full"
                    title="Sair"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login"
                  className="ml-4 flex items-center px-6 py-2.5 text-brand-dark bg-white hover:bg-pickle font-bold uppercase text-xs tracking-widest transition-all rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Login ADM
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden z-50">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="text-white p-2 hover:text-pickle transition-colors bg-white/5 rounded-lg border border-white/10 backdrop-blur-md"
              >
                {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-brand-dark/98 backdrop-blur-xl z-40 transition-transform duration-300 md:hidden flex flex-col items-center justify-center space-y-10 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-4xl font-display font-bold text-white uppercase tracking-widest hover:text-pickle"
          >
            Galeria
          </Link>
          <a 
            href="https://instagram.com/pickleballbh" 
            className="text-4xl font-display font-bold text-white uppercase tracking-widest hover:text-pickle"
          >
            Instagram
          </a>
          <Link 
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="text-xl font-display font-bold text-white uppercase tracking-widest bg-white/10 border border-white/20 px-10 py-4 rounded-full active:bg-pickle active:text-brand-dark"
          >
            Área Admin
          </Link>
      </div>
    </>
  );
};