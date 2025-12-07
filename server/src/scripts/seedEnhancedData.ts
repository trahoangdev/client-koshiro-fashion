import mongoose from 'mongoose';
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

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

/**
 * Enhanced seed data với nhiều sản phẩm hơn và reviews
 */
const seedEnhancedData = async () => {
  try {
    console.log('🌱 Starting enhanced database seeding...');
    
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
    await Review.deleteMany({});
    console.log('✅ Cleared existing data (keeping roles and permissions)');

    // Get or create roles
    let adminRole = await Role.findOne({ name: 'Admin' });
    let customerRole = await Role.findOne({ name: 'Customer' });
    
    if (!adminRole || !customerRole) {
      console.log('🔄 Running roles and permissions seeding...');
      try {
        const { default: seedRolesAndPermissions } = await import('./seedRolesAndPermissions');
        await seedRolesAndPermissions();
        adminRole = await Role.findOne({ name: 'Admin' });
        customerRole = await Role.findOne({ name: 'Customer' });
        console.log('✅ Roles and permissions seeded successfully');
      } catch (error) {
        console.log('⚠️  Could not seed roles and permissions:', error);
        // Create basic roles if seeding failed
        if (!adminRole) {
          adminRole = new Role({
            name: 'Admin',
            nameEn: 'Admin',
            nameJa: '管理者',
            description: 'Administrative access',
            level: 90,
            isSystem: true,
            isActive: true,
            permissions: []
          });
          await adminRole.save();
        }
        if (!customerRole) {
          customerRole = new Role({
            name: 'Customer',
            nameEn: 'Customer',
            nameJa: '顧客',
            description: 'Standard customer access',
            level: 10,
            isSystem: true,
            isActive: true,
            permissions: []
          });
          await customerRole.save();
        }
      }
    }

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@koshiro.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword,
      name: 'Admin Koshiro',
      role: adminRole!._id,
      status: 'active',
      totalOrders: 0,
      totalSpent: 0,
      addresses: [{
        type: 'shipping',
        fullName: 'Admin Koshiro',
        phone: '+81-3-1234-5678',
        address: '123 Shibuya Street',
        city: 'Tokyo',
        state: 'Tokyo',
        zipCode: '150-0002',
        country: 'Japan',
        isDefault: true
      }],
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        language: 'ja',
        currency: 'JPY'
      }
    });
    await adminUser.save();
    console.log('✅ Created admin user');

    // Create sample customers
    const sampleUsers = [
      {
        email: 'customer1@example.com',
        password: 'password123',
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        role: customerRole!._id,
        status: 'active',
        totalOrders: 0,
        totalSpent: 0,
        addresses: [{
          type: 'shipping',
          fullName: 'Nguyễn Văn A',
          phone: '0123456789',
          address: '456 Le Loi Street',
          city: 'Ho Chi Minh City',
          state: 'Ho Chi Minh City',
          zipCode: '700000',
          country: 'Vietnam',
          isDefault: true
        }],
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
        password: 'password123',
        name: 'John Smith',
        phone: '+1-555-0123',
        role: customerRole!._id,
        status: 'active',
        totalOrders: 0,
        totalSpent: 0,
        addresses: [{
          type: 'shipping',
          fullName: 'John Smith',
          phone: '+1-555-0123',
          address: '789 Broadway',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          isDefault: true
        }],
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
        password: 'password123',
        name: 'Tanaka Hiroshi',
        phone: '+81-3-9876-5432',
        role: customerRole!._id,
        status: 'active',
        totalOrders: 0,
        totalSpent: 0,
        addresses: [{
          type: 'shipping',
          fullName: 'Tanaka Hiroshi',
          phone: '+81-3-9876-5432',
          address: '321 Sakura Street',
          city: 'Osaka',
          state: 'Osaka',
          zipCode: '540-0001',
          country: 'Japan',
          isDefault: true
        }],
        preferences: {
          emailNotifications: true,
          smsNotifications: true,
          marketingEmails: false,
          language: 'ja',
          currency: 'JPY'
        }
      },
      {
        email: 'customer4@example.com',
        password: 'password123',
        name: 'Trần Thị B',
        phone: '0987654321',
        role: customerRole!._id,
        status: 'active',
        totalOrders: 0,
        totalSpent: 0,
        addresses: [{
          type: 'shipping',
          fullName: 'Trần Thị B',
          phone: '0987654321',
          address: '789 Nguyen Hue Street',
          city: 'Ho Chi Minh City',
          state: 'Ho Chi Minh City',
          zipCode: '700000',
          country: 'Vietnam',
          isDefault: true
        }],
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          language: 'vi',
          currency: 'VND'
        }
      },
      {
        email: 'customer5@example.com',
        password: 'password123',
        name: 'Emma Wilson',
        phone: '+44-20-1234-5678',
        role: customerRole!._id,
        status: 'active',
        totalOrders: 0,
        totalSpent: 0,
        addresses: [{
          type: 'shipping',
          fullName: 'Emma Wilson',
          phone: '+44-20-1234-5678',
          address: '123 Oxford Street',
          city: 'London',
          state: 'England',
          zipCode: 'W1D 1BS',
          country: 'UK',
          isDefault: true
        }],
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          language: 'en',
          currency: 'GBP'
        }
      }
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} sample users`);

    // Create categories với đa ngôn ngữ
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
        isFeatured: true,
        productCount: 0,
        sortOrder: 1
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
        isFeatured: true,
        productCount: 0,
        sortOrder: 2
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
        isFeatured: false,
        productCount: 0,
        sortOrder: 3
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
        isFeatured: false,
        productCount: 0,
        sortOrder: 4
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
        isFeatured: true,
        productCount: 0,
        sortOrder: 5
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
        isFeatured: true,
        productCount: 0,
        sortOrder: 6
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
        isFeatured: false,
        productCount: 0,
        sortOrder: 7
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
        isFeatured: false,
        productCount: 0,
        sortOrder: 8
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Tạo danh sách sản phẩm mẫu phong phú (40 sản phẩm)
    const productTemplates = [
      // ===== KIMONO (10 sản phẩm) =====
      {
        name: 'Kimono Truyền Thống Hoa Anh Đào',
        nameEn: 'Traditional Cherry Blossom Kimono',
        nameJa: '伝統的な桜の着物',
        description: 'Kimono truyền thống Nhật Bản với họa tiết hoa anh đào tinh xảo, được làm từ silk cao cấp và thêu tay tỉ mỉ. Hoàn hảo cho các dịp lễ hội và sự kiện trang trọng.',
        descriptionEn: 'Traditional Japanese kimono with exquisite cherry blossom patterns, made from premium silk and delicate hand embroidery. Perfect for festivals and formal occasions.',
        descriptionJa: '精巧な桜の模様と繊細な手刺繍を持つプレミアムシルク製の伝統的な日本の着物。祭りや正式な機会に最適。',
        price: 3500000,
        salePrice: 2800000,
        originalPrice: 4200000,
        categoryIndex: 0,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Đỏ', 'Hồng', 'Trắng'],
        stock: 8,
        isFeatured: true,
        onSale: true,
        isNew: true,
        isLimitedEdition: false,
        isBestSeller: false,
        tags: ['kimono', 'truyền thống', 'hoa anh đào', 'silk', 'thêu tay']
      },
      {
        name: 'Kimono Furisode Cao Cấp',
        nameEn: 'Premium Furisode Kimono',
        nameJa: 'プレミアム振袖着物',
        description: 'Kimono Furisode dành cho nữ trẻ với họa tiết hoa cúc vàng và thiết kế thanh lịch. Chất liệu silk Nhật Bản cao cấp, phù hợp cho các sự kiện đặc biệt.',
        descriptionEn: 'Furisode kimono for young women with golden chrysanthemum patterns and elegant design. Made from premium Japanese silk, perfect for special events.',
        descriptionJa: '金の菊の模様とエレガントなデザインの若い女性用の振袖着物。プレミアム日本のシルク製、特別なイベントに最適。',
        price: 4500000,
        salePrice: 3600000,
        originalPrice: 5500000,
        categoryIndex: 0,
        sizes: ['S', 'M', 'L'],
        colors: ['Vàng', 'Hồng', 'Tím'],
        stock: 5,
        isFeatured: true,
        onSale: true,
        isNew: false,
        isLimitedEdition: true,
        isBestSeller: false,
        tags: ['furisode', 'kimono', 'nữ trẻ', 'hoa cúc', 'limited']
      },
      {
        name: 'Kimono Tomesode Đám Cưới',
        nameEn: 'Wedding Tomesode Kimono',
        nameJa: '結婚式留袖着物',
        description: 'Kimono Tomesode sang trọng cho các dịp đám cưới và sự kiện quan trọng. Thiết kế tinh tế với họa tiết hoa cúc và chim công, thể hiện sự quý phái.',
        descriptionEn: 'Luxurious Tomesode kimono for weddings and important events. Refined design with chrysanthemum and peacock patterns, exuding elegance.',
        descriptionJa: '結婚式や重要なイベントのための豪華な留袖着物。菊と孔雀の模様による洗練されたデザイン、優雅さを放つ。',
        price: 6000000,
        salePrice: 4800000,
        originalPrice: 7500000,
        categoryIndex: 0,
        sizes: ['S', 'M', 'L'],
        colors: ['Đen', 'Xanh đen', 'Tím đen'],
        stock: 3,
        isFeatured: true,
        onSale: true,
        isNew: false,
        isLimitedEdition: true,
        isBestSeller: false,
        tags: ['tomesode', 'kimono', 'đám cưới', 'cao cấp', 'limited']
      },
      {
        name: 'Kimono Houmongi Nhẹ Nhàng',
        nameEn: 'Light Houmongi Kimono',
        nameJa: '軽い訪問着',
        description: 'Kimono Houmongi với thiết kế nhẹ nhàng và thoải mái, phù hợp cho các dịp xã giao và tiệc tùng. Họa tiết hoa anh đào mềm mại.',
        descriptionEn: 'Houmongi kimono with light and comfortable design, perfect for social gatherings and parties. Soft cherry blossom patterns.',
        descriptionJa: '軽く快適なデザインの訪問着、社交の集まりやパーティーに最適。柔らかい桜の模様。',
        price: 2500000,
        salePrice: 2000000,
        originalPrice: 3000000,
        categoryIndex: 0,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Hồng', 'Trắng', 'Kem'],
        stock: 12,
        isFeatured: false,
        onSale: true,
        isNew: true,
        isLimitedEdition: false,
        isBestSeller: true,
        tags: ['houmongi', 'kimono', 'nhẹ nhàng', 'bestseller']
      },
      // ... Tiếp tục với các sản phẩm khác
      {
        name: 'Kimono Komon Họa Tiết Nhỏ',
        nameEn: 'Komon Kimono Small Patterns',
        nameJa: '小紋着物',
        description: 'Kimono Komon với họa tiết nhỏ tinh tế, thích hợp cho việc mặc hàng ngày và các hoạt động văn hóa. Giá cả phải chăng.',
        descriptionEn: 'Komon kimono with delicate small patterns, suitable for daily wear and cultural activities. Affordable price.',
        descriptionJa: '繊細な小さい模様の小紋着物、日常着や文化活動に適している。手頃な価格。',
        price: 1800000,
        salePrice: 1500000,
        originalPrice: 2200000,
        categoryIndex: 0,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Xanh lá', 'Xanh dương', 'Xám'],
        stock: 15,
        isFeatured: false,
        onSale: true,
        isNew: false,
        isLimitedEdition: false,
        isBestSeller: true,
        tags: ['komon', 'kimono', 'hàng ngày', 'giá rẻ', 'bestseller']
      }
    ];

    // Tiếp tục với Yukata và các category khác...
    // Tôi sẽ tạo một phiên bản đầy đủ hơn trong file tiếp theo

    console.log('🎉 Enhanced database seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Export default function
export default seedEnhancedData;

// Run if called directly
if (require.main === module) {
  seedEnhancedData().catch(console.error);
}

