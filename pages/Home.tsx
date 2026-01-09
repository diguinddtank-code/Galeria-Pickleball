import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Camera, Search, X, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../services/dataService';
import { PickleballEvent } from '../types';
import { Hero } from '../components/Hero';

// Custom Animated Pickleball SVG Component (Used for Loader)
const PickleballIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#bef264" stroke="#65a30d" strokeWidth="4"/>
    <circle cx="50" cy="50" r="8" fill="#ecfccb" opacity="0.8"/>
    <circle cx="50" cy="20" r="6" fill="#ecfccb" opacity="0.8"/>
    <circle cx="50" cy="80" r="6" fill="#ecfccb" opacity="0.8"/>
    <circle cx="20" cy="50" r="6" fill="#ecfccb" opacity="0.8"/>
    <circle cx="80" cy="50" r="6" fill="#ecfccb" opacity="0.8"/>
  </svg>
);

const PickleballLoader = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative">
          <PickleballIcon className="w-16 h-16 animate-bounce text-pickle-500 drop-shadow-xl" />
      </div>
      <p className="mt-8 text-pickle-800 font-bold tracking-widest uppercase text-sm animate-pulse">Carregando Galeria...</p>
    </div>
);

export const Home: React.FC = () => {
  const [events, setEvents] = useState<PickleballEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<PickleballEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    const loadEvents = async () => {
      const data = await dataService.getEvents();
      setEvents(data);
      setFilteredEvents(data);
      setLoading(false);
    };
    loadEvents();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = events;

    // Filter by Category
    if (selectedCategory !== 'Todos') {
        result = result.filter(e => e.category?.toLowerCase().includes(selectedCategory.toLowerCase()) || e.tags?.some(t => t.toLowerCase() === selectedCategory.toLowerCase()));
    }

    // Filter by Search Term
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(e => 
            e.title.toLowerCase().includes(lowerTerm) || 
            e.location.toLowerCase().includes(lowerTerm) ||
            e.category?.toLowerCase().includes(lowerTerm)
        );
    }

    setFilteredEvents(result);
  }, [searchTerm, selectedCategory, events]);

  const scrollToEvents = () => {
    const element = document.getElementById('events-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get unique categories from events + defaults
  const categories = ['Todos', ...Array.from(new Set(events.map(e => e.category || 'Geral').filter(Boolean)))];

  if (loading) return <PickleballLoader />;

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="min-h-screen pb-24 bg-gray-50"
    >
      <Hero onOpenBooking={scrollToEvents} />

      {/* Events Section */}
      <div id="events-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-20">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
                <h2 className="text-3xl font-display font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
                    <span className="w-2 h-8 bg-pickle rounded-full"></span>
                    Galeria de Eventos
                </h2>
                <p className="text-gray-500 text-sm mt-2 ml-4">Encontre seu campeonato e reviva os momentos</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                {/* Search Bar */}
                <div className="relative group w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="Buscar evento..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pickle focus:border-transparent shadow-sm group-hover:shadow-md transition-all"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-hover:text-pickle-600 transition-colors" />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Category Filter Pills (Horizontal Scroll) */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all border ${
                        selectedCategory === cat
                        ? 'bg-brand-dark text-white border-brand-dark shadow-lg shadow-brand-dark/20 transform scale-105'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
        
        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, index) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        key={event.id}
                        className="group relative"
                    >
                        <Link 
                        to={`/event/${event.id}`}
                        className="block h-full"
                        >
                            {/* Stack Effect Backgrounds */}
                            <div className="absolute top-2 left-2 right-2 bottom-0 bg-white border border-gray-200 rounded-2xl transform rotate-2 shadow-sm transition-transform group-hover:rotate-3 group-hover:translate-y-1 z-0"></div>
                            <div className="absolute top-2 left-2 right-2 bottom-0 bg-white border border-gray-200 rounded-2xl transform -rotate-2 shadow-sm transition-transform group-hover:-rotate-3 group-hover:translate-y-1 z-0"></div>

                            {/* Main Card */}
                            <div className="relative bg-white rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col z-10 transform group-hover:-translate-y-1">
                                
                                {/* Image Area */}
                                <div className="relative h-64 overflow-hidden bg-gray-100">
                                    <img 
                                        src={event.coverImage} 
                                        alt={event.title} 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                    
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                                    
                                    {/* Content Over Image */}
                                    <div className="absolute bottom-0 left-0 w-full p-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase text-white tracking-wider">
                                                {event.category || 'Geral'}
                                            </span>
                                            {event.status === 'live' && (
                                                <span className="px-2.5 py-1 rounded-md bg-red-500 text-[10px] font-bold uppercase text-white tracking-wider animate-pulse">
                                                    Ao Vivo
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-bold font-display text-white uppercase leading-none shadow-black drop-shadow-md">
                                            {event.title}
                                        </h3>
                                    </div>

                                    {/* Date Badge (Top Right) */}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg flex flex-col items-center border border-white/50">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                                            {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                                        </span>
                                        <span className="text-xl font-black text-gray-900 leading-none font-display">
                                            {new Date(event.date).getDate() + 1}
                                        </span>
                                    </div>
                                </div>

                                {/* Body Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center text-sm text-gray-500 font-medium">
                                            <MapPin className="w-4 h-4 mr-1.5 text-pickle-600" />
                                            {event.location}
                                        </div>
                                        <div className="flex items-center text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                            <Layers className="w-3 h-3 mr-1.5" />
                                            {event.totalPhotos || 0} fotos
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-dashed border-gray-200 flex items-center justify-between group/btn">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Acessar Álbum
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover/btn:bg-pickle group-hover/btn:scale-110 transition-all duration-300">
                                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover/btn:text-brand-dark transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
          </AnimatePresence>
        </div>

        {filteredEvents.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-2xl border-dashed border-2 border-gray-200 mt-12"
          >
            <div className="inline-block p-6 bg-gray-50 rounded-full mb-6">
                <Search className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg">Nenhum evento encontrado.</p>
            <button onClick={() => {setSearchTerm(''); setSelectedCategory('Todos');}} className="text-pickle-700 font-bold text-sm mt-2 hover:underline">
                Limpar filtros
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};