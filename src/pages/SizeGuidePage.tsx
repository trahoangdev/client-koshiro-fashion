import { useState, useEffect } from "react";
import { Ruler, Download, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { api, Category } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SizeDataItem {
  size: string;
  height?: string;
  waist: string;
  length: string;
  chest?: string;
  sleeve?: string;
  hips?: string;
  inseam?: string;
}

// Size guide data mapping for different categories
const getSizeDataForCategory = (categoryName: string): SizeDataItem[] => {
  const categoryLower = categoryName.toLowerCase();

  if (categoryLower.includes('shirt') || categoryLower.includes('top') || categoryLower.includes('áo')) {
    return [
      { size: "S", chest: "86-91", waist: "71-76", length: "65-70", sleeve: "58-63" },
      { size: "M", chest: "91-96", waist: "76-81", length: "70-75", sleeve: "63-68" },
      { size: "L", chest: "96-101", waist: "81-86", length: "75-80", sleeve: "68-73" },
      { size: "XL", chest: "101-106", waist: "86-91", length: "80-85", sleeve: "73-78" }
    ];
  }

  if (categoryLower.includes('pant') || categoryLower.includes('quần') || categoryLower.includes('bottom')) {
    return [
      { size: "S", waist: "71-76", hips: "91-96", inseam: "75-80", length: "95-100" },
      { size: "M", waist: "76-81", hips: "96-101", inseam: "80-85", length: "100-105" },
      { size: "L", waist: "81-86", hips: "101-106", inseam: "85-90", length: "105-110" },
      { size: "XL", waist: "86-91", hips: "106-111", inseam: "90-95", length: "110-115" }
    ];
  }

  if (categoryLower.includes('hakama') || categoryLower.includes('袴')) {
    return [
      { size: "S", height: "160-170", waist: "71-81", length: "95-105" },
      { size: "M", height: "170-180", waist: "81-91", length: "105-115" },
      { size: "L", height: "175-185", waist: "86-96", length: "110-120" },
      { size: "XL", height: "180-190", waist: "91-101", length: "110-115" }
    ];
  }

  if (categoryLower.includes('accessory') || categoryLower.includes('phụ kiện') || categoryLower.includes('アクセサリー')) {
    return [
      { size: "S", waist: "71-76", length: "95-100" },
      { size: "M", waist: "76-81", length: "100-105" },
      { size: "L", waist: "81-86", length: "105-110" },
      { size: "XL", waist: "86-91", length: "110-115" }
    ];
  }

  // Default size guide for unknown categories
  return [
    { size: "S", chest: "86-91", waist: "71-76", length: "65-70" },
    { size: "M", chest: "91-96", waist: "76-81", length: "70-75" },
    { size: "L", chest: "96-101", waist: "81-86", length: "75-80" },
    { size: "XL", chest: "101-106", waist: "86-91", length: "80-85" }
  ];
};

// Get category type for rendering appropriate columns
const getCategoryType = (categoryName: string): string => {
  const categoryLower = categoryName.toLowerCase();

  if (categoryLower.includes('hakama') || categoryLower.includes('袴')) {
    return "hakama";
  }

  if (categoryLower.includes('shirt') || categoryLower.includes('top') || categoryLower.includes('áo')) {
    return "tops";
  }

  if (categoryLower.includes('pant') || categoryLower.includes('quần') || categoryLower.includes('bottom')) {
    return "bottoms";
  }

  if (categoryLower.includes('accessory') || categoryLower.includes('phụ kiện') || categoryLower.includes('アクセサリー')) {
    return "accessories";
  }

  return "default";
};

export default function SizeGuidePage() {
  const { language } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");

  const translations = {
    en: {
      title: "Size Guide",
      subtitle: "Find your perfect fit with our comprehensive size guide",
      howToMeasure: "How to Measure",
      chest: "Chest",
      waist: "Waist",
      hips: "Hips",
      length: "Length",
      sleeve: "Sleeve",
      inseam: "Inseam",
      height: "Height",
      download: "Download Size Chart",
      tips: "Sizing Tips",
      tip1: "Measure yourself while wearing light clothing",
      tip2: "Keep the measuring tape snug but not tight",
      tip3: "For the best fit, measure your body, not your clothes",
      tip4: "If you're between sizes, we recommend sizing up",
      tip5: "Hakama sizing is based on your height and waist measurement",
      size: "Size",
      measurements: "Measurements",
      cm: "cm",
      inches: "inches",
      loading: "Loading categories...",
      error: "Failed to load categories",
      oneSize: "One Size",
      accessoriesNote: "Accessories are typically one-size-fits-all or come in standard sizes."
    },
    vi: {
      title: "Hướng Dẫn Kích Thước",
      subtitle: "Tìm kích thước hoàn hảo với hướng dẫn chi tiết của chúng tôi",
      howToMeasure: "Cách Đo",
      chest: "Ngực",
      waist: "Eo",
      hips: "Hông",
      length: "Chiều Dài",
      sleeve: "Tay Áo",
      inseam: "Đường May Trong",
      height: "Chiều Cao",
      download: "Tải Bảng Kích Thước",
      tips: "Mẹo Chọn Kích Thước",
      tip1: "Đo khi mặc quần áo mỏng",
      tip2: "Giữ thước đo vừa khít nhưng không quá chặt",
      tip3: "Để có kích thước tốt nhất, đo cơ thể, không đo quần áo",
      tip4: "Nếu bạn ở giữa hai kích thước, chúng tôi khuyên nên chọn size lớn hơn",
      tip5: "Kích thước Hakama dựa trên chiều cao và số đo eo",
      size: "Kích Thước",
      measurements: "Số Đo",
      cm: "cm",
      inches: "inch",
      loading: "Đang tải danh mục...",
      error: "Không thể tải danh mục",
      oneSize: "Một Kích Thước",
      accessoriesNote: "Phụ kiện thường có một kích thước hoặc có kích thước tiêu chuẩn."
    },
    ja: {
      title: "サイズガイド",
      subtitle: "包括的なサイズガイドで完璧なフィットを見つけましょう",
      howToMeasure: "測定方法",
      chest: "胸囲",
      waist: "ウエスト",
      hips: "ヒップ",
      length: "長さ",
      sleeve: "袖丈",
      inseam: "股下",
      height: "身長",
      download: "サイズチャートをダウンロード",
      tips: "サイズ選びのコツ",
      tip1: "薄手の服を着て測定してください",
      tip2: "メジャーはきつすぎず、ゆるすぎずに保ってください",
      tip3: "最適なフィットのため、服ではなく体を測定してください",
      tip4: "サイズの間にある場合は、大きいサイズをお勧めします",
      tip5: "袴のサイズは身長とウエスト測定に基づいています",
      size: "サイズ",
      measurements: "測定値",
      cm: "cm",
      inches: "インチ",
      loading: "カテゴリを読み込み中...",
      error: "カテゴリの読み込みに失敗しました",
      oneSize: "ワンサイズ",
      accessoriesNote: "アクセサリーは通常ワンサイズまたは標準サイズです。"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await api.getCategories({ isActive: true });
        const activeCategories = response.categories.filter(cat => cat.isActive);
        setCategories(activeCategories);

        // Set first category as active tab
        if (activeCategories.length > 0) {
          setActiveTab(activeCategories[0]._id);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        toast({
          title: t.error,
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [toast, t.error]);

  // Get category name based on language
  const getCategoryName = (category: Category) => {
    switch (language) {
      case 'vi':
        return category.nameEn || category.name;
      case 'ja':
        return category.nameJa || category.name;
      default:
        return category.nameEn || category.name;
    }
  };

  const renderSizeTable = (data: SizeDataItem[], type: string) => (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 bg-primary/10">
            <th className="p-4 text-left font-bold">{t.size}</th>
            {type === "hakama" ? (
              <>
                <th className="p-4 text-left font-bold">{t.height} (cm)</th>
                <th className="p-4 text-left font-bold">{t.waist} (cm)</th>
                <th className="p-4 text-left font-bold">{t.length} (cm)</th>
              </>
            ) : type === "tops" ? (
              <>
                <th className="p-4 text-left font-bold">{t.chest} (cm)</th>
                <th className="p-4 text-left font-bold">{t.waist} (cm)</th>
                <th className="p-4 text-left font-bold">{t.length} (cm)</th>
                <th className="p-4 text-left font-bold">{t.sleeve} (cm)</th>
              </>
            ) : type === "bottoms" ? (
              <>
                <th className="p-4 text-left font-bold">{t.waist} (cm)</th>
                <th className="p-4 text-left font-bold">{t.hips} (cm)</th>
                <th className="p-4 text-left font-bold">{t.inseam} (cm)</th>
                <th className="p-4 text-left font-bold">{t.length} (cm)</th>
              </>
            ) : (
              <>
                <th className="p-4 text-left font-bold">{t.chest} (cm)</th>
                <th className="p-4 text-left font-bold">{t.waist} (cm)</th>
                <th className="p-4 text-left font-bold">{t.length} (cm)</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b hover:bg-muted/30 transition-all">
              <td className="p-4 font-bold">{item.size}</td>
              {type === "hakama" ? (
                <>
                  <td className="p-4 font-medium">{item.height}</td>
                  <td className="p-4 font-medium">{item.waist}</td>
                  <td className="p-4 font-medium">{item.length}</td>
                </>
              ) : type === "tops" ? (
                <>
                  <td className="p-4 font-medium">{item.chest}</td>
                  <td className="p-4 font-medium">{item.waist}</td>
                  <td className="p-4 font-medium">{item.length}</td>
                  <td className="p-4 font-medium">{item.sleeve}</td>
                </>
              ) : type === "bottoms" ? (
                <>
                  <td className="p-4 font-medium">{item.waist}</td>
                  <td className="p-4 font-medium">{item.hips}</td>
                  <td className="p-4 font-medium">{item.inseam}</td>
                  <td className="p-4 font-medium">{item.length}</td>
                </>
              ) : (
                <>
                  <td className="p-4 font-medium">{item.chest}</td>
                  <td className="p-4 font-medium">{item.waist}</td>
                  <td className="p-4 font-medium">{item.length}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">

        <main className="py-8">
          <div className="container mx-auto px-4">
            <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium text-muted-foreground">{t.loading}</p>
              </CardContent>
            </Card>
          </div>
        </main>

      </div>
    );
  }

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
                  src={settings?.banners?.sizeGuide || "/images/banners/banner-11.png"}
                  alt="Size Guide Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-12 md:p-16 text-white">

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed font-light">
                  {t.subtitle}
                </p>
              </div>
            </div>
          </section>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Ruler className="h-5 w-5 mr-2 text-primary" />
                    {t.measurements}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categories.length > 0 ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-4 rounded-lg bg-muted/30 p-1 mb-6">
                        {categories.slice(0, 4).map((category) => (
                          <TabsTrigger
                            key={category._id}
                            value={category._id}
                            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-medium"
                          >
                            {getCategoryName(category)}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {categories.slice(0, 4).map((category) => {
                        const categoryName = getCategoryName(category);
                        const categoryType = getCategoryType(categoryName);
                        const sizeData = getSizeDataForCategory(categoryName);

                        return (
                          <TabsContent key={category._id} value={category._id} className="mt-6">
                            {categoryType === "accessories" ? (
                              <Card className="rounded-lg border-2 bg-muted/30">
                                <CardContent className="p-12 text-center">
                                  <p className="text-muted-foreground mb-4 font-medium text-lg">
                                    {t.accessoriesNote}
                                  </p>
                                  <Badge variant="secondary" className="text-lg px-4 py-2 font-semibold">
                                    {t.oneSize}
                                  </Badge>
                                </CardContent>
                              </Card>
                            ) : (
                              <Card className="rounded-lg border-2 overflow-hidden">
                                <CardContent className="p-0">
                                  {renderSizeTable(sizeData, categoryType)}
                                </CardContent>
                              </Card>
                            )}
                          </TabsContent>
                        );
                      })}
                    </Tabs>
                  ) : (
                    <Card className="rounded-lg border-2 bg-muted/30">
                      <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground font-medium">No categories available.</p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* How to Measure */}
              <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Ruler className="h-5 w-5 mr-2 text-primary" />
                    {t.howToMeasure}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-bold mb-2">{t.chest}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Measure around the fullest part of your chest, keeping the tape horizontal.
                    </p>
                  </div>
                  <Separator />
                  <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-bold mb-2">{t.waist}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Measure around your natural waistline, keeping the tape comfortably loose.
                    </p>
                  </div>
                  <Separator />
                  <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-bold mb-2">{t.hips}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Measure around the fullest part of your hips, keeping the tape horizontal.
                    </p>
                  </div>
                  <Separator />
                  <div className="p-3 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-bold mb-2">{t.length}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      For tops: from shoulder to desired length. For bottoms: from waist to desired length.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Sizing Tips */}
              <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Info className="h-5 w-5 mr-2 text-primary" />
                    {t.tips}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm font-medium leading-relaxed">{t.tip1}</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm font-medium leading-relaxed">{t.tip2}</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm font-medium leading-relaxed">{t.tip3}</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm font-medium leading-relaxed">{t.tip4}</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm font-medium leading-relaxed">{t.tip5}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Download */}
              <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <Button className="w-full rounded-xl font-semibold border-2 shadow-lg hover:shadow-xl transition-all" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    {t.download}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
} 