export interface ProductVideo {
  publicId: string;
  secureUrl: string;
  duration?: number;
  format: string;
  bytes: number;
}

export interface CloudinaryImage {
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

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  description?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  price: number;
  originalPrice?: number;
  images: string[]; // Legacy field for backward compatibility
  cloudinaryImages?: CloudinaryImage[]; // New Cloudinary images
  videos?: ProductVideo[];
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  sizes: string[];
  colors: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  nameEn?: string;
  nameJa?: string;
  description?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  price: number;
  originalPrice?: number;
  images: string[]; // Legacy field for backward compatibility
  cloudinaryImages?: CloudinaryImage[]; // New Cloudinary images
  videos?: ProductVideo[];
  categoryId: string;
  sizes: string[];
  colors: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}