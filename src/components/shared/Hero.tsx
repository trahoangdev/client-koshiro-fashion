import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const handleExplore = () => {
    // Scroll to Collection section
    const collectionSection = document.querySelector('[data-section="collection"]');
    if (collectionSection) {
      collectionSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to main content
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  const translations = {
    en: {
      title: "Elevate Your Style with KOSHIRO",
      subtitle: "Japanese-inspired fashion for the new generation. Redefine your wardrobe with minimal, bold, and timeless pieces.",
      cta: "Explore Now"
    },
    vi: {
      title: "Nâng Tầm Phong Cách Cùng KOSHIRO",
      subtitle: "Thời trang lấy cảm hứng từ Nhật Bản dành cho thế hệ mới. Tái định nghĩa tủ đồ của bạn với những thiết kế tối giản, cá tính và vượt thời gian.",
      cta: "Khám Phá Ngay"
    },
    ja: {
      title: "KOSHIROでスタイルを格上げ",
      subtitle: "新世代のための日本発インスパイアファッション。ミニマルで大胆、そして時代を超えるデザインであなたのワードローブを再定義。",
      cta: "今すぐ見る"
    }
  };
  const t = translations[language as keyof typeof translations] || translations.en;
  
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Content */}
      <div className="container relative z-10 text-center">
        <div className="max-w-4xl mx-auto px-6">
          {/* Japanese-inspired Typography */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-stone-900 dark:text-stone-100 mb-6">
              <span className="block font-extralight">
                {language === 'vi' ? 'KOSHIRO' : language === 'ja' ? 'コシロ' : 'KOSHIRO'}
              </span>
              <span className="block text-2xl md:text-3xl lg:text-4xl font-light text-stone-600 dark:text-stone-400 mt-4 tracking-widest">
                {language === 'vi' ? 'THỜI TRANG NHẬT BẢN' : 
                 language === 'ja' ? '日本ファッション' : 
                 'JAPANESE FASHION'}
              </span>
            </h1>
          </div>
          
          {/* Minimalist Description */}
          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            {language === 'vi' ? 'Tìm kiếm sự cân bằng hoàn hảo giữa truyền thống và hiện đại' :
             language === 'ja' ? '伝統と現代の完璧なバランスを探す' :
             'Finding the perfect balance between tradition and modernity'}
          </p>
          
          {/* Zen CTA Button */}
          <Button 
            variant="outline" 
            size="lg" 
            className="border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 px-8 py-3 rounded-none font-light tracking-wide transition-all duration-500 hover:scale-105"
            onClick={handleExplore}
          >
            {language === 'vi' ? 'KHÁM PHÁ' : language === 'ja' ? '探す' : 'EXPLORE'}
          </Button>
        </div>
      </div>
      
      {/* Subtle Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-px h-12 bg-stone-300 dark:bg-stone-700"></div>
      </div>
    </section>
  );
};

export default Hero;