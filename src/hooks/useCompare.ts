import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { guestCompareService, GuestCompareItem } from '@/lib/guestStorage';

export const useCompare = () => {
    const [compareItems, setCompareItems] = useState<Product[]>([]);
    const { toast } = useToast();
    const { language } = useLanguage();

    const loadCompareList = useCallback(() => {
        // Load from guestCompareService and extract Product objects
        const guestItems = guestCompareService.getCompareList();
        const products = guestItems.map(item => item.product);
        setCompareItems(products);
    }, []);

    useEffect(() => {
        loadCompareList();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'koshiro_guest_compare') {
                loadCompareList();
            }
        };

        const handleCustomUpdate = () => {
            loadCompareList();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('compareUpdated', handleCustomUpdate);
        window.addEventListener('guestCompareUpdated', handleCustomUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('compareUpdated', handleCustomUpdate);
            window.removeEventListener('guestCompareUpdated', handleCustomUpdate);
        };
    }, [loadCompareList]);

    const addToCompare = (product: Product) => {
        const result = guestCompareService.addToCompare(product);

        if (!result.success) {
            if (result.message?.includes('Maximum')) {
                toast({
                    title: language === 'vi' ? "Giới hạn so sánh" :
                        language === 'ja' ? "比較制限" :
                            "Compare Limit",
                    description: language === 'vi' ? "Bạn chỉ có thể so sánh tối đa 4 sản phẩm" :
                        language === 'ja' ? "最大4つの商品を比較できます" :
                            "You can compare up to 4 products",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: language === 'vi' ? "Sản phẩm đã có" :
                        language === 'ja' ? "商品は既に追加済み" :
                            "Product Already Added",
                    description: language === 'vi' ? "Sản phẩm này đã có trong danh sách so sánh" :
                        language === 'ja' ? "この商品は既に比較リストにあります" :
                            "This product is already in the compare list",
                    variant: "destructive",
                });
            }
            return false;
        }

        loadCompareList();

        toast({
            title: language === 'vi' ? "Đã thêm vào so sánh" :
                language === 'ja' ? "比較リストに追加" :
                    "Added to Compare",
            description: language === 'vi' ? "Sản phẩm đã được thêm vào danh sách so sánh" :
                language === 'ja' ? "商品が比較リストに追加されました" :
                    "Product has been added to compare list",
        });

        return true;
    };

    const removeFromCompare = (productId: string) => {
        guestCompareService.removeFromCompare(productId);
        loadCompareList();

        toast({
            title: language === 'vi' ? "Đã xóa khỏi so sánh" :
                language === 'ja' ? "比較から削除" :
                    "Removed from Compare",
            description: language === 'vi' ? "Sản phẩm đã được xóa khỏi danh sách so sánh" :
                language === 'ja' ? "商品が比較リストから削除されました" :
                    "Product has been removed from compare list",
        });
    };

    const clearCompareList = () => {
        guestCompareService.clearCompare();
        setCompareItems([]);

        toast({
            title: language === 'vi' ? "Đã xóa danh sách" :
                language === 'ja' ? "リストをクリア" :
                    "List Cleared",
            description: language === 'vi' ? "Danh sách so sánh đã được xóa" :
                language === 'ja' ? "比較リストがクリアされました" :
                    "Compare list has been cleared",
        });
    };

    return {
        compareItems,
        compareCount: compareItems.length,
        addToCompare,
        removeFromCompare,
        clearCompareList
    };
};
