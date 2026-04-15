import React from 'react';
import { useMiniCart } from '@/contexts/MiniCartContext';
import { useAuth } from '@/contexts';
import { api, type CartItem } from '@/lib/api';
import { cartService } from '@/lib/cartService';
import MiniCart from './MiniCart';

type CartItemSource = {
  product: CartItem['product'];
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  size?: string;
  color?: string;
};

const normalizeCartItems = (items: CartItemSource[]): CartItem[] => (
  items.map(item => ({
    product: item.product,
    quantity: item.quantity,
    selectedSize: item.selectedSize || item.size || '',
    selectedColor: item.selectedColor || item.color || ''
  }))
);

const MiniCartWrapper: React.FC = () => {
  const { isOpen, addedProduct, closeMiniCart } = useMiniCart();
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);

  // Load cart items
  React.useEffect(() => {
    const loadCart = async () => {
      try {
        if (isAuthenticated) {
          // Load from API
          const response = await api.getCart();
          if (response && response.items) {
            setCartItems(normalizeCartItems(response.items));
          }
        } else {
          // Load from localStorage
          const localCart = cartService.getCart();
          setCartItems(normalizeCartItems(localCart));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Fallback to localStorage
        const localCart = cartService.getCart();
        setCartItems(normalizeCartItems(localCart));
      }
    };

    if (isOpen) {
      loadCart();
    }
  }, [isOpen, isAuthenticated]);

  return (
    <MiniCart
      isOpen={isOpen}
      onClose={closeMiniCart}
      cartItems={cartItems}
      addedProduct={addedProduct}
    />
  );
};

export default MiniCartWrapper;

