import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts';
import { useEffect, useState, useCallback } from 'react';
import { guestCartService } from '@/lib/guestStorage';

export const CART_QUERY_KEY = ['cart'];

export const useCart = () => {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [guestCartCount, setGuestCartCount] = useState(0);

    // Load guest cart count
    const loadGuestCart = useCallback(() => {
        if (!isAuthenticated) {
            const guestItems = guestCartService.getCart();
            const count = guestItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
            setGuestCartCount(count);
        }
    }, [isAuthenticated]);

    // Listen for guest cart updates
    useEffect(() => {
        loadGuestCart();

        const handleGuestCartUpdate = () => {
            loadGuestCart();
        };

        window.addEventListener('guestCartUpdated', handleGuestCartUpdate);
        window.addEventListener('storage', (e) => {
            if (e.key === 'koshiro_guest_cart') {
                loadGuestCart();
            }
        });

        return () => {
            window.removeEventListener('guestCartUpdated', handleGuestCartUpdate);
        };
    }, [loadGuestCart]);

    const cartQuery = useQuery({
        queryKey: CART_QUERY_KEY,
        queryFn: async () => {
            if (!isAuthenticated) return { items: [], total: 0 };
            return api.getCart();
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60, // 1 minute
    });

    // Listen for custom cart update events (authenticated)
    useEffect(() => {
        const handleCartUpdate = () => {
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [queryClient]);

    const cartItems = cartQuery.data?.items || [];
    const cartTotal = cartQuery.data?.total || 0;

    // Calculate total number of items (sum of quantities)
    const authenticatedItemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Return combined count - authenticated or guest
    const itemsCount = isAuthenticated ? authenticatedItemsCount : guestCartCount;

    return {
        ...cartQuery,
        cartItems,
        cartTotal,
        itemsCount
    };
};
