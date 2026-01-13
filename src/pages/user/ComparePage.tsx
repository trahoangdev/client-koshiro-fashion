import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { api, Product } from "@/lib/api";
import { guestWishlistService } from "@/lib/guestStorage";
import { useAuth } from "@/contexts";
import { useCompare } from "@/hooks/useCompare";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GitCompare,
  X,
  Plus,
  Star,
  ShoppingCart,
  Heart,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

const ComparePage = () => {
  const { language } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { compareItems: compareList, removeFromCompare, clearCompareList } = useCompare();

  const handleAddToCart = async (product: Product) => {
    try {
      await api.addToCart(product._id, 1);
      window.dispatchEvent(new CustomEvent('cartUpdated'));

      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: language === 'vi' ? 'Đã thêm sản phẩm vào giỏ hàng' :
          language === 'ja' ? '商品をカートに追加しました' :
            'Product added to cart',
      });
    } catch (error) {
      console.error('Error adding to cart', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể thêm sản phẩm vào giỏ hàng' :
          language === 'ja' ? '商品をカートに追加できません' :
            'Unable to add product to cart',
        variant: 'destructive',
      });
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    try {
      if (isAuthenticated) {
        await api.addToWishlist(product._id);
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      } else {
        guestWishlistService.addToWishlist(product);
        window.dispatchEvent(new CustomEvent('guestWishlistUpdated'));
      }
      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: language === 'vi' ? 'Đã thêm sản phẩm vào danh sách yêu thích' :
          language === 'ja' ? '商品をお気に入りに追加しました' :
            'Product added to wishlist',
      });
    } catch (error) {
      console.error('Error adding to wishlist', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể thêm sản phẩm vào danh sách yêu thích' :
          language === 'ja' ? '商品をお気に入りに追加できません' :
            'Unable to add product to wishlist',
        variant: 'destructive',
      });
    }
  };

  const getProductName = (product: Product) => {
    switch (language) {
      case 'vi':
        return product.nameEn || product.name;
      case 'ja':
        return product.nameJa || product.name;
      default:
        return product.nameEn || product.name;
    }
  };

  const translations = {
    en: {
      title: "Compare Products",
      subtitle: "Compare up to 4 products side by side",
      emptyTitle: "No products to compare",
      emptyDesc: "Add products to your compare list to see them side by side",
      addProducts: "Add Products",
      clearList: "Clear List",
      price: "Price",
      category: "Category",
      rating: "Rating",
      availability: "Availability",
      description: "Description",
      features: "Features",
      addToCart: "Add to Cart",
      addToWishlist: "Add to Wishlist",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      remove: "Remove"
    },
    vi: {
      title: "So Sánh Sản Phẩm",
      subtitle: "So sánh tối đa 4 sản phẩm cạnh nhau",
      emptyTitle: "Không có sản phẩm để so sánh",
      emptyDesc: "Thêm sản phẩm vào danh sách so sánh để xem chúng cạnh nhau",
      addProducts: "Thêm Sản Phẩm",
      clearList: "Xóa Danh Sách",
      price: "Giá",
      category: "Danh Mục",
      rating: "Đánh Giá",
      availability: "Tình Trạng",
      description: "Mô Tả",
      features: "Tính Năng",
      addToCart: "Thêm Vào Giỏ",
      addToWishlist: "Thêm Vào Yêu Thích",
      inStock: "Còn Hàng",
      outOfStock: "Hết Hàng",
      remove: "Xóa"
    },
    ja: {
      title: "商品比較",
      subtitle: "最大4つの商品を並べて比較",
      emptyTitle: "比較する商品がありません",
      emptyDesc: "比較リストに商品を追加して並べて表示",
      addProducts: "商品を追加",
      clearList: "リストをクリア",
      price: "価格",
      category: "カテゴリ",
      rating: "評価",
      availability: "在庫状況",
      description: "説明",
      features: "特徴",
      addToCart: "カートに追加",
      addToWishlist: "お気に入りに追加",
      inStock: "在庫あり",
      outOfStock: "在庫切れ",
      remove: "削除"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">


      <main className="py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Banner Background */}
              <div className="absolute inset-0">
                <img
                  src={settings?.banners?.compare || "/images/banners/banner-02.png"}
                  alt="Compare Products Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-12 md:p-16 text-white">

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed mb-6">
                  {t.subtitle}
                </p>

                {compareList.length > 0 && (
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={clearCompareList}
                      className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      {t.clearList}
                    </Button>
                    <Link to="/">
                      <Button className="bg-white text-black hover:bg-white/90 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                        <Plus className="h-4 w-4 mr-2" />
                        {t.addProducts}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Compare Table */}
          {compareList.length === 0 ? (
            <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t.emptyTitle}</h2>
                <p className="text-muted-foreground mb-8 font-medium text-lg">{t.emptyDesc}</p>
                <Link to="/">
                  <Button size="lg" className="rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.addProducts}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 bg-primary/10">
                        <th className="p-4 text-left font-bold min-w-[200px]">
                          {language === 'vi' ? 'Tính Năng' : language === 'ja' ? '機能' : 'Features'}
                        </th>
                        {compareList.map((product) => (
                          <th key={product._id} className="p-4 text-center font-bold min-w-[250px] relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => removeFromCompare(product._id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="pt-8">
                              <img
                                src={product.cloudinaryImages?.[0]?.responsiveUrls?.medium || product.images[0] || '/placeholder.svg'}
                                alt={getProductName(product)}
                                className="w-32 h-32 object-cover mx-auto mb-4 rounded-lg border-2 shadow-lg"
                              />
                              <h3 className="font-bold mb-2 text-lg">{getProductName(product)}</h3>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Price */}
                      <tr className="border-b hover:bg-muted/30 transition-all">
                        <td className="p-4 font-bold">{t.price}</td>
                        {compareList.map((product) => (
                          <td key={product._id} className="p-4 text-center">
                            <div className="space-y-2">
                              <div className="text-xl font-bold text-primary">
                                {product.salePrice && product.salePrice < product.price ? formatCurrency(product.salePrice, language) : formatCurrency(product.price, language)}
                              </div>
                              {product.salePrice && product.salePrice < product.price && (
                                <div className="flex flex-col items-center space-y-2">
                                  <span className="text-sm text-muted-foreground line-through font-medium">
                                    {formatCurrency(product.price, language)}
                                  </span>
                                  <Badge variant="destructive" className="text-xs font-semibold rounded-lg">
                                    -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                                    {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'OFF'}
                                  </Badge>
                                </div>
                              )}
                              {product.onSale && !(product.salePrice && product.salePrice < product.price) && (
                                <Badge variant="destructive" className="text-xs font-semibold rounded-lg">
                                  {language === 'vi' ? 'KHUYẾN MÃI' : language === 'ja' ? 'セール' : 'SALE'}
                                </Badge>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Category */}
                      <tr className="border-b hover:bg-muted/30 transition-all">
                        <td className="p-4 font-bold">{t.category}</td>
                        {compareList.map((product) => (
                          <td key={product._id} className="p-4 text-center font-medium">
                            {typeof product.categoryId === 'string'
                              ? 'Unknown Category'
                              : product.categoryId?.name || 'Unknown Category'}
                          </td>
                        ))}
                      </tr>

                      {/* Rating */}
                      <tr className="border-b hover:bg-muted/30 transition-all">
                        <td className="p-4 font-bold">{t.rating}</td>
                        {compareList.map((product) => (
                          <td key={product._id} className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold">4.5</span>
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Availability */}
                      <tr className="border-b hover:bg-muted/30 transition-all">
                        <td className="p-4 font-bold">{t.availability}</td>
                        {compareList.map((product) => (
                          <td key={product._id} className="p-4 text-center">
                            <Badge variant={product.stock > 0 ? "default" : "secondary"} className="text-sm font-semibold rounded-lg border-2">
                              {product.stock > 0 ? t.inStock : t.outOfStock}
                            </Badge>
                          </td>
                        ))}
                      </tr>

                      {/* Description */}
                      <tr className="border-b hover:bg-muted/30 transition-all">
                        <td className="p-4 font-bold">{t.description}</td>
                        {compareList.map((product) => (
                          <td key={product._id} className="p-4 text-center">
                            <div className="text-sm text-muted-foreground line-clamp-3 font-medium leading-relaxed">
                              <MarkdownRenderer
                                content={product.description || ''}
                                stripMarkdown
                                className="text-sm"
                              />
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Actions */}
                      <tr>
                        <td className="p-4 font-bold">{language === 'vi' ? 'Thao Tác' : language === 'ja' ? '操作' : 'Actions'}</td>
                        {compareList.map((product) => (
                          <td key={product._id} className="p-4 text-center">
                            <div className="space-y-2">
                              <Button size="sm" className="w-full rounded-lg font-semibold shadow-md hover:shadow-lg transition-all" onClick={() => handleAddToCart(product)}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {t.addToCart}
                              </Button>
                              <Button variant="outline" size="sm" className="w-full rounded-lg font-semibold border-2" onClick={() => handleAddToWishlist(product)}>
                                <Heart className="h-4 w-4 mr-2" />
                                {t.addToWishlist}
                              </Button>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>


    </div>
  );
};

export default ComparePage; 