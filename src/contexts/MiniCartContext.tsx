import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem } from '@/types/cart';
import { Product } from '@/lib/api';

interface MiniCartContextType {
  isOpen: boolean;
  addedProduct: CartItem | null;
  openMiniCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  closeMiniCart: () => void;
  clearAddedProduct: () => void;
}

const MiniCartContext = createContext<MiniCartContextType | undefined>(undefined);

export const useMiniCart = () => {
  const context = useContext(MiniCartContext);
  if (!context) {
    throw new Error('useMiniCart must be used within MiniCartProvider');
  }
  return context;
};

interface MiniCartProviderProps {
  children: ReactNode;
}

export const MiniCartProvider: React.FC<MiniCartProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [addedProduct, setAddedProduct] = useState<CartItem | null>(null);

  const openMiniCart = useCallback((product: Product, quantity: number = 1, size?: string, color?: string) => {
    const cartItem: CartItem = {
      productId: product._id,
      product,
      quantity,
      selectedSize: size,
      selectedColor: color,
    };
    
    setAddedProduct(cartItem);
    setIsOpen(true);
  }, []);

  const closeMiniCart = useCallback(() => {
    setIsOpen(false);
    // Keep addedProduct for a moment for smooth transition
    setTimeout(() => {
      setAddedProduct(null);
    }, 300);
  }, []);

  const clearAddedProduct = useCallback(() => {
    setAddedProduct(null);
  }, []);

  return (
    <MiniCartContext.Provider
      value={{
        isOpen,
        addedProduct,
        openMiniCart,
        closeMiniCart,
        clearAddedProduct,
      }}
    >
      {children}
    </MiniCartContext.Provider>
  );
};

