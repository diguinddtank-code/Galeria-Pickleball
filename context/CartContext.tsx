import React, { createContext, useContext, useState, useEffect } from 'react';
import { Photo } from '../types';

interface CartContextType {
  items: Photo[];
  addItem: (photo: Photo) => void;
  removeItem: (photoId: string) => void;
  isInCart: (photoId: string) => boolean;
  clearCart: () => void;
  total: number;
  subtotal: number;
  discount: number;
  discountPercent: number;
  itemsCount: number;
  unitPrice: number; // New field to expose current unit price
  // UI State
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Photo[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = (photo: Photo) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === photo.id)) return prev;
      return [...prev, photo];
    });
    // Optional: Open cart when item is added for better feedback
    // setIsCartOpen(true); 
  };

  const removeItem = (photoId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== photoId));
  };

  const isInCart = (photoId: string) => {
    return items.some((p) => p.id === photoId);
  };

  const clearCart = () => setItems([]);
  
  // UI Actions
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  // --- PRICING LOGIC UPDATE ---
  const itemsCount = items.length;
  const BASE_PRICE = 12; // R$ 12.00 initially
  
  let unitPrice = BASE_PRICE;

  if (itemsCount > 5) {
    unitPrice = 5; // R$ 5.00 each if > 5 (6 or more)
  } else if (itemsCount >= 3) {
    unitPrice = 7; // R$ 7.00 each if >= 3
  }

  // Subtotal is based on the base price to show the "value" saved
  const subtotal = itemsCount * BASE_PRICE; 
  const total = itemsCount * unitPrice;
  const discount = subtotal - total;
  const discountPercent = subtotal > 0 ? discount / subtotal : 0;

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      isInCart,
      clearCart,
      total,
      subtotal,
      discount,
      discountPercent,
      itemsCount,
      unitPrice,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};