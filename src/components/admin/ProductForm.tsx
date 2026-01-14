import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Package,
  DollarSign,
  Palette,
  Ruler,
  Star,
  Eye,
  Tag,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Category, api, Color } from "@/lib/api";
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@/styles/markdown-editor.css';
import CloudinaryImageUpload from '@/components/shared/CloudinaryImageUpload';

interface CloudinaryImage {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  responsiveUrls: {
    thumbnail: string;
    medium: string;
    large: string;
    original: string;
  };
}

interface ProductFormData {
  name: string;
  nameEn: string;
  nameJa: string;
  description: string;
  descriptionEn: string;
  descriptionJa: string;
  price: number;
  originalPrice: number;
  categoryId: string;
  images: string[]; // Legacy field for backward compatibility
  cloudinaryImages: CloudinaryImage[]; // New Cloudinary images
  sizes: string[];
  colors: Array<string | { name: string; value: string }>;
  stock: number;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  onSale: boolean;
  isNew: boolean;
  isLimitedEdition: boolean;
  isBestSeller: boolean;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  sku: string;
  barcode: string;
  materials: string[];
  careInstructions: string;
  careInstructionsEn: string;
  careInstructionsJa: string;
  origin: string;
  originEn: string;
  originJa: string;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  onFormChange?: (data: ProductFormData) => void;
}

const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const defaultColors = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#008000' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Purple', value: '#800080' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Pink', value: '#FFC0CB' },
  { name: 'Brown', value: '#A52A2A' }
];

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
  mode,
  onFormChange
}: ProductFormProps) {
  const { toast } = useToast();
  const { language } = useLanguage();

  // State for colors from API
  const [apiColors, setApiColors] = useState<Color[]>([]);
  const [colorsLoading, setColorsLoading] = useState(true);
  const [isCreatingColor, setIsCreatingColor] = useState(false);

  // Fetch colors from API
  useEffect(() => {
    const loadColors = async () => {
      try {
        setColorsLoading(true);
        const response = await api.getColors({
          activeOnly: true,
          language: language as 'vi' | 'en' | 'ja'
        });
        setApiColors(response.colors || []);
      } catch (error) {
        console.error('Error loading colors:', error);
        // Fallback to default colors if API fails
        setApiColors([]);
      } finally {
        setColorsLoading(false);
      }
    };

    loadColors();
  }, [language]);

  // Function to get hex value from color name
  const getColorHex = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      // Vietnamese colors
      'Đen': '#000000',
      'Trắng': '#FFFFFF',
      'Đỏ': '#FF0000',
      'Xanh dương': '#0000FF',
      'Xanh lá': '#008000',
      'Vàng': '#FFFF00',
      'Hồng': '#FFC0CB',
      'Tím': '#800080',
      'Cam': '#FFA500',
      'Nâu': '#A52A2A',
      'Xám': '#808080',
      'Bạc': '#C0C0C0',
      'Vàng kim': '#FFD700',
      'Xanh ngọc': '#40E0D0',

      // English colors
      'Black': '#000000',
      'White': '#FFFFFF',
      'Red': '#FF0000',
      'Blue': '#0000FF',
      'Green': '#008000',
      'Yellow': '#FFFF00',
      'Pink': '#FFC0CB',
      'Purple': '#800080',
      'Orange': '#FFA500',
      'Brown': '#A52A2A',
      'Gray': '#808080',
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Turquoise': '#40E0D0',

      // Japanese colors
      '黒': '#000000',
      '白': '#FFFFFF',
      '赤': '#FF0000',
      '青': '#0000FF',
      '緑': '#008000',
      '黄': '#FFFF00',
      'ピンク': '#FFC0CB',
      '紫': '#800080',
      'オレンジ': '#FFA500',
      '茶色': '#A52A2A',
      'グレー': '#808080',
      'シルバー': '#C0C0C0',
      'ゴールド': '#FFD700',
      'ターコイズ': '#40E0D0'
    };

    return colorMap[colorName] || '#6b7280';
  };

  // Helper function to convert string colors to color objects
  const convertColorsToObjects = useCallback((colors: string[]): Array<string | { name: string; value: string }> => {
    return colors.map(color => {
      // Check if it's already an object
      if (typeof color === 'object') {
        return color;
      }

      // Find matching default color
      const defaultColor = defaultColors.find(dc => dc.name === color);
      if (defaultColor) {
        return defaultColor;
      }

      // For custom colors, try to get hex value from color name
      const hexValue = getColorHex(color);
      return { name: color, value: hexValue };
    });
  }, []);

  const [formData, setFormData] = useState<ProductFormData>(() => {
    const baseData = {
      name: '',
      nameEn: '',
      nameJa: '',
      description: '',
      descriptionEn: '',
      descriptionJa: '',
      price: 0,
      originalPrice: 0,
      categoryId: '',
      images: [], // Legacy field
      cloudinaryImages: [], // New Cloudinary images
      sizes: [],
      colors: [],
      stock: 0,
      tags: [],
      isActive: true,
      isFeatured: false,
      onSale: false,
      isNew: mode === 'create', // New products are automatically new
      isLimitedEdition: false,
      isBestSeller: false,
      slug: '',
      metaTitle: '',
      metaDescription: '',
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0
      },
      sku: '',
      barcode: '',
      materials: [],
      careInstructions: '',
      careInstructionsEn: '',
      careInstructionsJa: '',
      origin: '',
      originEn: '',
      originJa: ''
    };

    if (initialData) {
      return {
        ...baseData,
        ...initialData,
        // Convert colors from string[] to objects if needed
        colors: initialData.colors ? convertColorsToObjects(initialData.colors as string[]) : []
      };
    }

    return baseData;
  });

  const [newTag, setNewTag] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('#000000');
  const [newColorName, setNewColorName] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

  // Auto-detect badge statuses from tags
  const detectBadgeFromTags = (tags: string[]) => {
    const isLimitedEdition = tags.some(tag =>
      /limited|giới hạn|限定|limited edition|phiên bản giới hạn|限定版/i.test(tag)
    );
    const isBestSeller = tags.some(tag =>
      /bestseller|bán chạy|ベストセラー|best seller|top seller|bán nhiều|人気/i.test(tag)
    );

    return { isLimitedEdition, isBestSeller };
  };

  // Helper function to validate form data
  const validateFormData = (data: ProductFormData): string[] => {
    const errors: string[] = [];

    if (!data.name.trim()) {
      errors.push(language === 'vi' ? 'Tên sản phẩm là bắt buộc' :
        language === 'ja' ? '商品名は必須です' :
          'Product name is required');
    }

    if (!data.categoryId) {
      errors.push(language === 'vi' ? 'Danh mục là bắt buộc' :
        language === 'ja' ? 'カテゴリは必須です' :
          'Category is required');
    }

    if (data.price <= 0) {
      errors.push(language === 'vi' ? 'Giá phải lớn hơn 0' :
        language === 'ja' ? '価格は0より大きくなければなりません' :
          'Price must be greater than 0');
    }

    if (data.stock < 0) {
      errors.push(language === 'vi' ? 'Số lượng tồn kho không được âm' :
        language === 'ja' ? '在庫数量は負の値にできません' :
          'Stock quantity cannot be negative');
    }

    if (data.weight < 0) {
      errors.push(language === 'vi' ? 'Trọng lượng không được âm' :
        language === 'ja' ? '重量は負の値にできません' :
          'Weight cannot be negative');
    }

    if (data.dimensions.length < 0 || data.dimensions.width < 0 || data.dimensions.height < 0) {
      errors.push(language === 'vi' ? 'Kích thước không được âm' :
        language === 'ja' ? 'サイズは負の値にできません' :
          'Dimensions cannot be negative');
    }

    return errors;
  };

  // Memoize normalized selected colors to prevent unnecessary re-computations and render loops
  const normalizedSelectedColors = useMemo(() => {
    return formData.colors.map((color) => {
      let colorObj: { name: string; value: string };

      if (typeof color === 'object') {
        // Already in object format
        colorObj = color;
      } else {
        // Try to find color in API colors first (case-insensitive)
        const normalizedName = color.toLowerCase();
        const apiColor = apiColors.find(c =>
          c.name.toLowerCase() === normalizedName ||
          c.nameEn?.toLowerCase() === normalizedName ||
          c.nameJa?.toLowerCase() === normalizedName
        );

        if (apiColor) {
          // Use API color for accurate hex value
          colorObj = { name: apiColor.name, value: apiColor.hexValue };
        } else {
          // Fallback to local color map (for colors not yet in API)
          colorObj = { name: color, value: getColorHex(color) };
        }
      }

      return colorObj;
    });
  }, [formData.colors, apiColors]);

  // Update formData when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        colors: initialData.colors ? convertColorsToObjects(initialData.colors as string[]) : prev.colors
      }));
    }
  }, [initialData, convertColorsToObjects]);

  // Debounce onFormChange to prevent excessive updates and render loops
  const formChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!onFormChange) return;

    // Clear previous timeout
    if (formChangeTimeoutRef.current) {
      clearTimeout(formChangeTimeoutRef.current);
    }

    // Set new timeout
    formChangeTimeoutRef.current = setTimeout(() => {
      onFormChange(formData);
    }, 150); // Debounce 150ms to prevent render loops

    // Cleanup
    return () => {
      if (formChangeTimeoutRef.current) {
        clearTimeout(formChangeTimeoutRef.current);
      }
    };
  }, [formData, onFormChange]);

  const translations = {
    en: {
      title: mode === 'create' ? 'Create New Product' : 'Edit Product',
      name: 'Product Name',
      nameEn: 'Name (English)',
      nameJa: 'Name (Japanese)',
      description: 'Description',
      descriptionEn: 'Description (English)',
      descriptionJa: 'Description (Japanese)',
      price: 'Price',
      originalPrice: 'Original Price',
      category: 'Category',
      images: 'Product Images',
      sizes: 'Available Sizes',
      colors: 'Available Colors',
      stock: 'Stock Quantity',
      tags: 'Tags',
      isActive: 'Active',
      isFeatured: 'Featured',
      onSale: 'On Sale',
      isNew: 'New Product',
      isLimitedEdition: 'Limited Edition',
      isBestSeller: 'Best Seller',
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Description',
      weight: 'Weight (kg)',
      dimensions: 'Dimensions (cm)',
      length: 'Length',
      width: 'Width',
      height: 'Height',
      sku: 'SKU',
      barcode: 'Barcode',
      materials: 'Materials',
      careInstructions: 'Care Instructions',
      careInstructionsEn: 'Care Instructions (English)',
      careInstructionsJa: 'Care Instructions (Japanese)',
      origin: 'Country of Origin',
      originEn: 'Origin (English)',
      originJa: 'Origin (Japanese)',
      technicalSpecs: 'Technical Specifications',
      addTag: 'Add Tag',
      addSize: 'Add Size',
      addColor: 'Add Color',
      colorName: 'Color Name',
      colorValue: 'Color Value',
      uploadImage: 'Upload Image',
      dragDrop: 'Drag and drop images here, or click to select',
      basicInfo: 'Basic Information',
      pricing: 'Pricing',
      inventory: 'Inventory',
      media: 'Media',
      seo: 'SEO',
      slug: 'URL Slug',
      shipping: 'Shipping',
      save: 'Save Product',
      cancel: 'Cancel',
      loading: 'Saving...',
      error: 'Error',
      success: 'Product saved successfully'
    },
    vi: {
      title: mode === 'create' ? 'Tạo Sản Phẩm Mới' : 'Chỉnh Sửa Sản Phẩm',
      name: 'Tên Sản Phẩm',
      nameEn: 'Tên (Tiếng Anh)',
      nameJa: 'Tên (Tiếng Nhật)',
      description: 'Mô Tả',
      descriptionEn: 'Mô Tả (Tiếng Anh)',
      descriptionJa: 'Mô Tả (Tiếng Nhật)',
      price: 'Giá',
      originalPrice: 'Giá Gốc',
      category: 'Danh Mục',
      images: 'Hình Ảnh Sản Phẩm',
      sizes: 'Kích Thước Có Sẵn',
      colors: 'Màu Sắc Có Sẵn',
      stock: 'Số Lượng Tồn Kho',
      tags: 'Thẻ',
      isActive: 'Hoạt Động',
      isFeatured: 'Nổi Bật',
      onSale: 'Đang Giảm Giá',
      isNew: 'Sản Phẩm Mới',
      isLimitedEdition: 'Phiên Bản Giới Hạn',
      isBestSeller: 'Bán Chạy',
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Description',
      weight: 'Trọng Lượng (kg)',
      dimensions: 'Kích Thước (cm)',
      length: 'Chiều Dài',
      width: 'Chiều Rộng',
      height: 'Chiều Cao',
      sku: 'SKU',
      barcode: 'Mã Vạch',
      materials: 'Chất Liệu',
      careInstructions: 'Hướng Dẫn Bảo Quản',
      careInstructionsEn: 'Hướng Dẫn Bảo Quản (Tiếng Anh)',
      careInstructionsJa: 'Hướng Dẫn Bảo Quản (Tiếng Nhật)',
      origin: 'Xuất Xứ',
      originEn: 'Xuất Xứ (Tiếng Anh)',
      originJa: 'Xuất Xứ (Tiếng Nhật)',
      technicalSpecs: 'Thông Số Kỹ Thuật',
      addTag: 'Thêm Thẻ',
      addSize: 'Thêm Kích Thước',
      addColor: 'Thêm Màu',
      colorName: 'Tên Màu',
      colorValue: 'Giá Trị Màu',
      uploadImage: 'Tải Lên Hình Ảnh',
      dragDrop: 'Kéo và thả hình ảnh vào đây, hoặc click để chọn',
      basicInfo: 'Thông Tin Cơ Bản',
      pricing: 'Định Giá',
      inventory: 'Tồn Kho',
      media: 'Phương Tiện',
      seo: 'SEO',
      slug: 'Đường dẫn URL',
      shipping: 'Vận Chuyển',
      save: 'Lưu Sản Phẩm',
      cancel: 'Hủy',
      loading: 'Đang lưu...',
      error: 'Lỗi',
      success: 'Sản phẩm đã được lưu thành công'
    },
    ja: {
      title: mode === 'create' ? '新しい商品を作成' : '商品を編集',
      name: '商品名',
      nameEn: '名前（英語）',
      nameJa: '名前（日本語）',
      description: '説明',
      descriptionEn: '説明（英語）',
      descriptionJa: '説明（日本語）',
      price: '価格',
      originalPrice: '原価',
      category: 'カテゴリ',
      images: '商品画像',
      sizes: '利用可能なサイズ',
      colors: '利用可能な色',
      stock: '在庫数量',
      tags: 'タグ',
      isActive: 'アクティブ',
      isFeatured: 'おすすめ',
      onSale: 'セール中',
      isNew: '新商品',
      isLimitedEdition: '限定版',
      isBestSeller: 'ベストセラー',
      metaTitle: 'メタタイトル',
      metaDescription: 'メタ説明',
      weight: '重量（kg）',
      dimensions: 'サイズ（cm）',
      length: '長さ',
      width: '幅',
      height: '高さ',
      sku: 'SKU',
      barcode: 'バーコード',
      materials: '素材',
      careInstructions: 'お手入れ方法',
      careInstructionsEn: 'お手入れ方法（英語）',
      careInstructionsJa: 'お手入れ方法（日本語）',
      origin: '原産国',
      originEn: '原産国（英語）',
      originJa: '原産国（日本語）',
      technicalSpecs: '技術仕様',
      addTag: 'タグを追加',
      addSize: 'サイズを追加',
      addColor: '色を追加',
      colorName: '色名',
      colorValue: '色の値',
      uploadImage: '画像をアップロード',
      dragDrop: 'ここに画像をドラッグ＆ドロップ、またはクリックして選択',
      basicInfo: '基本情報',
      pricing: '価格設定',
      inventory: '在庫',
      media: 'メディア',
      seo: 'SEO',
      slug: 'URLスラッグ',
      shipping: '配送',
      save: '商品を保存',
      cancel: 'キャンセル',
      loading: '保存中...',
      error: 'エラー',
      success: '商品が正常に保存されました'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Function to get color name from hex value
  const getColorName = (hex: string): string => {
    const colorMap: { [key: string]: string } = {
      '#000000': language === 'vi' ? 'Đen' : language === 'ja' ? '黒' : 'Black',
      '#FFFFFF': language === 'vi' ? 'Trắng' : language === 'ja' ? '白' : 'White',
      '#FF0000': language === 'vi' ? 'Đỏ' : language === 'ja' ? '赤' : 'Red',
      '#0000FF': language === 'vi' ? 'Xanh dương' : language === 'ja' ? '青' : 'Blue',
      '#008000': language === 'vi' ? 'Xanh lá' : language === 'ja' ? '緑' : 'Green',
      '#FFFF00': language === 'vi' ? 'Vàng' : language === 'ja' ? '黄' : 'Yellow',
      '#800080': language === 'vi' ? 'Tím' : language === 'ja' ? '紫' : 'Purple',
      '#FFA500': language === 'vi' ? 'Cam' : language === 'ja' ? 'オレンジ' : 'Orange',
      '#FFC0CB': language === 'vi' ? 'Hồng' : language === 'ja' ? 'ピンク' : 'Pink',
      '#A52A2A': language === 'vi' ? 'Nâu' : language === 'ja' ? '茶色' : 'Brown',
      '#808080': language === 'vi' ? 'Xám' : language === 'ja' ? 'グレー' : 'Gray',
      '#FFD700': language === 'vi' ? 'Vàng kim' : language === 'ja' ? '金色' : 'Gold',
      '#C0C0C0': language === 'vi' ? 'Bạc' : language === 'ja' ? '銀色' : 'Silver',
      '#FF6347': language === 'vi' ? 'Đỏ cam' : language === 'ja' ? 'トマト' : 'Tomato',
      '#32CD32': language === 'vi' ? 'Xanh lá sáng' : language === 'ja' ? 'ライム' : 'Lime Green',
      '#00CED1': language === 'vi' ? 'Xanh ngọc' : language === 'ja' ? 'ターコイズ' : 'Turquoise',
      '#40E0D0': language === 'vi' ? 'Xanh ngọc' : language === 'ja' ? 'ターコイズ' : 'Turquoise',
      '#FF1493': language === 'vi' ? 'Hồng đậm' : language === 'ja' ? 'ディープピンク' : 'Deep Pink',
      '#8B4513': language === 'vi' ? 'Nâu sẫm' : language === 'ja' ? 'サドルブラウン' : 'Saddle Brown',
      '#2F4F4F': language === 'vi' ? 'Xám đậm' : language === 'ja' ? 'ダークスレートグレー' : 'Dark Slate Gray',
      '#DC143C': language === 'vi' ? 'Đỏ thẫm' : language === 'ja' ? 'クリムゾン' : 'Crimson'
    };

    // Check exact match first
    if (colorMap[hex.toUpperCase()]) {
      return colorMap[hex.toUpperCase()];
    }

    // Try to find closest match for similar colors
    const hexUpper = hex.toUpperCase();
    for (const [colorHex, colorName] of Object.entries(colorMap)) {
      if (hexUpper.includes(colorHex.substring(1, 4)) ||
        colorHex.includes(hexUpper.substring(1, 4))) {
        return colorName;
      }
    }

    // If no match found, return the hex value
    return hex;
  };

  // Generate slug from text
  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD') // Decompose combined characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start
      .replace(/-+$/, ''); // Trim - from end
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      toast({
        title: t.error,
        description: validationErrors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    try {
      // Transform colors to string array for backend
      const transformedData = {
        ...formData,
        colors: formData.colors.map(color =>
          typeof color === 'string' ? color : color.name
        )
      };

      await onSubmit(transformedData);
      toast({
        title: t.success,
      });
    } catch (error) {
      console.error('ProductForm submit error:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const addTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      const updatedTags = [...formData.tags, trimmedTag];
      const badgeStatus = detectBadgeFromTags(updatedTags);

      setFormData(prev => ({
        ...prev,
        tags: updatedTags,
        isLimitedEdition: badgeStatus.isLimitedEdition,
        isBestSeller: badgeStatus.isBestSeller
      }));
      setNewTag('');

      toast({
        title: language === 'vi' ? 'Thêm tag thành công' :
          language === 'ja' ? 'タグを追加しました' :
            'Tag added successfully',
        description: language === 'vi' ? `Đã thêm tag "${trimmedTag}"` :
          language === 'ja' ? `タグ"${trimmedTag}"を追加しました` :
            `Added tag "${trimmedTag}"`,
      });
    } else if (trimmedTag && formData.tags.includes(trimmedTag)) {
      toast({
        title: language === 'vi' ? 'Tag đã tồn tại' :
          language === 'ja' ? 'タグが既に存在します' :
            'Tag already exists',
        description: language === 'vi' ? 'Tag này đã được thêm vào danh sách' :
          language === 'ja' ? 'このタグは既にリストに追加されています' :
            'This tag has already been added to the list',
        variant: 'destructive',
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = formData.tags.filter(tag => tag !== tagToRemove);
    const badgeStatus = detectBadgeFromTags(updatedTags);

    setFormData(prev => ({
      ...prev,
      tags: updatedTags,
      isLimitedEdition: badgeStatus.isLimitedEdition,
      isBestSeller: badgeStatus.isBestSeller
    }));
  };

  const addSize = () => {
    const trimmedSize = newSize.trim();
    if (trimmedSize && !formData.sizes.includes(trimmedSize)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, trimmedSize]
      }));
      setNewSize('');

      toast({
        title: language === 'vi' ? 'Thêm kích thước thành công' :
          language === 'ja' ? 'サイズを追加しました' :
            'Size added successfully',
        description: language === 'vi' ? `Đã thêm kích thước "${trimmedSize}"` :
          language === 'ja' ? `サイズ"${trimmedSize}"を追加しました` :
            `Added size "${trimmedSize}"`,
      });
    } else if (trimmedSize && formData.sizes.includes(trimmedSize)) {
      toast({
        title: language === 'vi' ? 'Kích thước đã tồn tại' :
          language === 'ja' ? 'サイズが既に存在します' :
            'Size already exists',
        description: language === 'vi' ? 'Kích thước này đã được thêm vào danh sách' :
          language === 'ja' ? 'このサイズは既にリストに追加されています' :
            'This size has already been added to the list',
        variant: 'destructive',
      });
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size !== sizeToRemove)
    }));
  };

  const addColor = async () => {
    // Validate hex color format
    const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(newColor) || /^#[0-9A-Fa-f]{3}$/.test(newColor);
    const colorName = newColorName.trim() || getColorName(newColor);

    if (!colorName || !newColor.trim() || !isValidHex) {
      let errorMessage = '';
      if (!colorName) {
        errorMessage = language === 'vi' ? 'Vui lòng nhập tên màu' :
          language === 'ja' ? '色名を入力してください' :
            'Please enter color name';
      } else if (!isValidHex) {
        errorMessage = language === 'vi' ? 'Mã màu hex không hợp lệ (ví dụ: #FF0000)' :
          language === 'ja' ? '無効な16進数カラーコードです（例：#FF0000）' :
            'Invalid hex color code (e.g., #FF0000)';
      }

      toast({
        title: language === 'vi' ? 'Thiếu thông tin' :
          language === 'ja' ? '情報が不足しています' :
            'Missing information',
        description: errorMessage,
        variant: 'destructive',
      });
      return;
    }

    // Check if color already exists in formData
    const colorExistsInForm = formData.colors.some(color =>
      typeof color === 'string' ? color === colorName : color.name === colorName
    );

    if (colorExistsInForm) {
      toast({
        title: language === 'vi' ? 'Màu đã tồn tại' :
          language === 'ja' ? '色が既に存在します' :
            'Color already exists',
        description: language === 'vi' ? 'Màu này đã được thêm vào danh sách' :
          language === 'ja' ? 'この色は既にリストに追加されています' :
            'This color has already been added to the list',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreatingColor(true);

      // Check if color exists in API (local state)
      let colorInApi = apiColors.find(c =>
        c.name.toLowerCase() === colorName.toLowerCase() ||
        c.nameEn?.toLowerCase() === colorName.toLowerCase() ||
        c.nameJa?.toLowerCase() === colorName.toLowerCase()
      );

      // If color doesn't exist in local state, try to create it directly
      // Don't check API first to avoid unnecessary 404 errors and render loops
      if (!colorInApi) {
        try {
          const createColorData: {
            name: string;
            hexValue: string;
            nameEn?: string;
            nameJa?: string;
            isActive?: boolean;
            isDefault?: boolean;
          } = {
            name: colorName,
            hexValue: newColor.trim().toUpperCase(),
            isActive: true,
            isDefault: false
          };

          // Don't add multilingual names automatically
          // Only use base name to avoid conflicts
          // Multilingual names can be added later via update if needed

          const response = await api.createColor(createColorData);
          colorInApi = response.color;

          // Check if this is an existing color (backend returns 200 with isExisting flag)
          // TypeScript knows about isExisting now from API type definition
          const isExisting = response.isExisting === true;

          // Update apiColors state
          setApiColors(prev => {
            const exists = prev.some(c => c._id === colorInApi._id);
            return exists ? prev : [...prev, colorInApi!];
          });

          if (isExisting) {
            toast({
              title: language === 'vi' ? 'Màu đã tồn tại' :
                language === 'ja' ? '色は既に存在します' :
                  'Color already exists',
              description: language === 'vi' ? `Màu "${colorName}" đã tồn tại trong hệ thống, đang sử dụng màu hiện có` :
                language === 'ja' ? `色"${colorName}"は既にシステムに存在します。既存の色を使用しています` :
                  `Color "${colorName}" already exists in system, using existing color`,
              variant: 'default',
            });
          } else {
            toast({
              title: language === 'vi' ? 'Đã tạo màu mới' :
                language === 'ja' ? '新しい色を作成しました' :
                  'Created new color',
              description: language === 'vi' ? `Đã tạo màu "${colorName}" trong hệ thống` :
                language === 'ja' ? `システムに"${colorName}"色を作成しました` :
                  `Created color "${colorName}" in the system`,
            });
          }
        } catch (createError: unknown) {
          const createErr = createError as { statusCode?: number; message?: string };
          // Note: Backend now returns existing color with status 200 instead of throwing error
          // But keep this as fallback for other errors
          if (createErr?.message?.includes('already exists') || createErr?.statusCode === 409 || createErr?.statusCode === 400) {
            // Try to fetch all colors and find matching one
            try {
              const allColorsResponse = await api.getColors({ activeOnly: false });
              colorInApi = allColorsResponse.colors?.find(c =>
                c.name.toLowerCase() === colorName.toLowerCase() ||
                c.nameEn?.toLowerCase() === colorName.toLowerCase() ||
                c.nameJa?.toLowerCase() === colorName.toLowerCase()
              );

              // Update apiColors state
              if (colorInApi) {
                setApiColors(prev => {
                  const exists = prev.some(c => c._id === colorInApi._id);
                  return exists ? prev : [...prev, colorInApi!];
                });

                toast({
                  title: language === 'vi' ? 'Màu đã tồn tại' :
                    language === 'ja' ? '色は既に存在します' :
                      'Color already exists',
                  description: language === 'vi' ? `Màu "${colorName}" đã tồn tại trong hệ thống, đang sử dụng màu hiện có` :
                    language === 'ja' ? `色"${colorName}"は既にシステムに存在します。既存の色を使用しています` :
                      `Color "${colorName}" already exists in system, using existing color`,
                  variant: 'default',
                });
              }
            } catch (retryError) {
              console.error('Error fetching colors list:', retryError);
              // Continue with local color
            }
          } else {
            console.error('Error creating color:', createError);
            // If API creation fails, still add to formData as a local color
            toast({
              title: language === 'vi' ? 'Cảnh báo' :
                language === 'ja' ? '警告' :
                  'Warning',
              description: language === 'vi' ? 'Không thể tạo màu trong hệ thống, chỉ thêm vào sản phẩm này' :
                language === 'ja' ? 'システムに色を作成できませんでした。この製品にのみ追加されます' :
                  'Could not create color in system, only adding to this product',
              variant: 'default',
            });
          }
        }
      }

      // Add color to formData
      const colorToAdd = colorInApi
        ? { name: colorInApi.name, value: colorInApi.hexValue }
        : { name: colorName, value: newColor.trim() };

      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, colorToAdd]
      }));

      setNewColorName('');
      setNewColor('#000000'); // Reset to default color
      setDisplayValue('');

      toast({
        title: language === 'vi' ? 'Thêm màu thành công' :
          language === 'ja' ? '色を追加しました' :
            'Color added successfully',
        description: language === 'vi' ? `Đã thêm màu ${colorName} vào sản phẩm` :
          language === 'ja' ? `${colorName}色を製品に追加しました` :
            `Added color ${colorName} to product`,
      });
    } catch (error) {
      console.error('Error adding color:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' :
          language === 'ja' ? 'エラー' :
            'Error',
        description: language === 'vi' ? 'Không thể thêm màu' :
          language === 'ja' ? '色を追加できませんでした' :
            'Failed to add color',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingColor(false);
    }
  };

  const removeColor = (colorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(color =>
        typeof color === 'string' ? color !== colorToRemove : color.name !== colorToRemove
      )
    }));
  };

  const addMaterial = () => {
    const trimmedMaterial = newMaterial.trim();
    if (trimmedMaterial && !formData.materials.includes(trimmedMaterial)) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, trimmedMaterial]
      }));
      setNewMaterial('');
      toast({
        title: language === 'vi' ? 'Thêm chất liệu thành công' :
          language === 'ja' ? '素材を追加しました' :
            'Material added successfully',
        description: language === 'vi' ? `Đã thêm chất liệu "${trimmedMaterial}"` :
          language === 'ja' ? `素材"${trimmedMaterial}"を追加しました` :
            `Added material "${trimmedMaterial}"`,
      });
    } else if (trimmedMaterial && formData.materials.includes(trimmedMaterial)) {
      toast({
        title: language === 'vi' ? 'Chất liệu đã tồn tại' :
          language === 'ja' ? '素材が既に存在します' :
            'Material already exists',
        description: language === 'vi' ? 'Chất liệu này đã được thêm vào danh sách' :
          language === 'ja' ? 'この素材は既にリストに追加されています' :
            'This material has already been added to the list',
        variant: 'destructive',
      });
    }
  };

  const removeMaterial = (materialToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(material => material !== materialToRemove)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you would upload to a server and get URLs
      const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Cloudinary image handlers
  const handleCloudinaryImagesUploaded = (newImages: CloudinaryImage[]) => {
    setFormData(prev => ({
      ...prev,
      cloudinaryImages: [...prev.cloudinaryImages, ...newImages]
    }));
  };

  const handleCloudinaryImagesRemoved = (publicIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      cloudinaryImages: prev.cloudinaryImages.filter(img => !publicIds.includes(img.publicId))
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            {t.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t.save}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t.basicInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const newSlug = mode === 'create' ? generateSlug(name) : formData.slug;
                  setFormData(prev => ({
                    ...prev,
                    name,
                    slug: newSlug
                  }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug-preview" className="text-muted-foreground">{t.slug}</Label>
              <Input
                id="slug-preview"
                value={formData.slug}
                readOnly
                className="bg-muted text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">{t.nameEn}</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameJa">{t.nameJa}</Label>
              <Input
                id="nameJa"
                value={formData.nameJa}
                onChange={(e) => setFormData(prev => ({ ...prev, nameJa: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{t.category}</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <div className="border rounded-md overflow-hidden">
                <MDEditor
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value || '' }))}
                  data-color-mode="light"
                  height={250}
                  preview="live"
                  hideToolbar={false}
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder: 'Nhập mô tả sản phẩm bằng Markdown...\n\nVí dụ:\n**In đậm**\n*In nghiêng*\n# Tiêu đề\n- Danh sách\n1. Đánh số',
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">{t.descriptionEn}</Label>
              <div className="border rounded-md overflow-hidden">
                <MDEditor
                  value={formData.descriptionEn}
                  onChange={(value) => setFormData(prev => ({ ...prev, descriptionEn: value || '' }))}
                  data-color-mode="light"
                  height={250}
                  preview="live"
                  hideToolbar={false}
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder: 'Enter product description in Markdown...\n\nExample:\n**Bold text**\n*Italic text*\n# Heading\n- List item\n1. Numbered list',
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionJa">{t.descriptionJa}</Label>
              <div className="border rounded-md overflow-hidden">
                <MDEditor
                  value={formData.descriptionJa}
                  onChange={(value) => setFormData(prev => ({ ...prev, descriptionJa: value || '' }))}
                  data-color-mode="light"
                  height={250}
                  preview="live"
                  hideToolbar={false}
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder: 'Markdownで商品説明を入力...\n\n例:\n**太字**\n*斜体*\n# 見出し\n- リスト\n1. 番号付きリスト',
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t.pricing}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t.price}</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, price: isNaN(value) ? 0 : value }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">{t.originalPrice}</Label>
              <Input
                id="originalPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, originalPrice: isNaN(value) ? 0 : value }));
                }}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.isActive}</Label>
                  <p className="text-sm text-muted-foreground">Make product visible to customers</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.isFeatured}</Label>
                  <p className="text-sm text-muted-foreground">Show on homepage and featured sections</p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.onSale}</Label>
                  <p className="text-sm text-muted-foreground">Mark as on sale</p>
                </div>
                <Switch
                  checked={formData.onSale}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, onSale: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.isNew}</Label>
                  <p className="text-sm text-muted-foreground">Mark as new product</p>
                </div>
                <Switch
                  checked={formData.isNew}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNew: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.isLimitedEdition}</Label>
                  <p className="text-sm text-muted-foreground">Mark as limited edition</p>
                </div>
                <Switch
                  checked={formData.isLimitedEdition}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isLimitedEdition: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.isBestSeller}</Label>
                  <p className="text-sm text-muted-foreground">Mark as best seller</p>
                </div>
                <Switch
                  checked={formData.isBestSeller}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBestSeller: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t.inventory}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stock">{t.stock}</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFormData(prev => ({ ...prev, stock: isNaN(value) ? 0 : value }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">{t.sku}</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">{t.barcode}</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.sizes}</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {defaultSizes.map(size => (
                    <Badge
                      key={size}
                      variant={formData.sizes.includes(size) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (formData.sizes.includes(size)) {
                          removeSize(size);
                        } else {
                          setFormData(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
                        }
                      }}
                    >
                      {size}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Custom size"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addSize}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-base font-semibold">{t.colors}</Label>

                {/* Selected Colors Display */}
                {formData.colors.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      {language === 'vi' ? 'Màu đã chọn' : language === 'ja' ? '選択された色' : 'Selected Colors'} ({formData.colors.length})
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/30">
                      {normalizedSelectedColors.map((colorObj) => {
                        // Use stable key with name and value to avoid re-render issues
                        const colorKey = `selected-${colorObj.name}-${colorObj.value}`;

                        return (
                          <div
                            key={colorKey}
                            className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-md"
                            style={{
                              backgroundColor: colorObj.value,
                              borderColor: colorObj.value === '#FFFFFF' || colorObj.value === '#ffffff' ? '#e5e7eb' : colorObj.value,
                            }}
                          >
                            <span
                              className="text-sm font-medium"
                              style={{ color: colorObj.value === '#FFFFFF' || colorObj.value === '#ffffff' || colorObj.value === '#FFFF00' || colorObj.value === '#ffff00' ? '#000' : '#fff' }}
                            >
                              {colorObj.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                removeColor(colorObj.name);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5 rounded hover:bg-black/20"
                              style={{ color: colorObj.value === '#FFFFFF' || colorObj.value === '#ffffff' || colorObj.value === '#FFFF00' || colorObj.value === '#ffff00' ? '#000' : '#fff' }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Colors Picker */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {language === 'vi' ? 'Màu Sắc Có Sẵn' : language === 'ja' ? '利用可能な色' : 'Available Colors'}
                  </Label>
                  {colorsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">
                        {language === 'vi' ? 'Đang tải màu sắc...' : language === 'ja' ? '色を読み込み中...' : 'Loading colors...'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/20">
                      {apiColors.length > 0 ? apiColors.map(color => {
                        const colorName = language === 'en' ? (color.nameEn || color.name) :
                          language === 'ja' ? (color.nameJa || color.name) :
                            color.name;
                        const colorHex = color.hexValue;
                        const isSelected = formData.colors.some(c =>
                          typeof c === 'string' ? c === color.name : c.name === color.name
                        );
                        return (
                          <button
                            key={color._id || color.name}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                removeColor(color.name);
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  colors: [...prev.colors, { name: color.name, value: colorHex }]
                                }));
                                // Auto-fill color picker for editing
                                setNewColor(colorHex);
                                setNewColorName(color.name);
                                setDisplayValue(getColorName(colorHex));
                              }
                            }}
                            className={`
                              px-4 py-2 rounded-lg font-medium text-sm transition-all
                              ${isSelected
                                ? 'ring-2 ring-offset-2 ring-primary shadow-md scale-105'
                                : 'hover:scale-105 hover:shadow-md opacity-90 hover:opacity-100'
                              }
                            `}
                            style={{
                              backgroundColor: colorHex,
                              color: colorHex === '#FFFFFF' || colorHex === '#FFFF00' ? '#000' : '#fff',
                              border: `2px solid ${isSelected ? '#3b82f6' : 'transparent'}`
                            }}
                          >
                            {colorName}
                          </button>
                        );
                      }) : (
                        <p className="text-sm text-muted-foreground p-4">
                          {language === 'vi' ? 'Không có màu sắc có sẵn' :
                            language === 'ja' ? '利用可能な色がありません' :
                              'No colors available'}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Custom Color Input Section */}
                <div className="space-y-3 p-4 rounded-lg border bg-muted/10">
                  <Label className="text-sm font-medium">
                    {language === 'vi' ? 'Tùy Chỉnh Màu Sắc' : language === 'ja' ? 'カスタム色' : 'Custom Color'}
                  </Label>

                  {/* Color Name Input */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      {language === 'vi' ? 'Tên màu' : language === 'ja' ? '色名' : 'Color name'}
                    </Label>
                    <Input
                      placeholder={language === 'vi' ? 'Nhập tên màu (ví dụ: Đỏ, Xanh lá, ...)' :
                        language === 'ja' ? '色名を入力（例：赤、緑など）' :
                          'Enter color name (e.g., Red, Green, ...)'}
                      value={newColorName || getColorName(newColor)}
                      onChange={(e) => setNewColorName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                      className="w-full"
                    />
                  </div>

                  {/* Color Picker & Preview */}
                  <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-center">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs text-muted-foreground">
                        {language === 'vi' ? 'Chọn màu' : language === 'ja' ? '色を選択' : 'Pick color'}
                      </Label>
                      <Input
                        type="color"
                        value={newColor}
                        onChange={(e) => {
                          setNewColor(e.target.value);
                          const colorName = getColorName(e.target.value);
                          setDisplayValue(colorName);
                          if (!newColorName || newColorName === getColorName(newColor)) {
                            setNewColorName(colorName);
                          }
                        }}
                        className="w-14 h-14 p-1 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors"
                        title={`${getColorName(newColor)} (${newColor})`}
                      />
                    </div>

                    {/* Color Preview */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs text-muted-foreground">
                        {language === 'vi' ? 'Xem trước' : language === 'ja' ? 'プレビュー' : 'Preview'}
                      </Label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-12 h-12 rounded-lg border-2 shadow-md"
                          style={{ backgroundColor: newColor }}
                          title={`${getColorName(newColor)} (${newColor})`}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{newColorName || getColorName(newColor)}</div>
                          <div className="text-xs text-muted-foreground">{newColor.toUpperCase()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Hex Input */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs text-muted-foreground">Hex</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="#FF0000"
                          value={newColor.toUpperCase()}
                          onChange={(e) => {
                            const inputValue = e.target.value.toUpperCase();

                            if (inputValue.startsWith('#') || /^[0-9A-Fa-f]/.test(inputValue)) {
                              let hexValue = inputValue;

                              if (hexValue && !hexValue.startsWith('#')) {
                                hexValue = '#' + hexValue;
                              }

                              if (/^#[0-9A-Fa-f]{6}$/.test(hexValue) || /^#[0-9A-Fa-f]{3}$/.test(hexValue)) {
                                setNewColor(hexValue);
                                setDisplayValue(hexValue);
                                const colorName = getColorName(hexValue);
                                if (!newColorName || newColorName === getColorName(newColor)) {
                                  setNewColorName(colorName);
                                }
                              } else if (hexValue === '' || hexValue === '#') {
                                setNewColor('#000000');
                                setDisplayValue('');
                              } else {
                                setNewColor(hexValue);
                                setDisplayValue(hexValue);
                              }
                            } else {
                              setDisplayValue(inputValue);
                            }
                          }}
                          className="w-24 text-sm font-mono"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add Color Button */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="button"
                      onClick={addColor}
                      className="flex-1"
                      disabled={!newColorName.trim() && getColorName(newColor) === 'Unknown'}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t.addColor}
                    </Button>
                    {(newColorName || newColor !== '#000000') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewColorName('');
                          setNewColor('#000000');
                          setDisplayValue('');
                        }}
                        title={language === 'vi' ? 'Xóa' : language === 'ja' ? 'クリア' : 'Clear'}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {t.media}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t.images}</Label>
              <CloudinaryImageUpload
                onImagesUploaded={handleCloudinaryImagesUploaded}
                onImagesRemoved={handleCloudinaryImagesRemoved}
                existingImages={formData.cloudinaryImages}
                maxFiles={10}
                maxSize={10 * 1024 * 1024} // 10MB
                acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']}
              />
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              {t.technicalSpecs}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Materials */}
            <div className="space-y-2">
              <Label>{t.materials}</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.materials.map(material => (
                  <Badge
                    key={material}
                    variant="secondary"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => removeMaterial(material)}
                  >
                    {material} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={language === 'vi' ? 'Nhập chất liệu (ví dụ: 100% Lụa, Cotton, Polyester...)' :
                    language === 'ja' ? '素材を入力（例：100%シルク、綿、ポリエステル...）' :
                      'Enter material (e.g., 100% Silk, Cotton, Polyester...)'}
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                />
                <Button type="button" variant="outline" onClick={addMaterial}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'vi' ? 'Gợi ý: 100% Lụa, Cotton 70% Polyester 30%, Vải lanh, Satin...' :
                  language === 'ja' ? '推奨：100%シルク、綿70%ポリエステル30%、リネン、サテン...' :
                    'Suggestions: 100% Silk, 70% Cotton 30% Polyester, Linen, Satin...'}
              </p>
            </div>

            <Separator />

            {/* Origin */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="origin">{t.origin}</Label>
                <Input
                  id="origin"
                  placeholder={language === 'vi' ? 'Nhập xuất xứ (ví dụ: Nhật Bản, Việt Nam, ...)' :
                    language === 'ja' ? '原産国を入力（例：日本、ベトナム...）' :
                      'Enter origin (e.g., Japan, Vietnam, ...)'}
                  value={formData.origin}
                  onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originEn">{t.originEn}</Label>
                <Input
                  id="originEn"
                  placeholder="Enter origin in English (e.g., Japan, Vietnam, ...)"
                  value={formData.originEn}
                  onChange={(e) => setFormData(prev => ({ ...prev, originEn: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originJa">{t.originJa}</Label>
                <Input
                  id="originJa"
                  placeholder="原産国を日本語で入力（例：日本、ベトナム...）"
                  value={formData.originJa}
                  onChange={(e) => setFormData(prev => ({ ...prev, originJa: e.target.value }))}
                  className="w-full"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {language === 'vi' ? 'Quốc gia hoặc vùng sản xuất sản phẩm cho từng ngôn ngữ' :
                  language === 'ja' ? '各言語の製品の製造国または地域' :
                    'Country or region where the product is manufactured for each language'}
              </p>
            </div>

            <Separator />

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">{t.weight}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.weight || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setFormData(prev => ({ ...prev, weight: isNaN(value) ? 0 : value }));
                  }}
                  placeholder={language === 'vi' ? 'Nhập trọng lượng (kg)' :
                    language === 'ja' ? '重量を入力（kg）' :
                      'Enter weight (kg)'}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">kg</span>
              </div>
            </div>

            <Separator />

            {/* Dimensions */}
            <div className="space-y-2">
              <Label>{t.dimensions}</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t.length}</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.dimensions.length || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, length: isNaN(value) ? 0 : value }
                        }));
                      }}
                      placeholder="0"
                      className="text-sm"
                    />
                    <span className="text-xs text-muted-foreground">cm</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t.width}</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.dimensions.width || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, width: isNaN(value) ? 0 : value }
                        }));
                      }}
                      placeholder="0"
                      className="text-sm"
                    />
                    <span className="text-xs text-muted-foreground">cm</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t.height}</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.dimensions.height || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          dimensions: { ...prev.dimensions, height: isNaN(value) ? 0 : value }
                        }));
                      }}
                      placeholder="0"
                      className="text-sm"
                    />
                    <span className="text-xs text-muted-foreground">cm</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'vi' ? 'Kích thước khi đóng gói (Dài x Rộng x Cao)' :
                  language === 'ja' ? 'パッケージサイズ（長さ x 幅 x 高さ）' :
                    'Package dimensions (Length x Width x Height)'}
              </p>
            </div>

            <Separator />

            {/* Care Instructions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="careInstructions">{t.careInstructions}</Label>
                <Textarea
                  id="careInstructions"
                  placeholder={language === 'vi' ? 'Hướng dẫn bảo quản và giặt ủi (ví dụ: Giặt tay, Không sử dụng chất tẩy, Ủi ở nhiệt độ thấp...)' :
                    language === 'ja' ? 'お手入れ方法（例：手洗い、漂白剤を使用しない、低温でアイロンをかける...）' :
                      'Care instructions (e.g., Hand wash, Do not bleach, Iron on low heat...)'}
                  value={formData.careInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, careInstructions: e.target.value }))}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="careInstructionsEn">{t.careInstructionsEn}</Label>
                <Textarea
                  id="careInstructionsEn"
                  placeholder="Care instructions in English (e.g., Hand wash, Do not bleach, Iron on low heat...)"
                  value={formData.careInstructionsEn}
                  onChange={(e) => setFormData(prev => ({ ...prev, careInstructionsEn: e.target.value }))}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="careInstructionsJa">{t.careInstructionsJa}</Label>
                <Textarea
                  id="careInstructionsJa"
                  placeholder="お手入れ方法を日本語で入力（例：手洗い、漂白剤を使用しない、低温でアイロンをかける...）"
                  value={formData.careInstructionsJa}
                  onChange={(e) => setFormData(prev => ({ ...prev, careInstructionsJa: e.target.value }))}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {language === 'vi' ? 'Nhập hướng dẫn cách bảo quản và chăm sóc sản phẩm cho từng ngôn ngữ' :
                  language === 'ja' ? '各言語の製品の保管とお手入れ方法を入力' :
                    'Enter instructions for product care and maintenance for each language'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t.seo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode !== 'create' && (
              <div className="space-y-2">
                <Label htmlFor="slug">{t.slug}</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="product-url-slug"
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'vi' ? 'Để trống để tự động tạo từ tên sản phẩm' :
                    language === 'ja' ? '商品名から自動生成するには空のままにしてください' :
                      'Leave empty to auto-generate from product name'}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="metaTitle">{t.metaTitle}</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">{t.metaDescription}</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={3}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Badge Preview</Label>
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                  {formData.stock <= 0 && (
                    <Badge variant="secondary" className="bg-stone-500/90 text-white">
                      {language === 'vi' ? 'Hết hàng' : language === 'ja' ? '在庫切れ' : 'Out of Stock'}
                    </Badge>
                  )}
                  {formData.stock > 0 && formData.onSale && formData.originalPrice > formData.price && (
                    <Badge variant="destructive" className="bg-red-500/90 text-white">
                      -{Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}% {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'OFF'}
                    </Badge>
                  )}
                  {formData.stock > 0 && !formData.onSale && formData.isFeatured && (
                    <Badge variant="default" className="bg-stone-800/90 dark:bg-stone-200/90 text-white dark:text-stone-800">
                      {language === 'vi' ? 'Nổi bật' : language === 'ja' ? 'おすすめ' : 'Featured'}
                    </Badge>
                  )}
                  {formData.stock > 0 && !formData.onSale && formData.isNew && (
                    <Badge className="bg-green-500/90 text-white">
                      {language === 'vi' ? 'MỚI' : language === 'ja' ? '新着' : 'NEW'}
                    </Badge>
                  )}
                  {formData.stock > 0 && formData.isLimitedEdition && (
                    <Badge className="bg-purple-500/90 text-white">
                      {language === 'vi' ? 'Phiên bản giới hạn' : language === 'ja' ? '限定版' : 'Limited Edition'}
                    </Badge>
                  )}
                  {formData.stock > 0 && formData.isBestSeller && (
                    <Badge className="bg-orange-500/90 text-white">
                      {language === 'vi' ? 'Bán chạy' : language === 'ja' ? 'ベストセラー' : 'Best Seller'}
                    </Badge>
                  )}
                  {formData.stock > 0 && !formData.onSale && !formData.isFeatured && !formData.isNew && !formData.isLimitedEdition && !formData.isBestSeller && (
                    <span className="text-sm text-muted-foreground">No badges will be displayed</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.tags}</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Suggested tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {[
                        'limited', 'bestseller', 'new', 'featured', 'sale', 'premium', 'organic', 'eco-friendly',
                        'giới hạn', 'bán chạy', 'mới', 'nổi bật', 'giảm giá', 'cao cấp', 'hữu cơ', 'thân thiện môi trường',
                        '限定', 'ベストセラー', '新着', 'おすすめ', 'セール', 'プレミアム', 'オーガニック', 'エコフレンドリー'
                      ].map(suggestedTag => (
                        <Badge
                          key={suggestedTag}
                          variant="outline"
                          className="cursor-pointer text-xs hover:bg-primary hover:text-primary-foreground"
                          onClick={() => {
                            if (!formData.tags.includes(suggestedTag)) {
                              setNewTag(suggestedTag);
                              addTag();
                            }
                          }}
                        >
                          {suggestedTag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </form>
  );
} 