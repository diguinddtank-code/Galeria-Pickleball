import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, ShoppingCart, Share2, X, ChevronLeft, ChevronRight, Filter, Lock, Check, Plus, Trash2, Download, Zap } from 'lucide-react';
import { dataService } from '../services/dataService';
import { PickleballEvent, Photo } from '../types';
import { useCart } from '../context/CartContext';

// Custom Animated Pickleball SVG Component
const PickleballIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#bef264" stroke="#65a30d" strokeWidth="4"/>
    <circle cx="50" cy="50" r="8" fill="#ecfccb" opacity="0.8"/>
    <circle cx="50" cy="20" r="6" fill="#ecfccb" opacity="0.8"/>
  </svg>
);

const PickleballLoader = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative">
          <PickleballIcon className="w-16 h-16 animate-bounce text-pickle-500 drop-shadow-xl" />
      </div>
      <p className="mt-8 text-pickle-800 font-bold tracking-widest uppercase text-sm animate-pulse">Carregando Fotos...</p>
    </div>
);

// WATERMARK COMPONENT
const WatermarkOverlay = () => (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-30 select-none flex flex-wrap content-center justify-center gap-12 rotate-[-20deg] scale-125">
        {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="text-white font-black text-2xl uppercase tracking-widest border-2 border-white/50 px-4 py-2">
                REMAKING
            </div>
        ))}
    </div>
);

// Componente de Cartão de Imagem
interface ImageCardProps {
  photo: Photo;
  onClick: () => void;
  index: number;
}

const ImageCard: React.FC<ImageCardProps> = ({ photo, onClick, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isInCart, addItem, removeItem } = useCart();
  const added = isInCart(photo.id);
  const displayId = photo.displayId || photo.id.substring(0, 5).toUpperCase();

  const toggleCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (added) {
        removeItem(photo.id);
    } else {
        addItem(photo);
    }
  };

  return (
    <div 
      className={`break-inside-avoid mb-6 relative group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ease-out transform hover:-translate-y-1 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${added ? 'ring-4 ring-pickle shadow-[0_0_20px_rgba(204,255,0,0.3)]' : ''}`}
      style={{ transitionDelay: `${(index % 12) * 50}ms` }}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()} // Disable right click
    >
      {/* Placeholder */}
      {!isLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse h-64 w-full" />}
      
      {/* Image with Watermark Overlay Logic */}
      <div className="relative overflow-hidden">
        <img 
            src={photo.url} 
            alt="Momento do evento" 
            className={`w-full h-auto block object-cover transform transition-transform duration-700 group-hover:scale-105 will-change-transform ${isLoaded ? 'opacity-100' : 'opacity-0'} filter blur-[0.5px] group-hover:blur-0 transition-all`}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
        />
        {/* Visual Watermark CSS Overlay */}
        <div className="absolute inset-0 bg-[url('https://i.imgur.com/KFvjnX6.jpeg')] bg-repeat opacity-20 bg-[length:150px_auto] mix-blend-overlay pointer-events-none"></div>
        
        {/* Short ID Badge */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
            #{displayId}
        </div>

        {/* Added Overlay Indicator */}
        {added && (
            <div className="absolute inset-0 bg-pickle/30 backdrop-blur-[1px] flex items-center justify-center animate-[fadeIn_0.2s]">
                <div className="bg-brand-dark rounded-full p-3 shadow-xl transform scale-110">
                    <Check className="w-8 h-8 text-pickle" />
                </div>
            </div>
        )}

        <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${added ? 'hidden' : ''}`}>
             <div className="bg-black/50 backdrop-blur-sm p-4 rounded-full border border-white/20 transform scale-90 group-hover:scale-100 transition-transform">
                <Lock className="w-6 h-6 text-white" />
             </div>
        </div>
      </div>
      
      {/* Overlay Premium Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
         <div className="flex justify-between items-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
             <div className="flex flex-col">
                <span className="text-pickle text-[10px] font-bold uppercase tracking-wider mb-0.5">Alta Resolução</span>
                <span className="text-white font-display text-lg tracking-wide leading-none">{photo.caption || 'Foto Premium'}</span>
             </div>
             
             <button 
                onClick={toggleCart}
                className={`px-4 py-2 rounded-full font-bold text-[10px] uppercase shadow-lg flex items-center transition-all transform hover:scale-105 active:scale-95 ${
                    added ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-pickle text-brand-dark hover:bg-white'
                }`}
             >
                {added ? <Trash2 className="w-3 h-3 mr-1.5" /> : <Plus className="w-3 h-3 mr-1.5" />}
                {added ? 'Remover' : 'Quero Essa'}
             </button>
         </div>
      </div>
    </div>
  );
};

export const EventView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<PickleballEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTag, setActiveTag] = useState<string>('All');
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  
  // Cart Hook
  const { isInCart, addItem, removeItem } = useCart();

  useEffect(() => {
    const loadEvent = async () => {
      window.scrollTo(0, 0);
      if (id) {
        const data = await dataService.getEventById(id);
        setEvent(data || null);
      }
      setLoading(false);
    };
    loadEvent();
  }, [id]);

  useEffect(() => {
    if (event) {
        if (activeTag === 'All') {
            setFilteredPhotos(event.photos);
        } else {
            setFilteredPhotos(event.photos.filter(p => p.tags && p.tags.includes(activeTag)));
        }
    }
  }, [event, activeTag]);

  // Extract unique tags from all photos
  const allTags = event?.photos.reduce((acc, photo) => {
    if (photo.tags) {
        photo.tags.forEach(tag => {
            if (!acc.includes(tag)) acc.push(tag);
        });
    }
    return acc;
  }, ['All'] as string[]) || ['All'];

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (event && selectedIndex !== null) {
        setSelectedIndex((prev) => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0));
    }
  }, [filteredPhotos, selectedIndex]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (event && selectedIndex !== null) {
         setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1));
    }
  }, [filteredPhotos, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (selectedIndex === null) return;
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || 'Remaking Agency Evento',
          text: 'Confira as fotos deste evento!',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleCart = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    if (isInCart(photo.id)) {
        removeItem(photo.id);
    } else {
        addItem(photo);
    }
  };

  if (loading) return <PickleballLoader />;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-gray-500">Evento não encontrado.</div>;

  const selectedPhoto = selectedIndex !== null ? filteredPhotos[selectedIndex] : null;
  const isSelectedInCart = selectedPhoto ? isInCart(selectedPhoto.id) : false;
  const selectedDisplayId = selectedPhoto ? (selectedPhoto.displayId || selectedPhoto.id.substring(0, 5).toUpperCase()) : '';

  return (
    <div className="min-h-screen bg-gray-50 select-none"> {/* Prevent text selection globally */}
      {/* Modern Compact Hero */}
      <div className="relative h-[45vh] w-full overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <img 
            src={event.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-40 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-black/80" />
        </div>
        
        <div className="absolute top-24 left-0 w-full px-4 sm:px-6 lg:px-8 z-20">
            <div className="max-w-7xl mx-auto">
                 <Link 
                    to="/" 
                    className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md text-white transition-all text-xs font-bold border border-white/10 hover:border-white/30 mb-8 uppercase tracking-widest"
                >
                    <ArrowLeft className="w-3 h-3 mr-2" />
                    Voltar para Galeria
                </Link>

                <div className="max-w-3xl">
                    <h1 className="text-3xl md:text-5xl font-bold font-display text-white mb-2 uppercase tracking-wide leading-tight">
                        {event.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm font-medium mb-6">
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5 text-pickle" />
                            {new Date(event.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <span className="text-white/20">|</span>
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1.5 text-pickle" />
                            {event.location}
                        </div>
                         <span className="text-white/20">|</span>
                        <div className="text-pickle font-bold flex items-center">
                            <Zap className="w-4 h-4 mr-1.5" />
                            {event.totalPhotos || 0} Registros Oficiais
                        </div>
                    </div>
                    <p className="text-gray-400 max-w-2xl text-sm leading-relaxed border-l-2 border-pickle pl-4">
                        {event.description}
                    </p>
                </div>
            </div>
        </div>

        {/* Share Button Floating */}
        <div className="absolute bottom-8 right-4 md:right-8 z-30">
             <button 
                onClick={handleShare}
                className="flex items-center justify-center px-6 py-3 bg-white text-brand-dark rounded-full font-bold uppercase tracking-wider text-xs hover:bg-gray-200 transition-all shadow-lg active:scale-95"
            >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                {copied ? 'Link Copiado' : 'Compartilhar Álbum'}
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center overflow-x-auto no-scrollbar gap-2">
                    <div className="flex items-center text-gray-400 mr-2">
                        <Filter className="w-4 h-4" />
                    </div>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${
                                activeTag === tag 
                                ? 'bg-brand-dark text-white shadow-md' 
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            {tag === 'All' ? 'Todas' : tag}
                        </button>
                    ))}
                </div>
           </div>
      </div>

      {/* Gallery Grid - Masonry */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[50vh]">
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredPhotos.map((photo, index) => (
            <ImageCard 
                key={photo.id} 
                photo={photo} 
                index={index}
                onClick={() => setSelectedIndex(index)} 
            />
          ))}
        </div>
        
        {filteredPhotos.length === 0 && (
            <div className="text-center py-20">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Sem fotos aqui</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2 text-sm">
                    Não encontramos fotos com este filtro ou o álbum ainda está vazio.
                </p>
            </div>
        )}
      </div>

      {/* Premium Lightbox Modal */}
      {selectedPhoto && (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-300 animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setSelectedIndex(null)}
        >
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex flex-col">
                    <div className="text-white/80 text-sm font-medium tracking-wide">
                        {selectedIndex !== null ? selectedIndex + 1 : 0} / {filteredPhotos.length}
                    </div>
                    <div className="text-pickle font-mono text-xs mt-1">Ref: {selectedDisplayId}</div>
                </div>
                <button 
                    className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 backdrop-blur-md transition-all border border-white/10 hover:rotate-90"
                    onClick={() => setSelectedIndex(null)}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all hidden md:flex border border-white/5 hover:border-white/20"
                onClick={handlePrev}
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all hidden md:flex border border-white/5 hover:border-white/20"
                onClick={handleNext}
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            <div 
                className="relative w-full h-full flex items-center justify-center p-4 md:p-12" 
                onClick={e => e.stopPropagation()}
                onContextMenu={(e) => e.preventDefault()} // Disable Right Click
            >
                <div className="relative max-w-full max-h-[85vh] inline-block shadow-2xl overflow-hidden rounded-sm">
                    <img 
                        src={selectedPhoto.url} 
                        alt="Full View" 
                        className="max-w-full max-h-[85vh] object-contain animate-[fadeIn_0.3s_ease-out]" 
                    />
                    <WatermarkOverlay />
                </div>
            </div>

            <div 
                className="absolute bottom-0 w-full p-8 flex flex-col md:flex-row items-center justify-between gap-4 z-20 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"
            >
               <div className="text-white/80 text-sm md:text-base font-medium text-center md:text-left">
                  <span className="block text-pickle text-xs font-bold uppercase tracking-wider mb-1">Registro Exclusivo</span>
                  {selectedPhoto.caption || event?.title}
               </div>

               <button 
                 onClick={(e) => handleToggleCart(e, selectedPhoto)}
                 className={`flex items-center px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto hover:scale-105 active:scale-95 ${
                    isSelectedInCart 
                    ? 'bg-red-500 text-white hover:bg-red-600 border border-red-400'
                    : 'bg-pickle text-brand-dark hover:bg-white border-2 border-transparent hover:border-pickle'
                 }`}
               >
                 {isSelectedInCart ? (
                    <>
                        <Trash2 className="w-4 h-4 mr-2" /> Remover da Seleção
                    </>
                 ) : (
                    <>
                        <Download className="w-4 h-4 mr-2" /> Desbloquear Foto
                    </>
                 )}
               </button>
            </div>
            
            <div className="absolute left-0 top-20 bottom-20 w-1/4 z-10 md:hidden" onClick={handlePrev}></div>
            <div className="absolute right-0 top-20 bottom-20 w-1/4 z-10 md:hidden" onClick={handleNext}></div>
        </div>
      )}
    </div>
  );
};