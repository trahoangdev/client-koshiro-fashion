import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const { settings } = useSettings();

  const translations = {
    en: {
      title: "404",
      subtitle: "Oops! Page not found",
      description: "The page you're looking for doesn't exist or has been moved.",
      returnHome: "Return to Home",
      errorLog: "404 Error: User attempted to access non-existent route:"
    },
    vi: {
      title: "404",
      subtitle: "Ôi! Không tìm thấy trang",
      description: "Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.",
      returnHome: "Quay Về Trang Chủ",
      errorLog: "Lỗi 404: Người dùng cố gắng truy cập đường dẫn không tồn tại:"
    },
    ja: {
      title: "404",
      subtitle: "おっと！ページが見つかりません",
      description: "お探しのページは存在しないか、移動されました。",
      returnHome: "ホームに戻る",
      errorLog: "404エラー：ユーザーが存在しないルートにアクセスしようとしました："
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    console.error(
      t.errorLog,
      location.pathname
    );
  }, [location.pathname, t.errorLog]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">


      {/* Banner Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings?.banners?.notFound || "/images/banners/banner-21.png"}
          alt="404 Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-16">
        <div className="text-center max-w-2xl mx-auto px-6">
          <Card className="rounded-2xl border-2 shadow-2xl overflow-hidden bg-background/95 backdrop-blur-sm">
            <CardContent className="p-12 md:p-16">
              {/* 404 Number */}
              <div className="mb-8">
                <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent mb-4">
                  {t.title}
                </h1>
              </div>

              {/* Main Content */}
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  {t.subtitle}
                </h2>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {t.description}
                </p>

                {/* Action Button */}
                <div className="pt-4">
                  <Link to="/">
                    <Button
                      size="lg"
                      className="rounded-xl font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Home className="h-5 w-5 mr-2" />
                      {t.returnHome}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  );
};

export default NotFound;
