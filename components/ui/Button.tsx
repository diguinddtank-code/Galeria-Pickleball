import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  // Added 'justify-center' to centering content horizontally
  const baseStyles = "inline-flex items-center justify-center px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-all duration-300 transform active:scale-95";
  
  const variants = {
    primary: "bg-pickle text-brand-dark hover:bg-white hover:text-brand-dark hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]",
    outline: "border-2 border-white text-white hover:bg-white hover:text-brand-dark"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};