import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutGrid, Menu, X, Camera, Instagram } from 'lucide-react';
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

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-slate-950/95 backdrop-blur-xl py-3 shadow-2xl' 
            : 'bg-gradient-to-b from-black/90 to-transparent py-6 md:py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo Area */}
            <Link to="/" className="flex items-center gap-4 group z-50 relative">
              <img 
                src="https://i.imgur.com/KFvjnX6.jpeg" 
                alt="Remaking Agency" 
                className="h-10 md:h-12 w-auto group-hover:scale-105 transition-transform duration-300 mix-blend-screen" 
              />
              <div className="flex flex-col">
                 <span className="text-white font-display font-bold text-lg md:text-xl leading-none tracking-wide group-hover:text-gray-300 transition-colors shadow-black drop-shadow-lg uppercase">
                    Remaking <span className="text-gray-400 group-hover:text-white transition-colors">Agency</span>
                 </span>
                 <span className="text-gray-400 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-medium opacity-80">Fotografia Esportiva</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
               <Link to="/" className="text-white hover:text-gray-300 font-bold uppercase text-xs tracking-wider transition-colors relative group">
                  Galeria
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
               </Link>
               <a href="https://instagram.com/remakingagency" target="_blank" rel="noreferrer" className="text-white hover:text-gray-300 font-bold uppercase text-xs tracking-wider transition-colors relative group">
                  Instagram
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
               </a>

              {isAdmin ? (
                <div className="flex items-center space-x-4 pl-8 border-l border-white/20">
                  <Link 
                    to="/admin" 
                    className={`flex items-center px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                      location.pathname === '/admin' 
                      ? 'bg-white text-brand-dark shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
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
                  className="ml-4 flex items-center px-6 py-2.5 text-brand-dark bg-white hover:bg-gray-200 font-bold uppercase text-xs tracking-widest transition-all rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
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
                className={`p-2 transition-colors rounded-lg backdrop-blur-md ${mobileMenuOpen ? 'text-white hover:text-red-400' : 'text-white hover:text-gray-300 bg-white/5 border border-white/10'}`}
              >
                {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - High Contrast */}
      <div 
        className={`fixed inset-0 bg-slate-950 z-40 transition-all duration-300 md:hidden flex flex-col items-center justify-center space-y-8 ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          
          <Link 
            to="/" 
            className="text-3xl font-display font-bold text-white uppercase tracking-widest hover:text-gray-300 transition-colors relative z-10"
          >
            Galeria
          </Link>
          
          <a 
            href="https://instagram.com/remakingagency" 
            target="_blank"
            rel="noreferrer"
            className="text-3xl font-display font-bold text-white uppercase tracking-widest hover:text-gray-300 transition-colors flex items-center relative z-10"
          >
            <Instagram className="w-6 h-6 mr-3" />
            Instagram
          </a>

          <div className="w-16 h-1 bg-white/10 rounded-full my-4 relative z-10"></div>

          {isAdmin ? (
             <div className="flex flex-col gap-4 w-64 relative z-10">
                <Link 
                  to="/admin"
                  className="w-full flex items-center justify-center px-6 py-4 bg-white text-brand-dark font-bold uppercase tracking-widest rounded-lg shadow-lg active:scale-95 transition-transform"
                >
                  <LayoutGrid className="w-5 h-5 mr-2" />
                  Painel Admin
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-6 py-4 bg-white/10 text-white font-bold uppercase tracking-widest rounded-lg border border-white/10 active:bg-red-500/20 active:border-red-500/50 transition-colors"
                >
                  Sair
                </button>
             </div>
          ) : (
            <Link 
              to="/login"
              className="relative z-10 text-xl font-display font-bold text-white uppercase tracking-widest bg-white/10 border border-white/20 px-10 py-4 rounded-full active:bg-white active:text-brand-dark transition-all"
            >
              Área Admin
            </Link>
          )}
      </div>
    </>
  );
};