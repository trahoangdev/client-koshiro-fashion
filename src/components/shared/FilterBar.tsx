import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FilterBarProps {
  selectedCategory: string;
  selectedPriceRange: string;
  selectedColor: string;
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (range: string) => void;
  onColorChange: (color: string) => void;
  onClearFilters: () => void;
}

const FilterBar = ({
  selectedCategory,
  selectedPriceRange,
  selectedColor,
  onCategoryChange,
  onPriceRangeChange,
  onColorChange,
  onClearFilters
}: FilterBarProps) => {
  const { language } = useLanguage();
  const translations = {
    en: {
      allCategories: "All Categories",
      tops: "Tops",
      bottoms: "Bottoms",
      accessories: "Accessories",
      kimono: "Kimono",
      yukata: "Yukata",
      hakama: "Hakama",
      priceRange: "Price Range",
      allPrices: "All Prices",
      under50: "Under $50",
      range50to100: "$50 - $100",
      over100: "Over $100",
      color: "Color",
      allColors: "All Colors",
      clearFilters: "Clear Filters",
      black: "Black",
      white: "White", 
      beige: "Beige",
      brown: "Brown",
      navy: "Navy",
      natural: "Natural",
      olive: "Olive",
      khaki: "Khaki",
      grey: "Grey",
      pink: "Pink",
      purple: "Purple",
      green: "Green",
      blue: "Blue",
      burgundy: "Burgundy",
      gold: "Gold",
      red: "Red",
      emerald: "Emerald",
      coral: "Coral",
      turquoise: "Turquoise",
      yellow: "Yellow"
    },
    vi: {
      allCategories: "Tất Cả Danh Mục",
      tops: "Áo",
      bottoms: "Quần",
      accessories: "Phụ Kiện",
      kimono: "Kimono",
      yukata: "Yukata",
      hakama: "Hakama",
      priceRange: "Khoảng Giá",
      allPrices: "Tất Cả Giá",
      under50: "Dưới $50",
      range50to100: "$50 - $100",
      over100: "Trên $100",
      color: "Màu Sắc",
      allColors: "Tất Cả Màu",
      clearFilters: "Xóa Bộ Lọc",
      black: "Đen",
      white: "Trắng",
      beige: "Be",
      brown: "Nâu",
      navy: "Xanh đậm",
      natural: "Tự nhiên",
      olive: "Xanh ô liu",
      khaki: "Ka ki",
      grey: "Xám",
      pink: "Hồng",
      purple: "Tím",
      green: "Xanh lá",
      blue: "Xanh dương",
      burgundy: "Đỏ rượu",
      gold: "Vàng",
      red: "Đỏ",
      emerald: "Ngọc lục bảo",
      coral: "Cam san hô",
      turquoise: "Xanh ngọc",
      yellow: "Vàng"
    },
    ja: {
      allCategories: "すべてのカテゴリ",
      tops: "トップス",
      bottoms: "ボトムス",
      accessories: "アクセサリー",
      kimono: "着物",
      yukata: "浴衣",
      hakama: "袴",
      priceRange: "価格帯",
      allPrices: "すべての価格",
      under50: "$50未満",
      range50to100: "$50 - $100",
      over100: "$100以上",
      color: "色",
      allColors: "すべての色",
      clearFilters: "フィルターをクリア",
      black: "ブラック",
      white: "ホワイト",
      beige: "ベージュ",
      brown: "ブラウン",
      navy: "ネイビー",
      natural: "ナチュラル",
      olive: "オリーブ",
      khaki: "カーキ",
      grey: "グレー",
      pink: "ピンク",
      purple: "パープル",
      green: "グリーン",
      blue: "ブルー",
      burgundy: "バーガンディー",
      gold: "ゴールド",
      red: "レッド",
      emerald: "エメラルド",
      coral: "コーラル",
      turquoise: "ターコイズ",
      yellow: "イエロー"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const hasActiveFilters = selectedCategory !== 'all' || selectedPriceRange !== 'all' || selectedColor !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-4 p-6 bg-gradient-to-br from-white via-white to-stone-50/50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900/50 border border-stone-200/60 dark:border-stone-700/60 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Category Filter */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-2 block text-foreground">
          {language === 'vi' ? 'Danh mục' : language === 'ja' ? 'カテゴリー' : 'Category'}
        </label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full bg-white dark:bg-stone-800 border-stone-200/60 dark:border-stone-700/60 hover:border-primary/50 transition-all duration-300 hover:shadow-md rounded-xl h-11">
            <SelectValue placeholder={t.allCategories} />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-stone-800 border-stone-200/60 dark:border-stone-700/60 rounded-xl shadow-xl backdrop-blur-sm">
            <SelectItem value="all" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg">
              {t.allCategories}
            </SelectItem>
            <SelectItem value="tops" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg">
              {t.tops}
            </SelectItem>
            <SelectItem value="bottoms" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg">
              {t.bottoms}
            </SelectItem>
            <SelectItem value="accessories" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg">
              {t.accessories}
            </SelectItem>
            <SelectItem value="kimono" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg">
              {t.kimono}
            </SelectItem>
            <SelectItem value="yukata" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg">
              {t.yukata}
            </SelectItem>
            <SelectItem value="hakama" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg">
              {t.hakama}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range Filter */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-2 block text-foreground">
          {language === 'vi' ? 'Khoảng giá' : language === 'ja' ? '価格帯' : 'Price Range'}
        </label>
        <Select value={selectedPriceRange} onValueChange={onPriceRangeChange}>
          <SelectTrigger className="w-full bg-white dark:bg-stone-800 border-stone-200/60 dark:border-stone-700/60 hover:border-primary/50 transition-all duration-300 hover:shadow-md rounded-xl h-11">
            <SelectValue placeholder={t.priceRange} />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-stone-800 border-stone-200/60 dark:border-stone-700/60 rounded-xl shadow-xl backdrop-blur-sm">
            <SelectItem value="all" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg">
              {t.allPrices}
            </SelectItem>
            <SelectItem value="under50" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg">
              {t.under50}
            </SelectItem>
            <SelectItem value="50-100" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg">
              {t.range50to100}
            </SelectItem>
            <SelectItem value="over100" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg">
              {t.over100}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Color Filter */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-2 block text-foreground">
          {language === 'vi' ? 'Màu sắc' : language === 'ja' ? '色' : 'Color'}
        </label>
        <Select value={selectedColor} onValueChange={onColorChange}>
          <SelectTrigger className="w-full bg-white dark:bg-stone-800 border-stone-200/60 dark:border-stone-700/60 hover:border-primary/50 transition-all duration-300 hover:shadow-md rounded-xl h-11">
            <SelectValue placeholder={t.color} />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto bg-white dark:bg-stone-800 border-stone-200/60 dark:border-stone-700/60 rounded-xl shadow-xl backdrop-blur-sm">
            <SelectItem value="all" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg">
              {t.allColors}
            </SelectItem>
            <SelectItem value="black" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.black}
            </SelectItem>
            <SelectItem value="white" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.white}
            </SelectItem>
            <SelectItem value="beige" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.beige}
            </SelectItem>
            <SelectItem value="brown" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.brown}
            </SelectItem>
            <SelectItem value="navy" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.navy}
            </SelectItem>
            <SelectItem value="natural" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.natural}
            </SelectItem>
            <SelectItem value="olive" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.olive}
            </SelectItem>
            <SelectItem value="khaki" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.khaki}
            </SelectItem>
            <SelectItem value="grey" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.grey}
            </SelectItem>
            <SelectItem value="pink" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.pink}
            </SelectItem>
            <SelectItem value="purple" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.purple}
            </SelectItem>
            <SelectItem value="green" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.green}
            </SelectItem>
            <SelectItem value="blue" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.blue}
            </SelectItem>
            <SelectItem value="burgundy" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.burgundy}
            </SelectItem>
            <SelectItem value="gold" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.gold}
            </SelectItem>
            <SelectItem value="red" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.red}
            </SelectItem>
            <SelectItem value="emerald" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.emerald}
            </SelectItem>
            <SelectItem value="coral" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.coral}
            </SelectItem>
            <SelectItem value="turquoise" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.turquoise}
            </SelectItem>
            <SelectItem value="yellow" className="hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary focus:bg-primary/10 dark:focus:bg-primary/20 rounded-lg truncate">
              {t.yellow}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          onClick={onClearFilters} 
          className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 rounded-xl h-11 px-4"
        >
          <X className="h-4 w-4" />
          {t.clearFilters}
        </Button>
      )}

      {/* Active Filters Display */}
      <div className="flex gap-2 ml-auto">
        {selectedCategory !== 'all' && (
          <Badge variant="secondary" className="gap-1">
            {t[selectedCategory as keyof typeof t]}
            <X className="h-3 w-3 cursor-pointer" onClick={() => onCategoryChange('all')} />
          </Badge>
        )}
        {selectedPriceRange !== 'all' && (
          <Badge variant="secondary" className="gap-1">
            {selectedPriceRange === 'under50' ? t.under50 : 
             selectedPriceRange === '50-100' ? t.range50to100 : t.over100}
            <X className="h-3 w-3 cursor-pointer" onClick={() => onPriceRangeChange('all')} />
          </Badge>
        )}
        {selectedColor !== 'all' && (
          <Badge variant="secondary" className="gap-1">
            {selectedColor}
            <X className="h-3 w-3 cursor-pointer" onClick={() => onColorChange('all')} />
          </Badge>
        )}
      </div>
    </div>
  );
};

export default FilterBar;