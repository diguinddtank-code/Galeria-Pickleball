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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Photo[]>([]);

  const addItem = (photo: Photo) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === photo.id)) return prev;
      return [...prev, photo];
    });
  };

  const removeItem = (photoId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== photoId));
  };

  const isInCart = (photoId: string) => {
    return items.some((p) => p.id === photoId);
  };

  const clearCart = () => setItems([]);

  // Pricing Logic
  const PRICE_PER_PHOTO = 15; // Updated to R$ 15.00
  const itemsCount = items.length;
  const subtotal = itemsCount * PRICE_PER_PHOTO;

  let discountPercent = 0;
  
  // Progressive Discount Logic
  if (itemsCount >= 3 && itemsCount <= 5) {
    discountPercent = 0.10; // 10% for 3-5 photos
  } else if (itemsCount >= 6 && itemsCount <= 10) {
    discountPercent = 0.20; // 20% for 6-10 photos
  } else if (itemsCount > 10) {
    discountPercent = 0.30; // 30% for >10 photos
  }

  const discount = subtotal * discountPercent;
  const total = subtotal - discount;

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
      itemsCount
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