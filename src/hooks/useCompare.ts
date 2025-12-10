import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const useCompare = () => {
    const [compareItems, setCompareItems] = useState<Product[]>([]);
    const { toast } = useToast();
    const { language } = useLanguage();

    const loadCompareList = useCallback(() => {
        const saved = localStorage.getItem('koshiro_compare_list');
        if (saved) {
            try {
                setCompareItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse compare list", e);
                setCompareItems([]);
            }
        } else {
            setCompareItems([]);
        }
    }, []);

    useEffect(() => {
        loadCompareList();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'koshiro_compare_list') {
                loadCompareList();
            }
        };

        const handleCustomUpdate = () => {
            loadCompareList();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('compareUpdated', handleCustomUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('compareUpdated', handleCustomUpdate);
        };
    }, [loadCompareList]);

    const addToCompare = (product: Product) => {
        if (compareItems.length >= 4) {
            toast({
                title: language === 'vi' ? "Giới hạn so sánh" :
                    language === 'ja' ? "比較制限" :
                        "Compare Limit",
                description: language === 'vi' ? "Bạn chỉ có thể so sánh tối đa 4 sản phẩm" :
                    language === 'ja' ? "最大4つの商品を比較できます" :
                        "You can compare up to 4 products",
                variant: "destructive",
            });
            return false;
        }

        if (compareItems.find(p => p._id === product._id)) {
            toast({
                title: language === 'vi' ? "Sản phẩm đã có" :
                    language === 'ja' ? "商品は既に追加済み" :
                        "Product Already Added",
                description: language === 'vi' ? "Sản phẩm này đã có trong danh sách so sánh" :
                    language === 'ja' ? "この商品は既に比較リストにあります" :
                        "This product is already in the compare list",
                variant: "destructive",
            });
            return false;
        }

        const newCompareList = [...compareItems, product];
        localStorage.setItem('koshiro_compare_list', JSON.stringify(newCompareList));
        setCompareItems(newCompareList);
        window.dispatchEvent(new CustomEvent('compareUpdated'));

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
        const newCompareList = compareItems.filter(p => p._id !== productId);
        localStorage.setItem('koshiro_compare_list', JSON.stringify(newCompareList));
        setCompareItems(newCompareList);
        window.dispatchEvent(new CustomEvent('compareUpdated'));

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
        localStorage.removeItem('koshiro_compare_list');
        setCompareItems([]);
        window.dispatchEvent(new CustomEvent('compareUpdated'));

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
