import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Search, X, Layers, Calendar, ChevronRight } from 'lucide-react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { dataService } from '../services/dataService';
import { PickleballEvent } from '../types';
import { Hero } from '../components/Hero';

const motion = framerMotion as any;

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
      <div id="events-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-20">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 uppercase tracking-tight leading-none">
                    Galeria de <span className="text-transparent bg-clip-text bg-gradient-to-r from-pickle-600 to-pickle-700">Eventos</span>
                </h2>
                <div className="h-1.5 w-24 bg-pickle mt-3 rounded-full"></div>
                <p className="text-gray-500 text-sm mt-3 font-medium max-w-md">
                    Selecione o campeonato abaixo para acessar as fotos em alta resolução.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                {/* Search Bar */}
                <div className="relative group w-full md:w-72">
                    <input 
                        type="text" 
                        placeholder="Buscar campeonato..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pickle focus:border-transparent shadow-sm group-hover:shadow-md transition-all placeholder:text-gray-400"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-hover:text-pickle-600 transition-colors" />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex overflow-x-auto no-scrollbar gap-3 mb-10 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
                        selectedCategory === cat
                        ? 'bg-gray-900 text-white border-gray-900 shadow-lg scale-105'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-pickle hover:text-pickle-700'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
        
        {/* Events Grid - Professional Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, index) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        key={event.id}
                        className="group"
                    >
                        <Link 
                            to={`/event/${event.id}`}
                            className="block h-full bg-white rounded-2xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 border border-gray-100 flex flex-col transform hover:-translate-y-2"
                        >
                            {/* Image Container */}
                            <div className="relative h-64 overflow-hidden bg-gray-100">
                                <div className="absolute inset-0 bg-gray-900/10 z-10 transition-opacity group-hover:opacity-0" />
                                <img 
                                    src={event.coverImage} 
                                    alt={event.title} 
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out filter brightness-95 group-hover:brightness-100"
                                />
                                
                                {/* Status Badge */}
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                     <span className="px-3 py-1 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-gray-900 shadow-sm border border-white/50">
                                        {event.category || 'Geral'}
                                    </span>
                                    {event.status === 'live' && (
                                        <span className="px-3 py-1 rounded-md bg-red-600 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm animate-pulse flex items-center">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5" /> Ao Vivo
                                        </span>
                                    )}
                                </div>

                                {/* Date Badge - Floating */}
                                <div className="absolute bottom-4 right-4 z-20 bg-white shadow-lg rounded-xl px-4 py-2 flex flex-col items-center border border-gray-100 min-w-[70px]">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        {new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                                    </span>
                                    <span className="text-2xl font-black text-gray-900 leading-none font-display">
                                        {new Date(event.date).getDate() + 1}
                                    </span>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-6 flex-1 flex flex-col relative">
                                <div className="mb-4">
                                    <h3 className="text-2xl font-bold font-display text-gray-900 uppercase leading-tight group-hover:text-pickle-600 transition-colors">
                                        {event.title}
                                    </h3>
                                    
                                    <div className="flex items-center text-sm text-gray-500 font-medium mt-3">
                                        <MapPin className="w-4 h-4 mr-1.5 text-pickle-600 flex-shrink-0" />
                                        <span className="truncate">{event.location}</span>
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                                        <Layers className="w-3.5 h-3.5 mr-1.5" />
                                        {event.totalPhotos || 0} Fotos
                                    </div>

                                    <div className="flex items-center text-xs font-bold uppercase tracking-wider text-pickle-700 group-hover:translate-x-1 transition-transform">
                                        Ver Galeria <ChevronRight className="w-4 h-4 ml-1" />
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
            <button onClick={() => {setSearchTerm(''); setSelectedCategory('Todos');}} className="text-pickle-700 font-bold text-sm mt-2 hover:underline uppercase tracking-wide">
                Limpar filtros
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};