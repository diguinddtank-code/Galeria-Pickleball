import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Share2, X, ChevronLeft, ChevronRight, Filter, Check, Plus, Trash2, Zap, Image as ImageIcon, Sparkles, ShieldAlert, ShoppingBag } from 'lucide-react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { dataService } from '../services/dataService';
import { PickleballEvent, Photo } from '../types';
import { useCart } from '../context/CartContext';

const motion = framerMotion as any;

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

// WATERMARK COMPONENT - EXTREME SECURITY
const WatermarkOverlay = () => (
    <>
        <div className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden opacity-[0.55] mix-blend-overlay">
            <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='70' height='70' viewBox='0 0 70 70' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-weight='900' font-size='10' fill='white' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 35 35)'%3E@remakingagency%3C/text%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
            }}></div>
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden opacity-[0.55] mix-blend-overlay">
             <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='70' height='70' viewBox='0 0 70 70' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-weight='900' font-size='10' fill='white' text-anchor='middle' dominant-baseline='middle' transform='rotate(45 35 35)'%3E@remakingagency%3C/text%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
            }}></div>
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden opacity-[0.3] mix-blend-overlay">
             <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='50' viewBox='0 0 100 50' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-weight='900' font-size='9' fill='white' text-anchor='middle' dominant-baseline='middle' opacity='0.8'%3EREMAKING%3C/text%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
            }}></div>
        </div>
    </>
);

const NoiseOverlay = () => (
    <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.15] mix-blend-overlay" 
         style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}>
    </div>
);

const PREVIEW_QUALITY_CLASS = "contrast-[1.05] brightness-[1.02]";

// --- PREMIUM IMAGE CARD COMPONENT ---
interface ImageCardProps {
  photo: Photo;
  onClick: () => void;
  index: number;
}

const ImageCard: React.FC<ImageCardProps> = ({ photo, onClick, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isInCart, addItem, removeItem } = useCart();
  const added = isInCart(photo.id);
  
  // Prioritize Original Name. If not available, use displayId (which is now also filename for new uploads).
  // Fallback to substring of ID only for legacy data.
  const displayName = photo.originalName || photo.displayId || photo.id.substring(0, 5).toUpperCase();

  const toggleCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (added) {
        removeItem(photo.id);
    } else {
        addItem(photo);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className={`break-inside-avoid mb-6 relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 ${
        added 
            ? 'shadow-[0_0_30px_rgba(204,255,0,0.4)] ring-4 ring-pickle transform scale-[1.02] z-10' 
            : 'shadow-lg hover:shadow-2xl hover:-translate-y-2'
      }`}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Placeholder Skeleton */}
      {!isLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse h-64 w-full z-20" />}
      
      <div className="relative overflow-hidden bg-gray-900">
        <img 
            src={photo.url} 
            alt="Momento" 
            className={`w-full h-auto block object-cover transform transition-transform duration-700 ease-in-out group-hover:scale-110 will-change-transform ${isLoaded ? 'opacity-100' : 'opacity-0'} ${PREVIEW_QUALITY_CLASS} select-none pointer-events-none`}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onDragStart={(e) => e.preventDefault()}
        />

        <NoiseOverlay />
        <WatermarkOverlay />
        
        {/* Top Gradient for text readability */}
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/60 to-transparent opacity-100 pointer-events-none z-20" />

        {/* ID Badge - Using Filename */}
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-mono text-white/90 border border-white/10 z-20 group-hover:bg-black/70 transition-colors truncate max-w-[140px]">
            {displayName}
        </div>

        {/* Quick Add Button - ALWAYS VISIBLE NOW */}
        <button 
            onClick={toggleCart}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-30 shadow-lg active:scale-90 border-2 ${
                added 
                ? 'bg-pickle text-brand-dark border-pickle scale-110' 
                : 'bg-black/30 text-white backdrop-blur-md border-white/30 hover:bg-white hover:text-brand-dark hover:border-white'
            }`}
        >
            {added ? <Check className="w-5 h-5" strokeWidth={4} /> : <Plus className="w-6 h-6" strokeWidth={3} />}
        </button>

        {/* Bottom Overlay Info */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        
        {/* Caption Slide Up */}
        <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 flex flex-col justify-end">
             <div className="bg-white/10 backdrop-blur-md border-t border-white/10 absolute inset-0 -z-10" />
             <span className="text-white font-display text-sm uppercase tracking-wider text-center">
                Visualizar Foto
             </span>
        </div>

        {/* Selected Overlay Tint */}
        {added && <div className="absolute inset-0 bg-pickle/20 pointer-events-none z-10 mix-blend-overlay" />}
      </div>
    </motion.div>
  );
};

// --- ANIMATION VARIANTS FOR LIGHTBOX ---
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.95
  })
};

export const EventView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<PickleballEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTag, setActiveTag] = useState<string>('All');
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  
  // Swipe & Animation State
  const [[page, direction], setPage] = useState([0, 0]); // [currentIndex, direction]
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const { isInCart, addItem, removeItem, itemsCount, openCart } = useCart();

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

  // Sync internal page state with selectedIndex for animation control
  useEffect(() => {
    if (selectedIndex !== null) {
        setPage([selectedIndex, 0]);
    }
  }, [selectedIndex]);

  const allTags = event?.photos.reduce((acc, photo) => {
    if (photo.tags) {
        photo.tags.forEach(tag => {
            if (!acc.includes(tag)) acc.push(tag);
        });
    }
    return acc;
  }, ['All'] as string[]) || ['All'];

  const paginate = useCallback((newDirection: number) => {
    if (selectedIndex === null) return;
    
    let nextIndex = selectedIndex + newDirection;
    // Loop navigation
    if (nextIndex < 0) nextIndex = filteredPhotos.length - 1;
    if (nextIndex >= filteredPhotos.length) nextIndex = 0;

    setPage([nextIndex, newDirection]);
    setSelectedIndex(nextIndex);
  }, [selectedIndex, filteredPhotos.length]);

  // Swipe Logic
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) paginate(1);
    if (isRightSwipe) paginate(-1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (selectedIndex === null) return;
        if (e.key === 'ArrowRight') paginate(1);
        if (e.key === 'ArrowLeft') paginate(-1);
        if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, paginate]);

  const handleToggleCart = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    if (isInCart(photo.id)) {
        removeItem(photo.id);
    } else {
        addItem(photo);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
        title: event?.title || 'Galeria Remaking Agency',
        text: 'Confira minhas fotos neste evento!',
        url: window.location.href
    };
    if (navigator.share) {
        try { await navigator.share(shareData); } catch (err) { console.log(err); }
    } else {
        setCopied(true);
        navigator.clipboard.writeText(window.location.href);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const nextDiscountTier = itemsCount < 3 ? 3 : itemsCount < 6 ? 6 : itemsCount < 10 ? 10 : null;
  const itemsNeeded = nextDiscountTier ? nextDiscountTier - itemsCount : 0;
  const nextDiscountValue = nextDiscountTier === 3 ? '10%' : nextDiscountTier === 6 ? '20%' : '30%';

  if (loading) return <PickleballLoader />;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-gray-500">Evento não encontrado.</div>;

  const selectedPhoto = selectedIndex !== null ? filteredPhotos[selectedIndex] : null;
  const isSelectedInCart = selectedPhoto ? isInCart(selectedPhoto.id) : false;
  // Use Filename for display in Modal
  const selectedDisplayName = selectedPhoto ? (selectedPhoto.originalName || selectedPhoto.displayId || selectedPhoto.id.substring(0, 5).toUpperCase()) : '';

  return (
    <div className="min-h-screen bg-gray-50 select-none pb-20">
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

      {/* PREMIUM LIGHTBOX MODAL */}
      <AnimatePresence>
      {selectedPhoto && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-dark/95 backdrop-blur-xl"
            onClick={() => setSelectedIndex(null)}
        >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="flex flex-col pointer-events-auto">
                    <div className="flex items-center gap-2">
                        <div className="text-white/80 text-sm font-medium tracking-wide font-mono">
                            {(selectedIndex || 0) + 1} / {filteredPhotos.length}
                        </div>
                        <div className="flex items-center px-1.5 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30 text-[9px] font-bold text-yellow-500 uppercase tracking-widest">
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            Preview
                        </div>
                    </div>
                    {/* Display Filename in Modal */}
                    <div className="text-pickle font-mono text-xs mt-1 opacity-80">{selectedDisplayName}</div>
                </div>

                <div className="flex items-center gap-3 pointer-events-auto">
                    <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all bg-white/10 text-white hover:bg-white/20 border border-white/20"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                        <span className="hidden md:inline">{copied ? 'Copiado!' : 'Compartilhar'}</span>
                    </button>

                    <button 
                        className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 backdrop-blur-md transition-all border border-white/10 hover:rotate-90 active:scale-95"
                        onClick={() => setSelectedIndex(null)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Navigation Arrows (Desktop) */}
            <button 
                className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-black/30 hover:bg-pickle/20 hover:text-pickle hover:border-pickle/50 text-white transition-all border border-white/5 backdrop-blur-sm group"
                onClick={(e) => { e.stopPropagation(); paginate(-1); }}
            >
                <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button 
                className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-black/30 hover:bg-pickle/20 hover:text-pickle hover:border-pickle/50 text-white transition-all border border-white/5 backdrop-blur-sm group"
                onClick={(e) => { e.stopPropagation(); paginate(1); }}
            >
                <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Main Image Area with Swipe Animation */}
            <div 
                className="relative w-full h-full flex items-center justify-center p-0 md:p-12 md:pb-32 overflow-hidden" 
                onClick={e => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Swipe Indicators (Mobile Only) */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:hidden pointer-events-none z-40">
                    <div className={`p-2 rounded-full bg-black/20 text-white/70 backdrop-blur-sm animate-pulse ${selectedIndex === 0 ? 'opacity-0' : 'opacity-100'}`}>
                        <ChevronLeft className="w-6 h-6" />
                    </div>
                    <div className={`p-2 rounded-full bg-black/20 text-white/70 backdrop-blur-sm animate-pulse ${selectedIndex === filteredPhotos.length - 1 ? 'opacity-0' : 'opacity-100'}`}>
                        <ChevronRight className="w-6 h-6" />
                    </div>
                </div>

                <div className="relative w-full h-full max-w-[100vw] max-h-[70vh] md:max-h-[75vh] flex items-center justify-center">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.div
                            key={selectedIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="relative inline-block shadow-2xl overflow-hidden rounded-sm bg-gray-900 max-w-full max-h-full">
                                <img 
                                    src={selectedPhoto.url} 
                                    alt="View" 
                                    className={`max-w-full max-h-[70vh] md:max-h-[75vh] object-contain select-none pointer-events-none ${PREVIEW_QUALITY_CLASS}`} 
                                    onDragStart={(e) => e.preventDefault()}
                                />
                                <NoiseOverlay />
                                <WatermarkOverlay />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Bar Controls & Upsell (Responsive Fixed Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 z-30 bg-white/5 backdrop-blur-xl border-t border-white/10" onClick={e => e.stopPropagation()}>
               
               {/* Upsell Bar */}
               {itemsNeeded > 0 && (
                   <div className="w-full bg-brand-dark/50 py-2 px-4 text-center border-b border-white/5">
                        <p className="text-[10px] md:text-xs text-gray-300">
                            <Sparkles className="w-3 h-3 inline-block text-yellow-400 mr-1" />
                            Mais <span className="text-white font-bold">{itemsNeeded} fotos</span> = <span className="text-pickle font-bold">{nextDiscountValue} OFF</span>
                        </p>
                        <div className="h-0.5 w-full bg-gray-700 mt-1 max-w-xs mx-auto rounded-full overflow-hidden">
                             <div className="h-full bg-pickle transition-all duration-500" style={{ width: `${(itemsCount / nextDiscountTier!) * 100}%` }}></div>
                        </div>
                   </div>
               )}

               {/* Action Buttons Container */}
               <div className="p-4 safe-area-bottom">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
                        
                        {/* Desktop Caption */}
                        <div className="hidden md:block text-white/80 text-sm font-medium">
                            {selectedPhoto.caption || event?.title}
                        </div>

                        {/* Mobile Actions Grid */}
                        <div className="grid grid-cols-2 md:flex gap-3 w-full md:w-auto">
                            
                            {/* 1. Finalizar Button (Left / Secondary visual weight) */}
                             {itemsCount > 0 ? (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); openCart(); }}
                                    className="col-span-1 md:flex-none flex items-center justify-center px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg bg-green-500/90 text-white hover:bg-green-500 border border-green-500/50 backdrop-blur-md"
                                >
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    <span className="truncate">Finalizar ({itemsCount})</span>
                                </button>
                            ) : (
                                <div className="hidden md:block w-0" />
                            )}

                            {/* 2. Eu Quero Essa Button (Right / Primary) */}
                            <button 
                                onClick={(e) => handleToggleCart(e, selectedPhoto)}
                                className={`col-span-1 md:flex-none md:min-w-[180px] flex items-center justify-center px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg transform active:scale-95 border ${
                                    isSelectedInCart 
                                    ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                                    : 'bg-pickle text-brand-dark border-pickle hover:bg-white hover:border-white'
                                } ${itemsCount === 0 ? 'col-span-2' : ''}`}
                            >
                                {isSelectedInCart ? (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" /> <span className="truncate">Remover</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" /> <span className="truncate">Eu Quero Essa</span>
                                    </>
                                )}
                            </button>
                        </div>
                   </div>
               </div>
            </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};