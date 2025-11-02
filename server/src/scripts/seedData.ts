import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product, IProduct } from '../models/Product';
import { Order } from '../models/Order';
import Inventory from '../models/Inventory';
import StockMovement from '../models/StockMovement';
import Promotion from '../models/Promotion';
import FlashSale from '../models/FlashSale';
import { ShippingMethod } from '../models/Shipping';
import { AdminPaymentMethod } from '../models/Payment';
import { Review } from '../models/Review';
import Role from '../models/Role';
import Permission from '../models/Permission';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

// Enhanced color translations with proper color codes
const colorTranslations = {
  'Đen': { en: 'Black', ja: '黒', hex: '#000000' },
  'Trắng': { en: 'White', ja: '白', hex: '#FFFFFF' },
  'Đỏ': { en: 'Red', ja: '赤', hex: '#FF0000' },
  'Xanh dương': { en: 'Blue', ja: '青', hex: '#0000FF' },
  'Xanh lá': { en: 'Green', ja: '緑', hex: '#00FF00' },
  'Hồng': { en: 'Pink', ja: 'ピンク', hex: '#FFC0CB' },
  'Tím': { en: 'Purple', ja: '紫', hex: '#800080' },
  'Vàng': { en: 'Yellow', ja: '黄色', hex: '#FFFF00' },
  'Nâu': { en: 'Brown', ja: '茶色', hex: '#A52A2A' },
  'Xám': { en: 'Gray', ja: 'グレー', hex: '#808080' },
  'Xanh đen': { en: 'Navy', ja: 'ネイビー', hex: '#000080' },
  'Tím đen': { en: 'Dark Purple', ja: 'ダークパープル', hex: '#4B0082' },
  'Cam': { en: 'Orange', ja: 'オレンジ', hex: '#FFA500' },
  'Kem': { en: 'Cream', ja: 'クリーム', hex: '#FFFDD0' },
  'Bạc': { en: 'Silver', ja: 'シルバー', hex: '#C0C0C0' },
  'Vàng kim': { en: 'Gold', ja: 'ゴールド', hex: '#FFD700' }
};

// Enhanced size translations
const sizeTranslations = {
  'XS': { en: 'XS', ja: 'XS' },
  'S': { en: 'S', ja: 'S' },
  'M': { en: 'M', ja: 'M' },
  'L': { en: 'L', ja: 'L' },
  'XL': { en: 'XL', ja: 'XL' },
  'XXL': { en: 'XXL', ja: 'XXL' },
  'One Size': { en: 'One Size', ja: 'フリーサイズ' }
};

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (but keep roles and permissions)
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Inventory.deleteMany({});
    await StockMovement.deleteMany({});
    await Promotion.deleteMany({});
    await FlashSale.deleteMany({});
    await ShippingMethod.deleteMany({});
    await AdminPaymentMethod.deleteMany({});
    console.log('✅ Cleared existing data (keeping roles and permissions)');

    // Get or create admin role
    let adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
      // If no admin role exists, create a basic one
      adminRole = new Role({
        name: 'Admin',
        nameEn: 'Admin',
        nameJa: '管理者',
        description: 'Administrative access to most system features',
        descriptionEn: 'Administrative access to most system features',
        descriptionJa: 'ほとんどのシステム機能への管理アクセス',
        level: 90,
        isSystem: true,
        isActive: true,
        permissions: [] // Will be populated by roles seeding script
      });
      await adminRole.save();
      console.log('✅ Created basic admin role');
    }

    // Get or create customer role
    let customerRole = await Role.findOne({ name: 'Customer' });
    if (!customerRole) {
      customerRole = new Role({
        name: 'Customer',
        nameEn: 'Customer',
        nameJa: '顧客',
        description: 'Standard customer access',
        descriptionEn: 'Standard customer access',
        descriptionJa: '標準的な顧客アクセス',
        level: 10,
        isSystem: true,
        isActive: true,
        permissions: []
      });
      await customerRole.save();
      console.log('✅ Created basic customer role');
    }

    // Check if we need to seed roles and permissions
    const existingPermissions = await Permission.countDocuments();
    if (existingPermissions === 0) {
      console.log('🔄 No permissions found, running roles and permissions seeding...');
      try {
        // Import and run the roles seeding script
        const { default: seedRolesAndPermissions } = await import('./seedRolesAndPermissions');
        await seedRolesAndPermissions();
        console.log('✅ Roles and permissions seeded successfully');
        
        // Refresh role references after seeding
        adminRole = await Role.findOne({ name: 'Admin' });
        customerRole = await Role.findOne({ name: 'Customer' });
      } catch (error) {
        console.log('⚠️  Could not seed roles and permissions, using basic roles:', error);
      }
    }

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@koshiro.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword, // Don't hash here, User model will hash it
      name: 'Admin Koshiro',
      role: adminRole!._id, // Use role reference instead of string
      status: 'active',
      totalOrders: 0,
      totalSpent: 0,
      addresses: [
        {
          type: 'shipping',
          fullName: 'Admin Koshiro',
          phone: '+81-3-1234-5678',
          address: '123 Shibuya Street',
          city: 'Tokyo',
          state: 'Tokyo',
          zipCode: '150-0002',
          country: 'Japan',
          isDefault: true
        }
      ],
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        language: 'ja',
        currency: 'JPY'
      }
    });
    await adminUser.save();
    console.log('✅ Created admin user with role');

    // Create sample users
    const sampleUsers = [
      {
        email: 'customer1@example.com',
        password: 'password123', // Don't hash here, User model will hash it
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        role: customerRole!._id, // Use role reference instead of string
        status: 'active',
        totalOrders: 0,
        totalSpent: 0,
        addresses: [
          {
            type: 'shipping',
            fullName: 'Nguyễn Văn A',
            phone: '0123456789',
            address: '456 Le Loi Street',
            city: 'Ho Chi Minh City',
            state: 'Ho Chi Minh City',
            zipCode: '700000',
            country: 'Vietnam',
            isDefault: true
          }
        ],
        preferences: {
          emailNotifications: true,
          smsNotifications: true,
          marketingEmails: true,
          language: 'vi',
          currency: 'VND'
        }
      },
      {
        email: 'customer2@example.com',
        password: 'password123', // Don't hash here, User model will hash it
        name: 'John Smith',
        phone: '+1-555-0123',
        role: customerRole!._id, // Use role reference instead of string
        status: 'active',
        totalOrders: 0,
        totalSpent: 0,
        addresses: [
          {
            type: 'shipping',
            fullName: 'John Smith',
            phone: '+1-555-0123',
            address: '789 Broadway',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
            isDefault: true
          }
        ],
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          language: 'en',
          currency: 'USD'
        }
      },
      {
        email: 'customer3@example.com',
        password: 'password123', // Don't hash here, User model will hash it
        name: 'Tanaka Hiroshi',
        phone: '+81-3-9876-5432',
        role: customerRole!._id, // Use role reference instead of string
        status: 'active',
        totalOrders: 0,
        totalSpent: 0,
        addresses: [
          {
            type: 'shipping',
            fullName: 'Tanaka Hiroshi',
            phone: '+81-3-9876-5432',
            address: '321 Sakura Street',
            city: 'Osaka',
            state: 'Osaka',
            zipCode: '540-0001',
            country: 'Japan',
            isDefault: true
          }
        ],
        preferences: {
          emailNotifications: true,
          smsNotifications: true,
          marketingEmails: false,
          language: 'ja',
          currency: 'JPY'
        }
      }
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    console.log('✅ Created sample users');

    // Create enhanced categories with full multilingual support
    const categories = [
      {
        name: 'Kimono',
        nameEn: 'Kimono',
        nameJa: '着物',
        description: 'Kimono truyền thống Nhật Bản với nghệ thuật thêu tay và họa tiết độc quyền',
        descriptionEn: 'Traditional Japanese kimono with hand-embroidered artistry and exclusive patterns',
        descriptionJa: '手刺繍の芸術性と独占的なパターンを持つ本格的な伝統的日本の着物',
        slug: 'kimono',
        image: '/images/categories/kimono.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Yukata',
        nameEn: 'Yukata',
        nameJa: '浴衣',
        description: 'Yukata mùa hè nhẹ nhàng với họa tiết hoa anh đào và thiết kế thoải mái cho mọi dịp',
        descriptionEn: 'Light summer yukata with cherry blossom patterns and comfortable designs for all occasions',
        descriptionJa: 'あらゆる機会に適した桜の模様と快適なデザインの軽い夏の浴衣',
        slug: 'yukata',
        image: '/images/categories/yukata.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Áo',
        nameEn: 'Tops',
        nameJa: 'トップス',
        description: 'Bộ sưu tập các loại áo thời trang Nhật Bản cao cấp với chất liệu tự nhiên và thiết kế tinh tế',
        descriptionEn: 'Premium Japanese fashion tops collection with natural materials and refined designs',
        descriptionJa: '自然素材と洗練されたデザインによる日本のプレミアムファッショントップスコレクション',
        slug: 'tops',
        image: '/images/categories/tops.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Quần',
        nameEn: 'Bottoms',
        nameJa: 'ボトムス',
        description: 'Bộ sưu tập quần và váy thời trang Nhật Bản với phom dáng hoàn hảo và comfort tối ưu',
        descriptionEn: 'Japanese fashion bottoms collection with perfect fit and optimal comfort',
        descriptionJa: '完璧なフィットと最適な快適さを備えた日本のファッションボトムスコレクション',
        slug: 'bottoms',
        image: '/images/categories/bottoms.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Hakama',
        nameEn: 'Hakama',
        nameJa: '袴',
        description: 'Hakama truyền thống cho các dịp trang trọng với chất liệu silk cao cấp và may thủ công',
        descriptionEn: 'Traditional hakama for formal occasions with premium silk materials and handcrafted construction',
        descriptionJa: 'プレミアムシルク素材と手作りの構造による正式な機会のための伝統的な袴',
        slug: 'hakama',
        image: '/images/categories/hakama.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Haori',
        nameEn: 'Haori',
        nameJa: '羽織',
        description: 'Áo khoác Haori elegant với lớp lót silk và chi tiết thêu tinh xảo',
        descriptionEn: 'Elegant haori jackets with silk lining and exquisite embroidered details',
        descriptionJa: 'シルクの裏地と精巧な刺繍の詳細を備えたエレガントな羽織ジャケット',
        slug: 'haori',
        image: '/images/categories/haori.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Obi & Đai',
        nameEn: 'Obi & Belts',
        nameJa: '帯・ベルト',
        description: 'Bộ sưu tập obi và đai thắt lưng truyền thống với nghệ thuật dệt thổ cẩm',
        descriptionEn: 'Traditional obi and belt collection with brocade weaving artistry',
        descriptionJa: '錦織りの芸術性を備えた伝統的な帯とベルトのコレクション',
        slug: 'obi-belts',
        image: '/images/categories/obi.jpg',
        isActive: true,
        productCount: 0
      },
      {
        name: 'Phụ kiện',
        nameEn: 'Accessories',
        nameJa: 'アクセサリー',
        description: 'Phụ kiện thời trang Nhật Bản tinh tế - từ túi xách, giày dép đến trang sức truyền thống',
        descriptionEn: 'Exquisite Japanese fashion accessories - from bags, footwear to traditional jewelry',
        descriptionJa: 'バッグ、履物から伝統的なジュエリーまで、精巧な日本のファッションアクセサリー',
        slug: 'accessories',
        image: '/images/categories/accessories.jpg',
        isActive: true,
        productCount: 0
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('✅ Created categories');

    // Create enhanced products with full multilingual support and accurate colors
    const products = [
      // ===== KIMONO =====
      {
        name: 'Kimono Truyền Thống',
        nameEn: 'Traditional Kimono',
        nameJa: '伝統的な着物',
        description: 'Kimono truyền thống Nhật Bản với họa tiết hoa anh đào và nghệ thuật thêu tay tinh xảo',
        descriptionEn: 'Traditional Japanese kimono with cherry blossom patterns and exquisite hand embroidery',
        descriptionJa: '桜の模様と精巧な手刺繍を持つ伝統的な日本の着物',
        price: 1200000,
        salePrice: 1000000,
        originalPrice: 1500000,
        categoryId: createdCategories[0]._id, // Kimono
        images: [
          '/images/products/kimono-traditional-1.jpg',
          '/images/products/kimono-traditional-2.jpg',
          '/images/products/kimono-traditional-3.jpg'
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đỏ', 'Xanh dương', 'Đen'],
        stock: 10,
        isActive: true,
        isFeatured: true,
        onSale: true,
        isNew: true, // New product
        isLimitedEdition: false,
        isBestSeller: false,
        tags: ['kimono', 'truyền thống', 'hoa anh đào', 'thêu tay']
      },
      {
        name: 'Kimono Furisode',
        nameEn: 'Furisode Kimono',
        nameJa: '振袖着物',
        description: 'Kimono Furisode dành cho nữ trẻ với họa tiết hoa cúc và thiết kế thanh lịch',
        descriptionEn: 'Furisode kimono for young women with chrysanthemum patterns and elegant design',
        descriptionJa: '菊の模様とエレガントなデザインの若い女性用の振袖着物',
        price: 1800000,
        salePrice: 1500000,
        originalPrice: 2200000,
        categoryId: createdCategories[0]._id, // Kimono
        images: [
          '/images/products/kimono-furisode-1.jpg',
          '/images/products/kimono-furisode-2.jpg'
        ],
        sizes: ['S', 'M', 'L'],
        colors: ['Hồng', 'Tím', 'Vàng'],
        stock: 5,
        isActive: true,
        isFeatured: true,
        onSale: true,
        isNew: false,
        isLimitedEdition: true, // Limited edition
        isBestSeller: false,
        tags: ['furisode', 'kimono', 'nữ trẻ', 'hoa cúc', 'limited']
      },
      
      // ===== YUKATA =====
      {
        name: 'Yukata Mùa Hè',
        nameEn: 'Summer Yukata',
        nameJa: '夏の浴衣',
        description: 'Yukata mùa hè với họa tiết hoa cúc và chất liệu cotton thoáng mát',
        descriptionEn: 'Summer yukata with chrysanthemum patterns and breathable cotton material',
        descriptionJa: '菊の模様と通気性の良いコットン素材の夏の浴衣',
        price: 445000,
        salePrice: 350000,
        originalPrice: 550000,
        categoryId: createdCategories[1]._id, // Yukata
        images: [
          '/images/products/yukata-summer-1.jpg',  
          '/images/products/yukata-summer-2.jpg'
        ],
        sizes: ['S', 'M', 'L'],
        colors: ['Xanh lá', 'Hồng', 'Trắng'],
        stock: 15,
        isActive: true,
        isFeatured: true,
        onSale: true,
        isNew: false,
        isLimitedEdition: false,
        isBestSeller: true, // Best seller
        tags: ['yukata', 'mùa hè', 'hoa cúc', 'cotton', 'bestseller']
      },
      {
        name: 'Yukata Nam',
        nameEn: 'Men Yukata',
        nameJa: '男性用浴衣',
        description: 'Yukata dành cho nam giới với họa tiết rồng truyền thống và thiết kế đơn giản',
        descriptionEn: 'Yukata for men with traditional dragon patterns and simple design',
        descriptionJa: '伝統的な龍の模様とシンプルなデザインの男性用浴衣',
        price: 380000,
        salePrice: 300000,
        originalPrice: 480000,
        categoryId: createdCategories[1]._id, // Yukata
        images: [
          '/images/products/yukata-men-1.jpg',
          '/images/products/yukata-men-2.jpg'
        ],
        sizes: ['M', 'L', 'XL'],
        colors: ['Xanh dương', 'Đen', 'Xám'],
        stock: 18,
        isActive: true,
        isFeatured: false,
        onSale: true,
        isNew: false,
        isLimitedEdition: false,
        isBestSeller: false,
        tags: ['yukata', 'nam', 'rồng', 'truyền thống']
      },
      
      // ===== TOPS =====
      {
        name: 'Áo Haori',
        nameEn: 'Haori Jacket',
        nameJa: '羽織',
        description: 'Áo khoác Haori truyền thống Nhật Bản với lớp lót silk và chi tiết thêu tinh xảo',
        descriptionEn: 'Traditional Japanese haori jacket with silk lining and exquisite embroidered details',
        descriptionJa: 'シルクの裏地と精巧な刺繍の詳細を備えた伝統的な日本の羽織',
        price: 280000,
        salePrice: 220000,
        originalPrice: 350000,
        categoryId: createdCategories[2]._id, // Tops
        images: [
          '/images/products/haori-1.jpg',
          '/images/products/haori-2.jpg'
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đen', 'Xanh đen', 'Nâu'],
        stock: 10,
        isActive: true,
        isFeatured: false,
        onSale: true,
        isNew: false,
        isLimitedEdition: false,
        isBestSeller: false,
        tags: ['haori', 'áo khoác', 'truyền thống', 'silk']
      },
      
      // ===== BOTTOMS =====
      {
        name: 'Quần Hakama',
        nameEn: 'Hakama Pants',
        nameJa: '袴パンツ',
        description: 'Quần Hakama truyền thống cho nam với chất liệu silk cao cấp và may thủ công',
        descriptionEn: 'Traditional hakama pants for men with premium silk materials and handcrafted construction',
        descriptionJa: 'プレミアムシルク素材と手作りの構造による男性用の伝統的な袴パンツ',
        price: 800000,
        salePrice: 650000,
        originalPrice: 1000000,
        categoryId: createdCategories[3]._id, // Bottoms
        images: [
          '/images/products/hakama-1.jpg',
          '/images/products/hakama-2.jpg'
        ],
        sizes: ['M', 'L', 'XL'],
        colors: ['Đen', 'Xanh đen'],
        stock: 8,
        isActive: true,
        isFeatured: true,
        onSale: true,
        isNew: false,
        isLimitedEdition: true, // Limited edition
        isBestSeller: false,
        tags: ['hakama', 'nam', 'truyền thống', 'silk', 'limited']
      },
      
      // ===== ACCESSORIES =====
      {
        name: 'Dép Geta',
        nameEn: 'Geta Sandals',
        nameJa: '下駄',
        description: 'Dép Geta truyền thống Nhật Bản với chất liệu gỗ tự nhiên và thiết kế cổ điển',
        descriptionEn: 'Traditional Japanese geta sandals with natural wood material and classic design',
        descriptionJa: '自然な木の素材とクラシックなデザインの伝統的な日本の下駄',
        price: 50000,
        salePrice: 40000,
        originalPrice: 75000,
        categoryId: createdCategories[7]._id, // Accessories
        images: [
          '/images/products/geta-1.jpg',
          '/images/products/geta-2.jpg'
        ],
        sizes: ['36', '37', '38', '39', '40', '41', '42'],
        colors: ['Nâu', 'Đen'],
        stock: 25,
        isActive: true,
        isFeatured: false,
        onSale: true,
        isNew: false,
        isLimitedEdition: false,
        isBestSeller: false,
        tags: ['geta', 'dép', 'truyền thống', 'gỗ']
      },
      {
        name: 'Thắt Lưng Obi',
        nameEn: 'Obi Belt',
        nameJa: '帯',
        description: 'Thắt lưng Obi cho kimono với nghệ thuật dệt thổ cẩm và chất liệu silk cao cấp',
        descriptionEn: 'Obi belt for kimono with brocade weaving artistry and premium silk material',
        descriptionJa: '錦織りの芸術性とプレミアムシルク素材の着物用の帯',
        price: 100000,
        salePrice: 80000,
        originalPrice: 150000,
        categoryId: createdCategories[7]._id, // Accessories
        images: [
          '/images/products/obi-1.jpg',
          '/images/products/obi-2.jpg'
        ],
        sizes: ['One Size'],
        colors: ['Đỏ', 'Vàng', 'Xanh dương'],
        stock: 20,
        isActive: true,
        isFeatured: false,
        onSale: true,
        isNew: false,
        isLimitedEdition: false,
        isBestSeller: true, // Best seller
        tags: ['obi', 'thắt lưng', 'kimono', 'thổ cẩm', 'bestseller']
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('✅ Created products');

    // Create inventory data for each product
    const inventoryData = [];
    const stockMovements = [];
    
    for (let i = 0; i < createdProducts.length; i++) {
      const product = createdProducts[i] as unknown as unknown as IProduct;
      
      // Create inventory for each color and size combination
      for (const color of product.colors) {
        for (const size of product.sizes) {
          const sku = `${product.name.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}-${color.substring(0, 3).toUpperCase()}-${size}`;
          const currentStock = Math.floor(Math.random() * 50) + 10; // Random stock between 10-60
          const minStock = Math.floor(currentStock * 0.2); // 20% of current stock
          const maxStock = Math.floor(currentStock * 2); // 200% of current stock
          const reservedStock = Math.floor(Math.random() * 5); // Random reserved between 0-5
          
          const inventoryItem = {
            productId: product._id,
            productName: product.name,
            productNameEn: product.nameEn,
            productNameJa: product.nameJa,
            sku: sku,
            currentStock: currentStock,
            minStock: minStock,
            maxStock: maxStock,
            reservedStock: reservedStock,
            availableStock: currentStock - reservedStock,
            costPrice: Math.floor(product.price * 0.6), // 60% of selling price
            sellingPrice: product.salePrice || product.price,
            location: `A-${String(Math.floor(i / 3) + 1).padStart(2, '0')}-${String((i % 3) + 1).padStart(2, '0')}`,
            supplier: ['Kimono Supplier Co.', 'Yukata Supplier Ltd.', 'Belt Supplier Inc.', 'Accessories Co.'][i % 4],
            lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
            lastSold: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last 7 days
            status: currentStock === 0 ? 'out_of_stock' : currentStock <= minStock ? 'low_stock' : 'in_stock',
            category: (product.categoryId as mongoose.Types.ObjectId).toString(),
            size: size,
            color: color,
            notes: `Inventory for ${product.name} - ${color} - ${size}`,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          inventoryData.push(inventoryItem);
          
          // Create initial stock movement for restocking
          const restockQuantity = Math.floor(currentStock * 1.5); // Initial restock was 150% of current
          stockMovements.push({
            productId: product._id,
            inventoryId: null as unknown as mongoose.Types.ObjectId, // Will be set after inventory is created
            type: 'in',
            quantity: restockQuantity,
            reason: 'Initial stock setup',
            reference: 'INIT-2024-001',
            userId: adminUser._id,
            userName: 'Admin Koshiro',
            location: inventoryItem.location,
            notes: 'Initial inventory setup',
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          });
        }
      }
    }

    const createdInventory = await Inventory.insertMany(inventoryData);
    console.log('✅ Created inventory items');

    // Update stock movements with inventory IDs
    for (let i = 0; i < stockMovements.length; i++) {
      stockMovements[i].inventoryId = createdInventory[i]._id as mongoose.Types.ObjectId;
    }

    await StockMovement.insertMany(stockMovements);
    console.log('✅ Created stock movements');

    // Create sample orders
    const orders = [
      {
        orderNumber: 'ORD-2024-001',
        userId: createdUsers[0]._id,
        status: 'completed',
        items: [
          {
            productId: (createdProducts[0] as unknown as unknown as IProduct)._id,
            name: (createdProducts[0] as unknown as unknown as IProduct).name,
            nameVi: (createdProducts[0] as unknown as unknown as IProduct).name,
            quantity: 1,
            price: (createdProducts[0] as unknown as unknown as IProduct).salePrice || (createdProducts[0] as unknown as unknown as IProduct).price,
            size: 'M',
            color: 'Đỏ'
          }
        ],
        totalAmount: (createdProducts[0] as unknown as IProduct).salePrice || (createdProducts[0] as unknown as IProduct).price,
        shippingAddress: {
          name: 'Nguyễn Văn A',
          phone: '0123456789',
          address: '456 Le Loi Street',
          city: 'Ho Chi Minh City',
          district: 'District 1',
          zipCode: '700000',
          country: 'Vietnam'
        },
        paymentMethod: 'COD',
        paymentStatus: 'paid',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        orderNumber: 'ORD-2024-002',
        userId: createdUsers[1]._id,
        status: 'processing',
        items: [
          {
            productId: (createdProducts[1] as unknown as IProduct)._id,
            name: (createdProducts[1] as unknown as IProduct).name,
            nameVi: (createdProducts[1] as unknown as IProduct).name,
            quantity: 1,
            price: (createdProducts[1] as unknown as IProduct).salePrice || (createdProducts[1] as unknown as IProduct).price,
            size: 'L',
            color: 'Xanh lá'
          }
        ],
        totalAmount: (createdProducts[1] as unknown as IProduct).salePrice || (createdProducts[1] as unknown as IProduct).price,
        shippingAddress: {
          name: 'John Smith',
          phone: '+1-555-0123',
          address: '789 Broadway',
          city: 'New York',
          district: 'Manhattan',
          zipCode: '10001',
          country: 'USA'
        },
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'pending',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18')
      },
      {
        orderNumber: 'ORD-2024-003',
        userId: createdUsers[2]._id,
        status: 'pending',
        items: [
          {
            productId: (createdProducts[2] as unknown as IProduct)._id,
            name: (createdProducts[2] as unknown as IProduct).name,
            nameVi: (createdProducts[2] as unknown as IProduct).name,
            quantity: 1,
            price: (createdProducts[2] as unknown as IProduct).salePrice || (createdProducts[2] as unknown as IProduct).price,
            size: 'M',
            color: 'Đen'
          }
        ],
        totalAmount: (createdProducts[2] as unknown as IProduct).salePrice || (createdProducts[2] as unknown as IProduct).price,
        shippingAddress: {
          name: 'Tanaka Hiroshi',
          phone: '+81-3-9876-5432',
          address: '321 Sakura Street',
          city: 'Osaka',
          district: 'Chuo Ward',
          zipCode: '540-0001',
          country: 'Japan'
        },
        paymentMethod: 'Credit Card',
        paymentStatus: 'pending',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      }
    ];

    await Order.insertMany(orders);
    console.log('✅ Created sample orders');

    // Create promotions data
    const promotions = [
      {
        code: 'WELCOME10',
        name: 'Chào mừng khách hàng mới',
        nameEn: 'Welcome New Customer',
        nameJa: '新規顧客歓迎',
        description: 'Giảm 10% cho đơn hàng đầu tiên',
        descriptionEn: '10% off on first order',
        descriptionJa: '初回注文10%オフ',
        type: 'percentage',
        value: 10,
        minOrderAmount: 500000,
        maxDiscountAmount: 100000,
        usageLimit: 1000,
        usedCount: 245,
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        applicableProducts: [],
        applicableCategories: [],
        applicableUsers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'FREESHIP',
        name: 'Miễn phí vận chuyển',
        nameEn: 'Free Shipping',
        nameJa: '送料無料',
        description: 'Miễn phí vận chuyển cho đơn hàng từ 1 triệu',
        descriptionEn: 'Free shipping for orders over 1M VND',
        descriptionJa: '100万円以上の注文で送料無料',
        type: 'free_shipping',
        value: 0,
        minOrderAmount: 1000000,
        usageLimit: 500,
        usedCount: 89,
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        applicableProducts: [],
        applicableCategories: [],
        applicableUsers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SAVE50K',
        name: 'Tiết kiệm 50k',
        nameEn: 'Save 50k',
        nameJa: '5万円節約',
        description: 'Giảm 50,000 VND cho đơn hàng từ 500k',
        descriptionEn: '50,000 VND off for orders over 500k',
        descriptionJa: '50万円以上の注文で5万円オフ',
        type: 'fixed',
        value: 50000,
        minOrderAmount: 500000,
        usageLimit: 200,
        usedCount: 156,
        isActive: false,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        applicableProducts: [],
        applicableCategories: [],
        applicableUsers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'KIMONO20',
        name: 'Giảm giá Kimono',
        nameEn: 'Kimono Discount',
        nameJa: '着物割引',
        description: 'Giảm 20% cho tất cả sản phẩm Kimono',
        descriptionEn: '20% off on all Kimono products',
        descriptionJa: 'すべての着物商品20%オフ',
        type: 'percentage',
        value: 20,
        minOrderAmount: 0,
        maxDiscountAmount: 200000,
        usageLimit: 100,
        usedCount: 45,
        isActive: true,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-03-31'),
        applicableProducts: [],
        applicableCategories: [createdCategories[0]._id], // Kimono category
        applicableUsers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'VIP15',
        name: 'Khách hàng VIP',
        nameEn: 'VIP Customer',
        nameJa: 'VIP顧客',
        description: 'Giảm 15% cho khách hàng VIP',
        descriptionEn: '15% off for VIP customers',
        descriptionJa: 'VIP顧客15%オフ',
        type: 'percentage',
        value: 15,
        minOrderAmount: 2000000,
        maxDiscountAmount: 300000,
        usageLimit: 50,
        usedCount: 12,
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        applicableProducts: [],
        applicableCategories: [],
        applicableUsers: [adminUser._id], // Admin user as VIP
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await Promotion.insertMany(promotions);
    console.log('✅ Created promotions');

    // Create FlashSale data
    const flashSales = [
      {
        name: 'Flash Sale Kimono - Giảm 50%',
        nameEn: 'Flash Sale Kimono - 50% Off',
        nameJa: 'フラッシュセール着物 - 50%オフ',
        description: 'Cơ hội duy nhất để sở hữu kimono cao cấp với giá ưu đãi',
        descriptionEn: 'One-time opportunity to own premium kimono at discounted price',
        descriptionJa: 'プレミアム着物を割引価格で手に入れる一度きりの機会',
        discountType: 'percentage',
        discountValue: 50,
        startTime: new Date('2024-12-01T00:00:00Z'),
        endTime: new Date('2024-12-01T23:59:59Z'),
        isActive: true,
        maxQuantity: 10,
        soldQuantity: 3,
        applicableProducts: [(createdProducts[0] as unknown as IProduct)._id, (createdProducts[1] as unknown as IProduct)._id], // Kimono products
        applicableCategories: [createdCategories[0]._id], // Kimono category
        minOrderAmount: 0,
        maxDiscountAmount: 500000,
        usageLimit: 100,
        usedCount: 3,
        image: '/images/flash-sales/kimono-flash-sale.jpg',
        bannerColor: '#FF6B6B',
        textColor: '#FFFFFF',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Flash Sale Yukata - Chỉ 299k',
        nameEn: 'Flash Sale Yukata - Only 299k',
        nameJa: 'フラッシュセール浴衣 - 299kのみ',
        description: 'Yukata mùa hè với giá siêu ưu đãi - chỉ còn 299k',
        descriptionEn: 'Summer yukata at super discounted price - only 299k',
        descriptionJa: '夏の浴衣が超割引価格 - 299kのみ',
        discountType: 'fixed',
        discountValue: 299000,
        startTime: new Date('2024-12-02T00:00:00Z'),
        endTime: new Date('2024-12-02T23:59:59Z'),
        isActive: true,
        maxQuantity: 20,
        soldQuantity: 8,
        applicableProducts: [(createdProducts[2] as unknown as IProduct)._id, (createdProducts[3] as unknown as IProduct)._id], // Yukata products
        applicableCategories: [createdCategories[1]._id], // Yukata category
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        usageLimit: 50,
        usedCount: 8,
        image: '/images/flash-sales/yukata-flash-sale.jpg',
        bannerColor: '#4ECDC4',
        textColor: '#FFFFFF',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Flash Sale Phụ Kiện - Giảm 70%',
        nameEn: 'Flash Sale Accessories - 70% Off',
        nameJa: 'フラッシュセールアクセサリー - 70%オフ',
        description: 'Tất cả phụ kiện truyền thống Nhật Bản giảm giá 70%',
        descriptionEn: 'All traditional Japanese accessories 70% off',
        descriptionJa: 'すべての伝統的な日本のアクセサリー70%オフ',
        discountType: 'percentage',
        discountValue: 70,
        startTime: new Date('2024-12-03T00:00:00Z'),
        endTime: new Date('2024-12-03T23:59:59Z'),
        isActive: true,
        maxQuantity: 50,
        soldQuantity: 15,
        applicableProducts: [(createdProducts[6] as unknown as IProduct)._id, (createdProducts[7] as unknown as IProduct)._id], // Accessories
        applicableCategories: [createdCategories[7]._id], // Accessories category
        minOrderAmount: 0,
        maxDiscountAmount: 100000,
        usageLimit: 200,
        usedCount: 15,
        image: '/images/flash-sales/accessories-flash-sale.jpg',
        bannerColor: '#45B7D1',
        textColor: '#FFFFFF',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await FlashSale.insertMany(flashSales);
    console.log('✅ Created flash sales');

    // Create Shipping data
    const shippingMethods = [
      {
        name: 'Giao hàng tiêu chuẩn',
        nameEn: 'Standard Shipping',
        nameJa: '標準配送',
        description: 'Giao hàng trong 3-5 ngày làm việc',
        descriptionEn: 'Delivery within 3-5 business days',
        descriptionJa: '3-5営業日以内の配送',
        type: 'standard',
        cost: 30000,
        freeShippingThreshold: 500000,
        estimatedDays: 4,
        isActive: true,
        supportedRegions: ['Vietnam', 'Japan', 'USA'],
        weightLimit: 5000, // 5kg
        dimensions: {
          maxLength: 100,
          maxWidth: 80,
          maxHeight: 60
        },
        trackingAvailable: true,
        insuranceIncluded: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Giao hàng nhanh',
        nameEn: 'Express Shipping',
        nameJa: '速達配送',
        description: 'Giao hàng trong 1-2 ngày làm việc',
        descriptionEn: 'Delivery within 1-2 business days',
        descriptionJa: '1-2営業日以内の配送',
        type: 'express',
        cost: 80000,
        freeShippingThreshold: 1000000,
        estimatedDays: 2,
        isActive: true,
        supportedRegions: ['Vietnam', 'Japan'],
        weightLimit: 3000, // 3kg
        dimensions: {
          maxLength: 80,
          maxWidth: 60,
          maxHeight: 40
        },
        trackingAvailable: true,
        insuranceIncluded: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Giao hàng quốc tế',
        nameEn: 'International Shipping',
        nameJa: '国際配送',
        description: 'Giao hàng quốc tế trong 7-14 ngày',
        descriptionEn: 'International delivery within 7-14 days',
        descriptionJa: '7-14日以内の国際配送',
        type: 'overnight',
        cost: 200000,
        freeShippingThreshold: 2000000,
        estimatedDays: 10,
        isActive: true,
        supportedRegions: ['USA', 'Canada', 'Australia', 'Singapore'],
        weightLimit: 10000, // 10kg
        dimensions: {
          maxLength: 120,
          maxWidth: 100,
          maxHeight: 80
        },
        trackingAvailable: true,
        insuranceIncluded: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Giao hàng miễn phí',
        nameEn: 'Free Shipping',
        nameJa: '送料無料',
        description: 'Miễn phí vận chuyển cho đơn hàng từ 1 triệu',
        descriptionEn: 'Free shipping for orders over 1M VND',
        descriptionJa: '100万円以上の注文で送料無料',
        type: 'pickup',
        cost: 0,
        freeShippingThreshold: 1000000,
        estimatedDays: 1,
        isActive: true,
        supportedRegions: ['Vietnam'],
        weightLimit: 5000,
        dimensions: {
          maxLength: 100,
          maxWidth: 80,
          maxHeight: 60
        },
        trackingAvailable: true,
        insuranceIncluded: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await ShippingMethod.insertMany(shippingMethods);
    console.log('✅ Created shipping methods');

    // Create Payment data
    const paymentMethods = [
      {
        name: 'Thanh toán khi nhận hàng',
        nameEn: 'Cash on Delivery',
        nameJa: '代金引換',
        description: 'Thanh toán bằng tiền mặt khi nhận hàng',
        descriptionEn: 'Pay with cash when receiving the order',
        descriptionJa: '注文受取時に現金で支払い',
        type: 'cod',
        provider: 'Koshiro Fashion',
        isActive: true,
        processingFee: 0,
        minAmount: 0,
        maxAmount: 5000000,
        supportedCurrencies: ['VND'],
        icon: '/images/payment-icons/cod.png'
      },
      {
        name: 'Chuyển khoản ngân hàng',
        nameEn: 'Bank Transfer',
        nameJa: '銀行振込',
        description: 'Chuyển khoản qua ngân hàng',
        descriptionEn: 'Transfer via bank',
        descriptionJa: '銀行振込',
        type: 'bank_transfer',
        provider: 'Vietcombank',
        isActive: true,
        processingFee: 0,
        minAmount: 0,
        maxAmount: 50000000,
        supportedCurrencies: ['VND', 'JPY', 'USD'],
        icon: '/images/payment-icons/bank-transfer.png'
      },
      {
        name: 'Thẻ tín dụng',
        nameEn: 'Credit Card',
        nameJa: 'クレジットカード',
        description: 'Thanh toán bằng thẻ tín dụng Visa, Mastercard',
        descriptionEn: 'Pay with Visa, Mastercard credit card',
        descriptionJa: 'Visa、Mastercardクレジットカードで支払い',
        type: 'credit_card',
        provider: 'VNPay',
        isActive: true,
        processingFee: 3000,
        minAmount: 10000,
        maxAmount: 10000000,
        supportedCurrencies: ['VND', 'JPY', 'USD'],
        icon: '/images/payment-icons/credit-card.png'
      },
      {
        name: 'Ví điện tử',
        nameEn: 'E-Wallet',
        nameJa: '電子財布',
        description: 'Thanh toán qua ví điện tử MoMo, ZaloPay',
        descriptionEn: 'Pay via MoMo, ZaloPay e-wallet',
        descriptionJa: 'MoMo、ZaloPay電子財布で支払い',
        type: 'e_wallet',
        provider: 'MoMo',
        isActive: true,
        processingFee: 0,
        minAmount: 1000,
        maxAmount: 5000000,
        supportedCurrencies: ['VND'],
        icon: '/images/payment-icons/e-wallet.png'
      },
      {
        name: 'PayPal',
        nameEn: 'PayPal',
        nameJa: 'PayPal',
        description: 'Thanh toán qua PayPal',
        descriptionEn: 'Pay via PayPal',
        descriptionJa: 'PayPalで支払い',
        type: 'crypto',
        provider: 'PayPal',
        isActive: true,
        processingFee: 5000,
        minAmount: 10000,
        maxAmount: 20000000,
        supportedCurrencies: ['USD', 'JPY'],
        icon: '/images/payment-icons/paypal.png'
      }
    ];

    await AdminPaymentMethod.insertMany(paymentMethods);
    console.log('✅ Created payment methods');

    // Create sample reviews for products
    const reviews = [];
    const reviewTemplates = [
      {
        rating: 5,
        title: 'Sản phẩm tuyệt vời!',
        titleEn: 'Excellent product!',
        titleJa: '素晴らしい製品！',
        comment: 'Tôi rất hài lòng với chất lượng sản phẩm. Chất liệu tốt và thiết kế đẹp. Đáng giá mỗi đồng!',
        commentEn: 'I am very satisfied with the product quality. Good material and beautiful design. Worth every penny!',
        commentJa: '製品の品質に非常に満足しています。良い素材と美しいデザイン。一銭一銭の価値があります！',
        verified: true
      },
      {
        rating: 5,
        title: 'Rất đẹp và chất lượng cao',
        titleEn: 'Very beautiful and high quality',
        titleJa: '非常に美しく高品質',
        comment: 'Sản phẩm vượt quá mong đợi của tôi. Chất lượng silk rất tốt và họa tiết rất tinh xảo. Rất hài lòng!',
        commentEn: 'Product exceeded my expectations. Silk quality is excellent and patterns are very delicate. Very satisfied!',
        commentJa: '製品は私の期待を超えました。シルクの品質は優れており、パターンは非常に繊細です。非常に満足しています！',
        verified: true
      },
      {
        rating: 4,
        title: 'Tốt nhưng có thể cải thiện',
        titleEn: 'Good but could be improved',
        titleJa: '良いが改善できる',
        comment: 'Sản phẩm đẹp nhưng tôi nghĩ có thể cải thiện thêm về kích thước. Nhìn chung là tốt.',
        commentEn: 'Product is beautiful but I think sizing could be improved further. Overall good.',
        commentJa: '製品は美しいですが、サイズはさらに改善できると思います。全体的に良いです。',
        verified: true
      },
      {
        rating: 5,
        title: 'Hoàn hảo cho dịp đặc biệt',
        titleEn: 'Perfect for special occasions',
        titleJa: '特別な機会に最適',
        comment: 'Tôi đã mặc nó cho đám cưới và nhận được rất nhiều lời khen. Sản phẩm rất đẹp và sang trọng.',
        commentEn: 'I wore it to a wedding and received many compliments. Product is very beautiful and luxurious.',
        commentJa: '結婚式に着用し、多くの賛辞を受けました。製品は非常に美しく豪華です。',
        verified: true
      },
      {
        rating: 4,
        title: 'Chất lượng tốt',
        titleEn: 'Good quality',
        titleJa: '良い品質',
        comment: 'Chất lượng sản phẩm tốt, phù hợp với giá tiền. Giao hàng nhanh và đóng gói cẩn thận.',
        commentEn: 'Product quality is good, worth the price. Fast delivery and careful packaging.',
        commentJa: '製品の品質は良好で、価格に見合う価値があります。迅速な配送と丁寧な梱包。',
        verified: false
      },
      {
        rating: 3,
        title: 'Ổn nhưng không xuất sắc',
        titleEn: 'Okay but not outstanding',
        titleJa: 'まあまあだが、際立っていない',
        comment: 'Sản phẩm ổn nhưng tôi cảm thấy có thể tốt hơn. Họa tiết hơi đơn giản so với giá tiền.',
        commentEn: 'Product is okay but I feel it could be better. Patterns are a bit simple for the price.',
        commentJa: '製品は問題ありませんが、もっと良くなると思います。価格の割にパターンが少しシンプルです。',
        verified: false
      }
    ];

    // Create 2-4 reviews for each product
    for (let i = 0; i < createdProducts.length; i++) {
      const product = createdProducts[i] as unknown as IProduct;
      const numReviews = Math.floor(Math.random() * 3) + 2; // 2-4 reviews per product
      
      for (let j = 0; j < numReviews; j++) {
        const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
        const userIndex = Math.floor(Math.random() * createdUsers.length);
        const user = createdUsers[userIndex];
        
        // Determine language for review based on user preference
        let title = template.title;
        let comment = template.comment;
        if (user.preferences?.language === 'en') {
          title = template.titleEn;
          comment = template.commentEn;
        } else if (user.preferences?.language === 'ja') {
          title = template.titleJa;
          comment = template.commentJa;
        }
        
        reviews.push({
          userId: user._id,
          productId: product._id,
          rating: template.rating,
          title: title,
          comment: comment,
          verified: template.verified,
          helpful: Math.floor(Math.random() * 20), // Random helpful count 0-19
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // Random date within last 60 days
        });
      }
    }

    await Review.insertMany(reviews);
    console.log(`✅ Created ${reviews.length} reviews`);

    // Update category product counts
    for (const category of createdCategories) {
      const count = await Product.countDocuments({ categoryId: category._id });
      await Category.findByIdAndUpdate(category._id, { productCount: count });
    }
    console.log('📊 Updated category product counts');

    console.log('🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`   - Roles: ${await Role.countDocuments()}`);
    console.log(`   - Permissions: ${await Permission.countDocuments()}`);
    console.log(`   - Categories: ${await Category.countDocuments()}`);
    console.log(`   - Products: ${await Product.countDocuments()}`);
    console.log(`   - Orders: ${await Order.countDocuments()}`);
    console.log(`   - Inventory Items: ${await Inventory.countDocuments()}`);
    console.log(`   - Stock Movements: ${await StockMovement.countDocuments()}`);
    console.log(`   - Promotions: ${await Promotion.countDocuments()}`);
    console.log(`   - Flash Sales: ${await FlashSale.countDocuments()}`);
    console.log(`   - Shipping Methods: ${await ShippingMethod.countDocuments()}`);
    console.log(`   - Payment Methods: ${await AdminPaymentMethod.countDocuments()}`);
    console.log(`   - Reviews: ${await Review.countDocuments()}`);
    console.log('🔑 Admin credentials: admin@koshiro.com / admin123');
    console.log('👥 Customer credentials: customer1@example.com / password123');
    console.log('👑 Role & Permission System: Ready with RBAC');
    console.log('📦 Inventory Management: Ready with stock tracking and movements');
    console.log('🎯 Promotions: Ready with discount codes and campaigns');
    console.log('⚡ Flash Sales: Ready with time-limited offers');
    console.log('🚚 Shipping: Ready with multiple delivery options');
    console.log('💳 Payments: Ready with various payment methods');
    console.log('🏷️  Product Badges: NEW, Limited Edition, Best Seller support');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the seed function
seedData(); 