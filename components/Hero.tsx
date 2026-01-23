import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { ArrowRight, Instagram } from 'lucide-react';
import { Button } from './ui/Button';

const motion = framerMotion as any;

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
              className="w-full lg:w-6/12 text-center lg:text-left z-20"
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

            {/* --- RIGHT: Animated REMAKING Brand Composition --- */}
            <div className="w-full lg:w-6/12 relative h-[500px] hidden md:flex items-center justify-center perspective-1000 mt-10 lg:mt-0">
                
                {/* 1. Background Glow & Atmosphere */}
                <div className="absolute w-[500px] h-[500px] bg-gradient-radial from-pickle/10 to-transparent blur-[80px] animate-pulse-slow" />
                
                {/* 2. Main Glass Card Container */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="relative w-[380px] h-[380px] bg-white/5 backdrop-blur-2xl rounded-[40px] border border-white/10 shadow-2xl flex flex-col items-center justify-center p-8 overflow-hidden group hover:border-pickle/30 transition-colors duration-500"
                >
                    {/* Interior Grid Pattern */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay" />
                    
                    {/* Interior Radial Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

                    {/* --- THE ANIMATED SVG LOGO --- */}
                    <div className="relative w-48 h-48 mb-6">
                        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#CCFF00" />
                                    <stop offset="100%" stopColor="#22c55e" />
                                </linearGradient>
                                <filter id="glowHero">
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Orbiting Ring 1 (Dashed) */}
                            <motion.circle 
                                cx="100" cy="100" r="90" 
                                stroke="#ffffff" strokeWidth="1" strokeOpacity="0.2" fill="none"
                                strokeDasharray="10 10"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                style={{ originX: "100px", originY: "100px" }}
                            />

                            {/* Orbiting Ring 2 (Counter-Rotating) */}
                            <motion.circle 
                                cx="100" cy="100" r="75" 
                                stroke="url(#neonGradient)" strokeWidth="1.5" fill="none"
                                strokeDasharray="60 180"
                                strokeLinecap="round"
                                filter="url(#glowHero)"
                                animate={{ rotate: -360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                style={{ originX: "100px", originY: "100px" }}
                            />

                            {/* Central Shutter Mechanism */}
                            <motion.g 
                                initial={{ scale: 0.9 }}
                                animate={{ scale: [0.9, 1, 0.9] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                style={{ originX: "100px", originY: "100px" }}
                            >
                                {/* Background Circle */}
                                <circle cx="100" cy="100" r="50" fill="#0f172a" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.1" />
                                
                                {/* Shutter Blades */}
                                <g transform="translate(100 100)">
                                    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                                        <motion.path
                                            key={i}
                                            d="M0 -50 L20 -10 L0 30 L-20 -10 Z"
                                            fill={i % 2 === 0 ? "#CCFF00" : "#ffffff"}
                                            opacity="0.9"
                                            transform={`rotate(${angle}) translate(0, -10)`}
                                            initial={{ scale: 0.8 }}
                                            animate={{ translateY: [0, -5, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                                        />
                                    ))}
                                </g>

                                {/* Center Lens */}
                                <circle cx="100" cy="100" r="15" fill="white" className="animate-pulse" />
                            </motion.g>
                        </svg>
                    </div>

                    {/* Brand Name Typography */}
                    <div className="text-center z-10">
                        <motion.h2 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl font-display font-bold text-white tracking-widest leading-none mb-1"
                        >
                            REMAKING
                        </motion.h2>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="h-0.5 bg-gradient-to-r from-transparent via-pickle to-transparent w-full mb-2"
                        />
                        <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-sm font-mono text-gray-400 uppercase tracking-[0.5em] ml-1"
                        >
                            AGENCY
                        </motion.span>
                    </div>
                </motion.div>

                {/* Decorative Floating Particles */}
                <motion.div 
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 right-20 w-3 h-3 bg-pickle rounded-full blur-[2px]"
                />
                <motion.div 
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-32 left-20 w-2 h-2 bg-white rounded-full blur-[1px]"
                />

            </div>
        </div>
      </div>
    </section>
  );
};