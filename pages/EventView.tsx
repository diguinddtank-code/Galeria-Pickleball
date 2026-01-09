import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Download, Share2, X, Maximize2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { dataService } from '../services/dataService';
import { PickleballEvent, Photo } from '../types';

// Custom Animated Pickleball SVG Component
const PickleballIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#bef264" stroke="#65a30d" strokeWidth="4"/>
    <circle cx="50" cy="50" r="8" fill="#ecfccb" opacity="0.8"/>
    <circle cx="50" cy="20" r="6" fill="#ecfccb" opacity="0.8"/>
    <circle cx="50" cy="80" r="6" fill="#ecfccb" opacity="0.8"/>
    <circle cx="20" cy="50" r="6" fill="#ecfccb" opacity="0.8"/>
    <circle cx="80" cy="50" r="6" fill="#ecfccb" opacity="0.8"/>
    <circle cx="28" cy="28" r="5" fill="#ecfccb" opacity="0.6"/>
    <circle cx="72" cy="72" r="5" fill="#ecfccb" opacity="0.6"/>
    <circle cx="72" cy="28" r="5" fill="#ecfccb" opacity="0.6"/>
    <circle cx="28" cy="72" r="5" fill="#ecfccb" opacity="0.6"/>
  </svg>
);

const PickleballLoader = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative">
          <PickleballIcon className="w-16 h-16 animate-bounce text-pickle-500 drop-shadow-xl" />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/10 rounded-[100%] blur-sm animate-[pulse_1s_ease-in-out_infinite]"></div>
      </div>
      <p className="mt-8 text-pickle-800 font-bold tracking-widest uppercase text-sm animate-pulse">Carregando Fotos...</p>
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

  return (
    <div 
      className={`break-inside-avoid mb-6 relative group cursor-zoom-in rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 ease-out transform backface-hidden ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${(index % 10) * 100}ms` }}
      onClick={onClick}
    >
      {/* Placeholder */}
      {!isLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse h-64 w-full" />}
      
      <img 
        src={photo.url} 
        alt="Momento do evento" 
        className={`w-full h-auto block object-cover transform transition-transform duration-700 group-hover:scale-105 will-change-transform ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
      />
      
      {/* Overlay Premium Hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 delay-75 border border-white/30">
            <Maximize2 className="w-6 h-6 text-white" />
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

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (event && selectedIndex !== null) {
        setSelectedIndex((prev) => (prev !== null && prev < event.photos.length - 1 ? prev + 1 : 0));
    }
  }, [event, selectedIndex]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (event && selectedIndex !== null) {
         setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : event.photos.length - 1));
    }
  }, [event, selectedIndex]);

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
          title: event?.title || 'PickleballBH Evento',
          text: 'Confira as fotos deste evento incrível!',
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

  if (loading) return <PickleballLoader />;
  if (!event) return <div className="min-h-screen flex items-center justify-center text-gray-500">Evento não encontrado.</div>;

  const selectedPhoto = selectedIndex !== null ? event.photos[selectedIndex] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Immersve Hero Header */}
      <div className="relative h-[60vh] w-full overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <img 
            src={event.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-60 scale-105 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-gray-900/90" />
        </div>
        
        {/* Fixed overlap issue: Increased top position to account for Navbar */}
        <div className="absolute top-24 left-0 p-6 z-20">
            <Link 
                to="/" 
                className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all text-sm font-medium border border-white/10 hover:border-white/30"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
            </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 z-20 transform translate-y-1/2">
             {/* Floating Info Card */}
             <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pickle-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                <div className="absolute top-4 right-4 opacity-10">
                    <PickleballIcon className="w-20 h-20" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                                {event.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm md:text-base font-medium mb-6">
                                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg text-pickle-700">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {new Date(event.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600">
                                    <MapPin className="w-4 h-4 mr-2 text-pickle-500" />
                                    {event.location}
                                </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-lg border-l-4 border-pickle-300 pl-4 italic">
                                "{event.description}"
                            </p>
                        </div>
                        
                        <div className="flex-shrink-0 flex md:flex-col gap-3">
                            <button 
                                onClick={handleShare}
                                className="flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                            >
                                {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                                {copied ? 'Copiado!' : 'Compartilhar'}
                            </button>
                            <div className="text-center text-xs text-gray-400 mt-2 font-medium">
                                {event.photos.length} Fotos
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
      </div>

      {/* Gallery Grid - Masonry */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-20">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {event.photos.map((photo, index) => (
            <ImageCard 
                key={photo.id} 
                photo={photo} 
                index={index}
                onClick={() => setSelectedIndex(index)} 
            />
          ))}
        </div>
        
        {event.photos.length === 0 && (
            <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200 mt-8">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Galeria Vazia</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                    O organizador ainda não adicionou as fotos oficiais deste evento. Volte em breve!
                </p>
            </div>
        )}
      </div>

      {/* Premium Lightbox Modal */}
      {selectedPhoto && (
        <div 
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-all duration-300 animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setSelectedIndex(null)}
        >
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
                <div className="text-white/80 text-sm font-medium tracking-wide">
                    {selectedIndex !== null ? selectedIndex + 1 : 0} / {event.photos.length}
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
            >
                <img 
                    src={selectedPhoto.url} 
                    alt="Full View" 
                    className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm animate-[fadeIn_0.3s_ease-out]" 
                />
            </div>

            <div 
                className="absolute bottom-0 w-full p-6 flex justify-center z-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"
            >
               <a 
                 href={selectedPhoto.url} 
                 download={`pickleballbh-${event.id}-${selectedPhoto.id}.jpg`}
                 className="flex items-center bg-white/90 text-gray-900 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white transition-colors shadow-lg pointer-events-auto hover:scale-105 active:scale-95"
                 onClick={(e) => e.stopPropagation()}
               >
                 <Download className="w-4 h-4 mr-2" /> Baixar Foto
               </a>
            </div>
            
            <div className="absolute left-0 top-20 bottom-20 w-1/4 z-10 md:hidden" onClick={handlePrev}></div>
            <div className="absolute right-0 top-20 bottom-20 w-1/4 z-10 md:hidden" onClick={handleNext}></div>
        </div>
      )}
    </div>
  );
};