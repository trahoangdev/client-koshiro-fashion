// Basic API Types
export interface ApiResponse<T = unknown> {
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    phone?: string;
    address?: string;
}

// Product Types
export interface ProductVideo {
    url: string;
    thumbnail?: string;
    title?: string;
    duration?: number;
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
    _id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
    price: number;
    originalPrice?: number;
    salePrice?: number;
    categoryId: string | {
        _id: string;
        name: string;
        nameEn?: string;
        nameJa?: string;
        slug: string;
    };
    images: string[];
    cloudinaryImages?: CloudinaryImage[];
    videos?: ProductVideo[];
    sizes: string[];
    colors: string[];
    stock: number;
    isActive: boolean;
    isFeatured: boolean;
    onSale: boolean;
    isNew: boolean;
    isLimitedEdition: boolean;
    isBestSeller: boolean;
    tags: string[];
    views?: number;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    materials?: string[];
    careInstructions?: string;
    careInstructionsEn?: string;
    careInstructionsJa?: string;
    origin?: string;
    originEn?: string;
    originJa?: string;
    sku?: string;
    barcode?: string;
    createdAt: string;
    updatedAt: string;
}

// Category Types
export interface Category {
    _id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
    slug: string;
    image?: string;
    cloudinaryImages?: CloudinaryImage[];
    bannerImage?: string;
    cloudinaryBannerImages?: CloudinaryImage[];
    isActive: boolean;
    parentId?: string;
    productCount: number;
    children?: Category[];
    createdAt: string;
    updatedAt: string;
}

// Order & User Types
export interface OrderItem {
    productId?: {
        _id: string;
        name: string;
        nameEn?: string;
        nameJa?: string;
        images: string[];
        price: number;
    } | null;
    name: string;
    nameVi: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
}

export interface Permission {
    _id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
    resource: string;
    action: string;
    conditions?: string;
    isActive: boolean;
    isSystem: boolean;
    category: string;
    createdAt: string;
    updatedAt: string;
}

export interface Role {
    _id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
    permissions: Permission[];
    isActive: boolean;
    isSystem: boolean;
    level: number;
    userCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role: string | {
        _id: string;
        name: string;
        nameEn?: string;
        nameJa?: string;
        level: number;
        isActive: boolean;
    };
    status: 'active' | 'inactive' | 'blocked';
    isActive: boolean;
    totalOrders: number;
    orderCount: number;
    totalSpent: number;
    lastActive?: string;
    preferences?: {
        language?: string;
        currency?: string;
        emailNotifications?: boolean;
        smsNotifications?: boolean;
        marketingEmails?: boolean;
        notificationPreferences?: {
            email?: {
                orderUpdates?: boolean;
                promotions?: boolean;
                newsletters?: boolean;
                productRecommendations?: boolean;
            };
            push?: {
                orderUpdates?: boolean;
                promotions?: boolean;
                backInStock?: boolean;
                priceDrops?: boolean;
            };
            sms?: {
                orderUpdates?: boolean;
                promotions?: boolean;
            };
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Order {
    _id: string;
    orderNumber: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        phone: string;
    };
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'returned' | 'refunded';
    items: OrderItem[];
    totalAmount: number;
    shippingAddress: {
        name: string;
        phone: string;
        address: string;
        city: string;
        district: string;
    };
    paymentMethod: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Payment & Address Types
export interface PaymentMethod {
    _id: string;
    type: 'credit_card' | 'debit_card' | 'paypal';
    name: string;
    last4?: string;
    expiryMonth?: string;
    expiryYear?: string;
    isDefault: boolean;
    brand?: string;
    paypalEmail?: string;
}

export interface Address {
    _id: string;
    type: 'shipping' | 'billing';
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

// Review Types
export interface Review {
    _id: string;
    userId?: {
        _id: string;
        name: string;
        email: string;
    } | null;
    productId?: {
        _id: string;
        name: string;
    } | null;
    rating: number;
    title: string;
    comment: string;
    verified: boolean;
    helpful: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReviewRequest {
    productId?: string;
    userId?: string;
    rating: number;
    title: string;
    comment: string;
}

// Settings & System Types
export interface ShippingZone {
    name: string;
    cost: number;
}

export interface Settings {
    _id: string;
    websiteName: string;
    websiteDescription: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    timezone: string;
    currency: string;
    language: string;
    emailNotifications: boolean;
    orderNotifications: boolean;
    stockNotifications: boolean;
    customerNotifications: boolean;
    adminNotifications: boolean;
    sessionTimeout: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    maxLoginAttempts: number;
    enableCaptcha: boolean;
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    cashOnDelivery: boolean;
    bankTransfer: boolean;
    freeShippingThreshold: number;
    defaultShippingCost: number;
    enableTracking: boolean;
    shippingZones: ShippingZone[];
    theme: string;
    primaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    enableDarkMode: boolean;
    maintenanceMode: boolean;
    debugMode: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ActivityLog {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    action: string;
    resource: string;
    resourceId: string;
    details: string;
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    category: 'user' | 'product' | 'order' | 'system' | 'security' | 'data';
}

export interface Notification {
    _id: string;
    userId?: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    category: 'system' | 'order' | 'product' | 'user' | 'marketing';
    read: boolean;
    actionUrl?: string;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface FlashSale {
    _id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    description: string;
    descriptionEn?: string;
    descriptionJa?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
    maxQuantity?: number;
    soldQuantity: number;
    applicableProducts: string[];
    applicableCategories: string[];
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    usedCount: number;
    image?: string;
    bannerColor?: string;
    textColor?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Color {
    _id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    hexValue: string;
    isActive: boolean;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateColorRequest {
    name: string;
    nameEn?: string;
    nameJa?: string;
    hexValue: string;
    isActive?: boolean;
    isDefault?: boolean;
}

export interface UpdateColorRequest {
    name?: string;
    nameEn?: string;
    nameJa?: string;
    hexValue?: string;
    isActive?: boolean;
    isDefault?: boolean;
}

export interface CartItem {
    product: Product;
    quantity: number;
    selectedColor: string;
    selectedSize: string;
}
