import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, Product } from '@/lib/api';
import { useAuth } from '@/contexts';
import { useEffect } from 'react';

export const WISHLIST_QUERY_KEY = ['wishlist'];

export const useWishlist = () => {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const wishlistQuery = useQuery({
        queryKey: WISHLIST_QUERY_KEY,
        queryFn: async () => {
            if (!isAuthenticated) return [];
            const response = await api.getWishlist();
            // Helpers to parse response similar to Header.tsx
            let wishlistData: Product[] = [];
            if (Array.isArray(response)) {
                wishlistData = response;
            } else if (response && typeof response === 'object') {
                const responseObj = response as unknown as Record<string, unknown>;
                if ('data' in responseObj && Array.isArray(responseObj.data)) {
                    wishlistData = responseObj.data as Product[];
                } else if ('wishlist' in responseObj && Array.isArray(responseObj.wishlist)) {
                    wishlistData = responseObj.wishlist as Product[];
                }
            }
            return wishlistData;
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    useEffect(() => {
        const handleWishlistUpdate = () => {
            queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
        };
        window.addEventListener('wishlistUpdated', handleWishlistUpdate);
        return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    }, [queryClient]);

    return {
        ...wishlistQuery,
        wishlistItems: wishlistQuery.data || [],
        wishlistCount: wishlistQuery.data?.length || 0,
    };
};
