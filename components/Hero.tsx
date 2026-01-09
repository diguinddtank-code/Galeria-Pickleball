import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Instagram } from 'lucide-react';
import { Button } from './ui/Button';

interface HeroProps {
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-brand-dark pt-32 pb-12 overflow-hidden">
      
      {/* Background Photo & Overlay */}
      <div className="absolute inset-0 z-0 select-none">
        {/* Animated Background Image */}
        <motion.div 
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 25, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            className="w-full h-full"
        >
            <img 
                src="https://t3.ftcdn.net/jpg/05/67/37/28/360_F_567372856_RVmqo9kvrsKoDJJMZhGxo746rUZkncW0.jpg" 
                alt="Pickleball Court Background" 
                className="w-full h-full object-cover filter brightness-[0.6] contrast-[1.2] grayscale-[0.3]" 
            />
        </motion.div>

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-black/30"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            
            {/* --- LEFT: Content --- */}
            <motion.div
              className="w-full lg:w-7/12 text-center lg:text-left z-20"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 mb-8 backdrop-blur-md shadow-xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pickle opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pickle"></span>
                </span>
                <span className="text-xs font-bold text-white tracking-widest uppercase">Cobertura Fotográfica Profissional</span>
              </div>
              
              <h1 className="font-display font-black text-5xl md:text-7xl xl:text-8xl text-white mb-8 leading-[0.9] tracking-tight drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                CAPTURE A SUA <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">MELHOR JOGADA</span>
              </h1>
              
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 font-light border-l-2 border-pickle pl-6">
                A <strong>Remaking Agency</strong> traz qualidade profissional para o Pickleball. Encontre suas fotos, reviva a emoção e adquira seus melhores momentos em alta resolução.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Button onClick={onOpenBooking} className="w-full sm:w-auto group px-10 py-4 text-base shadow-[0_0_25px_rgba(255,255,255,0.2)] bg-white text-brand-dark hover:bg-gray-200">
                   Ver Coberturas <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <a 
                    href="https://instagram.com/remakingagency" 
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm border-2 border-white/20 text-white hover:bg-white hover:text-brand-dark transition-all duration-300 backdrop-blur-sm"
                >
                    <Instagram className="w-5 h-5 mr-2" />
                    Siga no Insta
                </a>
              </div>
            </motion.div>

            {/* --- RIGHT: Photo Stack Visuals --- */}
            <div className="w-full lg:w-5/12 relative h-[450px] hidden md:flex items-center justify-center lg:justify-end perspective-1000 mt-10 lg:mt-0">
                {/* Photo 1 (Back) */}
                <motion.div 
                    className="absolute w-64 h-80 md:w-72 md:h-96 bg-gray-800 rounded-xl shadow-2xl border-4 border-white transform rotate-[-6deg] overflow-hidden"
                    initial={{ opacity: 0, rotate: -15, x: -50 }}
                    animate={{ opacity: 1, rotate: -6, x: -40 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                     <img src="https://images.unsplash.com/photo-1599586120429-48285b6a8a81?q=80&w=1000" className="w-full h-full object-cover opacity-60 grayscale" alt="Event" />
                </motion.div>

                {/* Photo 2 (Front) */}
                <motion.div 
                    className="relative w-64 h-80 md:w-72 md:h-96 bg-gray-900 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border-[6px] border-white transform rotate-[3deg] z-20 overflow-hidden group cursor-pointer"
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    onClick={onOpenBooking}
                >
                     <img src="https://images.unsplash.com/photo-1626244422204-62927051a24d?q=80&w=1000" className="w-full h-full object-cover" alt="Main Event" />
                     {/* Gradient overlay */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                     <div className="absolute bottom-6 left-0 w-full text-center">
                        <span className="bg-pickle text-brand-dark px-3 py-1 text-xs font-bold uppercase">Disponível</span>
                     </div>
                </motion.div>
            </div>
        </div>
      </div>
    </section>
  );
};