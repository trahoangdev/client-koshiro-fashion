import React from 'react';
import { useMiniCart } from '@/contexts/MiniCartContext';
import { useAuth } from '@/contexts';
import { api } from '@/lib/api';
import { cartService, CartItem } from '@/lib/cartService';
import MiniCart from './MiniCart';

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
            setCartItems(response.items);
          }
        } else {
          // Load from localStorage
          const localCart = cartService.getCart();
          setCartItems(localCart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Fallback to localStorage
        const localCart = cartService.getCart();
        setCartItems(localCart);
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

