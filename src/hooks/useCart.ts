import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts';

export const CART_QUERY_KEY = ['cart'];

export const useCart = () => {
    const { isAuthenticated } = useAuth();

    const cartQuery = useQuery({
        queryKey: CART_QUERY_KEY,
        queryFn: async () => {
            if (!isAuthenticated) return { items: [], total: 0 };
            return api.getCart();
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60, // 1 minute
    });

    const cartItems = cartQuery.data?.items || [];
    const cartTotal = cartQuery.data?.total || 0;

    // Calculate total number of items (sum of quantities)
    const itemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    return {
        ...cartQuery,
        cartItems,
        cartTotal,
        itemsCount
    };
};
