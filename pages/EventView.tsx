import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, ShoppingCart, Share2, X, ChevronLeft, ChevronRight, Filter, Lock, Check, Plus, Trash2, Download, Zap, Image as ImageIcon, Sparkles, ShieldAlert } from 'lucide-react';
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

// WATERMARK COMPONENT - Tiled Pattern for Security
const WatermarkOverlay = () => (
    <div className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden mix-blend-overlay opacity-50">
        <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-weight='900' font-size='16' fill='white' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 75 75)'%3EREMAKING // PROVA%3C/text%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
        }}></div>
    </div>
);

// CSS Class for "Preview Quality" simulation
// Adds slight blur and noise to simulate low-res preview
const PREVIEW_QUALITY_CLASS = "filter blur-[0.5px] contrast-[0.95] brightness-[0.95]";

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
      className={`break-inside-avoid mb-6 relative group cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-300 transform hover:-translate-y-1 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${added ? 'ring-[3px] ring-pickle shadow-[0_0_30px_rgba(204,255,0,0.25)]' : ''}`}
      style={{ transitionDelay: `${(index % 12) * 50}ms` }}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()} // Disable Right Click
    >
      {/* Placeholder */}
      {!isLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse h-64 w-full" />}
      
      <div className="relative overflow-hidden">
        <img 
            src={photo.url} 
            alt="Momento do evento" 
            className={`w-full h-auto block object-cover transform transition-transform duration-700 group-hover:scale-105 will-change-transform ${isLoaded ? 'opacity-100' : 'opacity-0'} ${PREVIEW_QUALITY_CLASS} transition-all pointer-events-none select-none`}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onDragStart={(e) => e.preventDefault()} // Disable Drag
        />

        {/* Watermark on Grid - ALWAYS VISIBLE regardless of cart status */}
        <WatermarkOverlay />
        
        {/* Short ID Badge - Always Visible on corner */}
        <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-white/90 border border-white/10 z-20">
            #{displayId}
        </div>

        {/* Quick Add Button (Top Right) */}
        <div 
            onClick={toggleCart}
            className={`absolute top-2 right-2 px-3 py-1.5 rounded-full flex items-center justify-center transition-all duration-300 z-30 font-bold text-[10px] uppercase tracking-wider shadow-lg transform active:scale-95 ${
                added 
                ? 'bg-pickle text-brand-dark ring-2 ring-white' 
                : 'bg-white/90 text-brand-dark hover:bg-white backdrop-blur-sm'
            }`}
        >
            {added ? (
                <>
                    <Check className="w-3 h-3 mr-1" strokeWidth={3} /> SALVA
                </>
            ) : (
                <>
                    <Plus className="w-3 h-3 mr-1" strokeWidth={3} /> ADD
                </>
            )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
            <span className="text-white font-display text-lg tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                {photo.caption || 'Visualizar'}
            </span>
        </div>
        
        {/* Active Overlay Tint */}
        {added && <div className="absolute inset-0 bg-pickle/10 pointer-events-none z-10" />}
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
  
  // Lightbox State
  const [viewMode, setViewMode] = useState<'standard' | 'framed'>('standard');
  
  // Cart Hook
  const { isInCart, addItem, removeItem, itemsCount, discountPercent } = useCart();

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

  // Preload next image for smooth browsing
  useEffect(() => {
    if (selectedIndex !== null && selectedIndex < filteredPhotos.length - 1) {
        const img = new Image();
        img.src = filteredPhotos[selectedIndex + 1].url;
    }
  }, [selectedIndex, filteredPhotos]);

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

  const handleToggleCart = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    if (isInCart(photo.id)) {
        removeItem(photo.id);
    } else {
        addItem(photo);
    }
  };

  // Logic for bundle upsell in lightbox
  const nextDiscountTier = itemsCount < 3 ? 3 : itemsCount < 6 ? 6 : itemsCount < 10 ? 10 : null;
  const itemsNeeded = nextDiscountTier ? nextDiscountTier - itemsCount : 0;
  const nextDiscountValue = nextDiscountTier === 3 ? '10%' : nextDiscountTier === 6 ? '20%' : '30%';

  if (loading) return <PickleballLoader />;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-gray-500">Evento não encontrado.</div>;

  const selectedPhoto = selectedIndex !== null ? filteredPhotos[selectedIndex] : null;
  const isSelectedInCart = selectedPhoto ? isInCart(selectedPhoto.id) : false;
  const selectedDisplayId = selectedPhoto ? (selectedPhoto.displayId || selectedPhoto.id.substring(0, 5).toUpperCase()) : '';

  return (
    <div className="min-h-screen bg-gray-50 select-none">
      {/* Modern Compact Hero */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <img 
            src={event.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-50 blur-[3px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-black/40" />
        </div>
        
        <div className="absolute top-24 left-0 w-full px-4 sm:px-6 lg:px-8 z-20">
            <div className="max-w-7xl mx-auto">
                 <Link 
                    to="/" 
                    className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md text-white transition-all text-xs font-bold border border-white/10 hover:border-white/30 mb-8 uppercase tracking-widest group"
                >
                    <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Voltar para Galeria
                </Link>

                <div className="max-w-3xl animate-[fadeIn_0.5s_ease-out]">
                    <h1 className="text-3xl md:text-5xl font-bold font-display text-white mb-2 uppercase tracking-wide leading-tight drop-shadow-lg">
                        {event.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm font-medium mb-6">
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5 text-pickle" />
                            {new Date(event.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                        </div>
                        <span className="text-white/20">|</span>
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1.5 text-pickle" />
                            {event.location}
                        </div>
                         <span className="text-white/20">|</span>
                        <div className="text-pickle font-bold flex items-center bg-pickle/10 px-2 py-0.5 rounded-md border border-pickle/20">
                            <Zap className="w-4 h-4 mr-1.5" />
                            {event.totalPhotos || 0} Fotos
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center overflow-x-auto no-scrollbar gap-2">
                    <div className="flex items-center text-gray-400 mr-2 flex-shrink-0">
                        <Filter className="w-4 h-4" />
                    </div>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${
                                activeTag === tag 
                                ? 'bg-brand-dark text-white shadow-lg shadow-brand-dark/20' 
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent'
                            }`}
                        >
                            {tag === 'All' ? 'Todas' : tag}
                        </button>
                    ))}
                </div>
           </div>
      </div>

      {/* Gallery Grid */}
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
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Álbum Vazio</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2 text-sm">
                   As fotos deste filtro ainda estão sendo processadas.
                </p>
            </div>
        )}
      </div>

      {/* Premium Lightbox Modal */}
      {selectedPhoto && (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-dark/95 backdrop-blur-xl transition-all duration-300 animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setSelectedIndex(null)}
        >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="flex flex-col pointer-events-auto">
                    <div className="flex items-center gap-2">
                        <div className="text-white/80 text-sm font-medium tracking-wide">
                            {selectedIndex !== null ? selectedIndex + 1 : 0} / {filteredPhotos.length}
                        </div>
                        <div className="flex items-center px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30 text-[9px] font-bold text-yellow-500 uppercase tracking-widest">
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            Preview
                        </div>
                    </div>
                    <div className="text-pickle font-mono text-xs mt-1 opacity-80">REF: {selectedDisplayId}</div>
                </div>

                <div className="flex items-center gap-4 pointer-events-auto">
                    {/* View Mode Toggle */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setViewMode(prev => prev === 'standard' ? 'framed' : 'standard'); }}
                        className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${viewMode === 'framed' ? 'bg-white text-brand-dark border-white' : 'bg-black/40 text-gray-300 border-white/20 hover:border-white'}`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        {viewMode === 'framed' ? 'Modo Quadro' : 'Ver no Quadro'}
                    </button>

                    <button 
                        className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 backdrop-blur-md transition-all border border-white/10 hover:rotate-90"
                        onClick={() => setSelectedIndex(null)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Navigation Arrows - Now Visible on Mobile too, just distinct style */}
            <button 
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-4 rounded-full bg-black/30 hover:bg-white/10 text-white transition-all border border-white/5 hover:border-white/20 backdrop-blur-sm"
                onClick={handlePrev}
            >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <button 
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-4 rounded-full bg-black/30 hover:bg-white/10 text-white transition-all border border-white/5 hover:border-white/20 backdrop-blur-sm"
                onClick={handleNext}
            >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* Main Content Area */}
            <div 
                className="relative w-full h-full flex items-center justify-center p-4 md:p-12 md:pb-32" 
                onClick={e => e.stopPropagation()}
                onContextMenu={(e) => e.preventDefault()}
            >
                {/* Standard View vs Framed View */}
                {viewMode === 'standard' ? (
                    <div className="relative max-w-full max-h-[70vh] md:max-h-[75vh] inline-block shadow-2xl overflow-hidden rounded-sm transition-all duration-500">
                        {/* Protection Layer - Prevents dragging/right click visually */}
                        <div className="absolute inset-0 z-20"></div>

                        <img 
                            key={selectedPhoto.id} // Forces re-render for animation on change
                            src={selectedPhoto.url} 
                            alt="Full View" 
                            className={`max-w-full max-h-[70vh] md:max-h-[75vh] object-contain animate-[fadeIn_0.3s_ease-out] select-none pointer-events-none ${PREVIEW_QUALITY_CLASS}`} 
                            onDragStart={(e) => e.preventDefault()}
                        />
                        {/* Always show Watermark */}
                        <WatermarkOverlay />
                    </div>
                ) : (
                    // Framed Simulator View
                    <div className="relative animate-[fadeIn_0.5s_ease-out] transform scale-90 md:scale-100">
                        {/* Wall Shadow & Texture Simulation */}
                        <div className="absolute -inset-20 bg-gradient-to-br from-gray-800 to-gray-900 opacity-0 md:opacity-100 -z-10 rounded-xl"></div>
                        
                        {/* Physical Frame CSS */}
                        <div className="relative border-[16px] border-black shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-white p-8 md:p-12">
                             <div className="shadow-inner border border-gray-200 relative overflow-hidden">
                                <img 
                                    key={`frame-${selectedPhoto.id}`}
                                    src={selectedPhoto.url} 
                                    alt="Framed" 
                                    className={`max-h-[50vh] object-contain block select-none pointer-events-none ${PREVIEW_QUALITY_CLASS}`}
                                    onDragStart={(e) => e.preventDefault()}
                                />
                                {/* Always show Watermark */}
                                <WatermarkOverlay />
                             </div>
                             {/* Reflection/Glass Glare */}
                             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-30"></div>
                        </div>
                        <div className="text-center mt-6 text-gray-400 font-display uppercase tracking-widest text-sm">
                            Simulação de Impressão 30x40cm
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Bar Controls & Upsell */}
            <div className="absolute bottom-0 w-full z-30 bg-white/5 backdrop-blur-xl border-t border-white/10">
               
               {/* Progress Bar (Upsell) */}
               {itemsNeeded > 0 && (
                   <div className="w-full bg-brand-dark/50 py-1.5 px-4 text-center border-b border-white/5">
                        <p className="text-[10px] md:text-xs text-gray-300">
                            <Sparkles className="w-3 h-3 inline-block text-yellow-400 mr-1" />
                            Selecione mais <span className="text-white font-bold">{itemsNeeded} fotos</span> para ganhar <span className="text-pickle font-bold">{nextDiscountValue} OFF</span>
                        </p>
                        <div className="h-0.5 w-full bg-gray-700 mt-1 max-w-md mx-auto rounded-full overflow-hidden">
                             <div className="h-full bg-pickle transition-all duration-500" style={{ width: `${(itemsCount / nextDiscountTier!) * 100}%` }}></div>
                        </div>
                   </div>
               )}

               <div className="p-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="hidden md:block text-white/80 text-sm font-medium">
                        <span className="block text-pickle text-xs font-bold uppercase tracking-wider mb-1">
                             {isSelectedInCart ? 'Selecionada' : 'Disponível'}
                        </span>
                        {selectedPhoto.caption || event?.title}
                    </div>
                    
                    {/* Mobile: View Mode Toggle */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setViewMode(prev => prev === 'standard' ? 'framed' : 'standard'); }}
                        className="md:hidden flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border border-white/20 text-gray-300 mb-2"
                    >
                        <ImageIcon className="w-3 h-3" />
                        {viewMode === 'framed' ? 'Sair do Modo Quadro' : 'Simular no Quadro'}
                    </button>

                    <button 
                        onClick={(e) => handleToggleCart(e, selectedPhoto)}
                        className={`w-full md:w-auto flex items-center justify-center px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] transform hover:scale-105 active:scale-95 ${
                            isSelectedInCart 
                            ? 'bg-red-500 text-white hover:bg-red-600 border border-red-400'
                            : 'bg-pickle text-brand-dark hover:bg-white border-2 border-transparent hover:border-pickle'
                        }`}
                    >
                        {isSelectedInCart ? (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" /> Remover
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" /> Eu Quero Essa
                            </>
                        )}
                    </button>
               </div>
            </div>
            
            {/* Deprecated large click zones replaced by visible buttons, kept as fallback for edge/very large screens if needed, but safe to rely on buttons now */}
        </div>
      )}
    </div>
  );
};