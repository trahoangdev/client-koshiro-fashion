import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts";
import { api, Category } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  ShoppingBag,
  User,
  Package,
  Shield,
  FileText,
  ArrowRight
} from "lucide-react";

const Footer = () => {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState("");

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.getCategories({ isActive: true });
        const categoriesData = response.categories || [];
        setCategories(categoriesData.slice(0, 6)); // Show first 6 categories
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);
  
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter subscription logic here
    console.log('Newsletter subscription:', email);
    setEmail("");
  };
  
  const translations = {
    en: {
      brand: "KOSHIRO",
      description: "Authentic Japanese fashion for the modern soul",
      shop: "Shop",
      products: "Products",
      categories: "Categories",
      sale: "Sale",
      compare: "Compare",
      quickLinks: "Quick Links",
      about: "About Us",
      contact: "Contact",
      search: "Search",
      reviews: "Reviews",
      customerService: "Customer Service",
      orderTracking: "Order Tracking",
      shipping: "Shipping Info",
      returns: "Returns",
      sizeGuide: "Size Guide",
      faq: "FAQ",
      account: "Account",
      login: "Login",
      register: "Register",
      profile: "Profile",
      wishlist: "Wishlist",
      legal: "Legal",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      newsletter: "Newsletter",
      newsletterDesc: "Subscribe to our newsletter for latest updates and exclusive offers",
      subscribe: "Subscribe",
      emailPlaceholder: "Your email",
      rights: "All rights reserved.",
      followUs: "Follow Us",
      contactUs: "Contact Us",
      phone: "Phone",
      email: "Email",
      address: "Address"
    },
    vi: {
      brand: "KOSHIRO",
      description: "Thời trang Nhật Bản chính hãng cho tâm hồn hiện đại",
      shop: "Cửa Hàng",
      products: "Sản Phẩm",
      categories: "Danh Mục",
      sale: "Khuyến Mãi",
      compare: "So Sánh",
      quickLinks: "Liên Kết Nhanh",
      about: "Về Chúng Tôi",
      contact: "Liên Hệ",
      search: "Tìm Kiếm",
      reviews: "Đánh Giá",
      customerService: "Dịch Vụ Khách Hàng",
      orderTracking: "Theo Dõi Đơn Hàng",
      shipping: "Thông Tin Giao Hàng",
      returns: "Đổi Trả",
      sizeGuide: "Hướng Dẫn Kích Thước",
      faq: "Câu Hỏi Thường Gặp",
      account: "Tài Khoản",
      login: "Đăng Nhập",
      register: "Đăng Ký",
      profile: "Hồ Sơ",
      wishlist: "Yêu Thích",
      legal: "Pháp Lý",
      privacy: "Chính Sách Bảo Mật",
      terms: "Điều Khoản Dịch Vụ",
      newsletter: "Bản Tin",
      newsletterDesc: "Đăng ký nhận bản tin để cập nhật mới nhất và ưu đãi độc quyền",
      subscribe: "Đăng Ký",
      emailPlaceholder: "Email của bạn",
      rights: "Tất cả quyền được bảo lưu.",
      followUs: "Theo Dõi Chúng Tôi",
      contactUs: "Liên Hệ",
      phone: "Điện Thoại",
      email: "Email",
      address: "Địa Chỉ"
    },
    ja: {
      brand: "KOSHIRO",
      description: "現代の魂のための本格的な日本ファッション",
      shop: "ショップ",
      products: "商品",
      categories: "カテゴリー",
      sale: "セール",
      compare: "比較",
      quickLinks: "クイックリンク",
      about: "私たちについて",
      contact: "お問い合わせ",
      search: "検索",
      reviews: "レビュー",
      customerService: "カスタマーサービス",
      orderTracking: "注文追跡",
      shipping: "配送情報",
      returns: "返品",
      sizeGuide: "サイズガイド",
      faq: "よくある質問",
      account: "アカウント",
      login: "ログイン",
      register: "登録",
      profile: "プロフィール",
      wishlist: "お気に入り",
      legal: "法的",
      privacy: "プライバシーポリシー",
      terms: "利用規約",
      newsletter: "ニュースレター",
      newsletterDesc: "最新の更新情報と限定オファーをニュースレターで購読",
      subscribe: "購読",
      emailPlaceholder: "あなたのメール",
      rights: "全著作権所有。",
      followUs: "フォローする",
      contactUs: "お問い合わせ",
      phone: "電話",
      email: "メール",
      address: "住所"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Helper function to get category name based on language
  const getCategoryName = (category: Category) => {
    switch (language) {
      case 'vi':
        return category.name;
      case 'ja':
        return category.nameJa || category.name;
      default:
        return category.nameEn || category.name;
    }
  };

  return (
    <footer className="bg-gradient-to-br from-background via-background to-muted/20 border-t-2 border-primary/20 mt-20">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="space-y-6 lg:col-span-2">
            <div>
              {/* Logo with Brand Text */}
              <div className="mb-6 flex items-center gap-3">
                <div className="relative">
                  <img
                    src="/koshino_logo_dark.png"
                    alt="Koshino Fashion Logo"
                    className="h-12 w-auto opacity-90 hover:opacity-100 transition-all duration-300 dark:hidden"
                    loading="lazy"
                  />
                  <img
                    src="/koshino_logo.png"
                    alt="Koshino Fashion Logo"
                    className="h-12 w-auto opacity-90 hover:opacity-100 transition-all duration-300 hidden dark:block"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{t.brand}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed font-medium mb-6 max-w-md">
                {t.description}
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <h5 className="font-bold text-lg mb-3">{t.contactUs}</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>+84 123 456 789</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>contact@koshiro.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>123 Fashion Street, Ho Chi Minh City, Vietnam</span>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-6">
                <h5 className="font-bold text-lg mb-3">{t.followUs}</h5>
                <div className="flex gap-3">
                  <Link 
                    to="#" 
                    className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110 border-2 border-primary/20 hover:border-primary/40"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </Link>
                  <Link 
                    to="#" 
                    className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110 border-2 border-primary/20 hover:border-primary/40"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </Link>
                  <Link 
                    to="#" 
                    className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110 border-2 border-primary/20 hover:border-primary/40"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </Link>
                  <Link 
                    to="#" 
                    className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110 border-2 border-primary/20 hover:border-primary/40"
                    aria-label="Youtube"
                  >
                    <Youtube className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              {t.shop}
            </h4>
            <nav className="space-y-3">
              <Link 
                to="/products" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.products}
              </Link>
              <Link 
                to="/categories" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.categories}
              </Link>
              <Link 
                to="/sale" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.sale}
              </Link>
              <Link 
                to="/compare" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.compare}
              </Link>
            </nav>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              {t.quickLinks}
            </h4>
            <nav className="space-y-3">
              <Link 
                to="/about" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.about}
              </Link>
              <Link 
                to="/contact" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.contact}
              </Link>
              <Link 
                to="/search" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.search}
              </Link>
              <Link 
                to="/reviews" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.reviews}
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t.customerService}
            </h4>
            <nav className="space-y-3">
              <Link 
                to="/order-tracking" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.orderTracking}
              </Link>
              <Link 
                to="/shipping-info" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.shipping}
              </Link>
              <Link 
                to="/returns" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.returns}
              </Link>
              <Link 
                to="/size-guide" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.sizeGuide}
              </Link>
              <Link 
                to="/faq" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.faq}
              </Link>
            </nav>
          </div>
        </div>

        {/* Account & Legal Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Account */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {t.account}
            </h4>
            <nav className="space-y-3">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/login" 
                    className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
                  >
                    {t.login}
                  </Link>
                  <Link 
                    to="/register" 
                    className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
                  >
                    {t.register}
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/profile" 
                    className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
                  >
                    {t.profile}
                  </Link>
                  <Link 
                    to="/wishlist" 
                    className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
                  >
                    {t.wishlist}
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {t.categories}
            </h4>
            <nav className="space-y-3">
              {categories.map((category) => (
                <Link 
                  key={category._id}
                  to={`/category/${category.slug}`} 
                  className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
                >
                  {getCategoryName(category)}
                </Link>
              ))}
              <Link 
                to="/categories" 
                className="block text-primary hover:text-primary/80 transition-colors font-bold hover:translate-x-1 duration-300"
              >
                {language === 'vi' ? 'Xem Tất Cả →' : 
                 language === 'ja' ? 'すべて見る →' : 
                 'View All →'}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t.legal}
            </h4>
            <nav className="space-y-3">
              <Link 
                to="/privacy-policy" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.privacy}
              </Link>
              <Link 
                to="/terms-of-service" 
                className="block text-muted-foreground hover:text-primary transition-colors font-medium hover:translate-x-1 duration-300"
              >
                {t.terms}
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {t.newsletter}
            </h4>
            <p className="text-muted-foreground font-medium text-sm mb-4">
              {t.newsletterDesc}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border-2 focus:border-primary transition-all"
              />
              <Button 
                type="submit"
                className="w-full rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {t.subscribe}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-12 border-primary/20" />

        {/* Copyright */}
        <div className="text-center">
          <p className="text-muted-foreground font-medium">
            &copy; 2025 <span className="font-bold text-primary">KOSHIRO</span> Fashion. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;