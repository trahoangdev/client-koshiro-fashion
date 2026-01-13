import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Global translations object
const translations = {
  vi: {
    // Common
    loading: 'Đang tải...',
    error: 'Lỗi',
    success: 'Thành công',
    cancel: 'Hủy',
    save: 'Lưu',
    edit: 'Sửa',
    delete: 'Xóa',
    add: 'Thêm',
    search: 'Tìm kiếm',
    filter: 'Lọc',
    sort: 'Sắp xếp',
    view: 'Xem',
    close: 'Đóng',
    back: 'Quay lại',
    next: 'Tiếp theo',
    previous: 'Trước',
    submit: 'Gửi',
    confirm: 'Xác nhận',
    yes: 'Có',
    no: 'Không',
    ok: 'OK',

    // Notifications
    addedToWishlist: 'Đã thêm vào danh sách yêu thích',
    removedFromWishlist: 'Đã xóa khỏi danh sách yêu thích',
    addedToCart: 'Đã thêm vào giỏ hàng',
    removedFromCart: 'Đã xóa khỏi giỏ hàng',
    orderPlaced: 'Đặt hàng thành công',
    profileUpdated: 'Cập nhật hồ sơ thành công',
    passwordChanged: 'Đổi mật khẩu thành công',
    loginSuccess: 'Đăng nhập thành công',
    logoutSuccess: 'Đăng xuất thành công',
    registrationSuccess: 'Đăng ký thành công',

    // Errors
    errorLoading: 'Lỗi tải dữ liệu',
    errorSaving: 'Lỗi lưu dữ liệu',
    errorDeleting: 'Lỗi xóa dữ liệu',
    errorCreating: 'Lỗi tạo dữ liệu',
    errorUpdating: 'Lỗi cập nhật dữ liệu',
    networkError: 'Lỗi kết nối mạng',
    unauthorized: 'Không có quyền truy cập',
    notFound: 'Không tìm thấy',
    validationError: 'Lỗi xác thực',

    // Cart Operations
    pleaseLoginToAddToCart: 'Vui lòng đăng nhập để thêm vào giỏ hàng',
    pleaseLogin: 'Vui lòng đăng nhập',
    unableToAddToCart: 'Không thể thêm vào giỏ hàng',
    unableToRemoveFromCart: 'Không thể xóa khỏi giỏ hàng',
    quantityMustBeGreaterThanZero: 'Số lượng phải lớn hơn 0',
    quantityUpdated: 'Đã cập nhật số lượng',
    unableToUpdateQuantity: 'Không thể cập nhật số lượng',

    // Form validation
    required: 'Trường này là bắt buộc',
    invalidEmail: 'Email không hợp lệ',
    invalidPhone: 'Số điện thoại không hợp lệ',
    passwordTooShort: 'Mật khẩu quá ngắn',
    passwordMismatch: 'Mật khẩu không khớp',
    invalidFormat: 'Định dạng không hợp lệ',

    // Status
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    shipped: 'Đã gửi hàng',
    delivered: 'Đã giao hàng',
    active: 'Hoạt động',
    inactive: 'Không hoạt động',
    inStock: 'Còn hàng',
    outOfStock: 'Hết hàng',

    // Currency
    currency: 'VND',
    currencySymbol: '₫',

    // Date/Time
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    thisWeek: 'Tuần này',
    thisMonth: 'Tháng này',
    thisYear: 'Năm nay',

    // Navigation
    home: 'Trang chủ',
    products: 'Sản phẩm',
    categories: 'Danh mục',
    cart: 'Giỏ hàng',
    wishlist: 'Danh sách yêu thích',
    profile: 'Hồ sơ',
    orders: 'Đơn hàng',
    admin: 'Quản trị',
    dashboard: 'Bảng điều khiển',
    users: 'Người dùng',
    settings: 'Cài đặt',
    logout: 'Đăng xuất',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    tops: 'Áo',
    bottoms: 'Quần',
    accessories: 'Phụ kiện',
    kimono: 'Kimono',
    yukata: 'Yukata',
    hakama: 'Hakama',
    sale: 'Khuyến mãi',
    account: 'Tài khoản',
    addresses: 'Địa chỉ',
    payment: 'Thanh toán',
    notifications: 'Thông báo',
    guest: 'Khách',
    about: 'Giới thiệu',
    contact: 'Liên hệ',

    // Admin specific
    manageProducts: 'Quản lý sản phẩm',
    manageCategories: 'Quản lý danh mục',
    manageOrders: 'Quản lý đơn hàng',
    manageUsers: 'Quản lý người dùng',
    revenueChart: 'Biểu đồ doanh thu',
    productStats: 'Thống kê sản phẩm',
    recentOrders: 'Đơn hàng gần đây',
    fromLastMonth: 'từ tháng trước',
    revenue: 'Doanh thu',

    // Actions
    viewDetails: 'Xem chi tiết',
    addToCart: 'Thêm vào giỏ hàng',
    addToWishlist: 'Thêm vào yêu thích',
    removeFromCart: 'Xóa khỏi giỏ hàng',
    removeFromWishlist: 'Xóa khỏi yêu thích',
    checkout: 'Thanh toán',
    placeOrder: 'Đặt hàng',
    continueShopping: 'Tiếp tục mua sắm',
    updateQuantity: 'Cập nhật số lượng',
    clearCart: 'Xóa giỏ hàng',
    clearWishlist: 'Xóa danh sách yêu thích',

    // Mobile Menu & Additional
    menu: 'Menu',
    mainMenu: 'Menu Chính',
    quickActions: 'Thao Tác Nhanh',
    helpSupport: 'Trợ Giúp & Hỗ Trợ',
    specialOffers: 'Ưu Đãi Đặc Biệt',
    viewAll: 'Xem tất cả',
    compare: 'So sánh',
    trackOrder: 'Theo Dõi Đơn Hàng',
    reviews: 'Đánh Giá',
    sizeGuide: 'Hướng Dẫn Kích Thước',
    faq: 'Câu Hỏi Thường Gặp',
    shippingInfo: 'Thông Tin Giao Hàng',
    returnPolicy: 'Chính Sách Đổi Trả',
    firstOrderDiscount: 'Giảm Giá Đơn Hàng Đầu',
    firstOrderDescription: 'Giảm 20% cho đơn hàng đầu tiên',
    shopNow: 'Mua Ngay',
    stayUpdated: 'Cập Nhật Tin Tức',
    newsletterDescription: 'Nhận xu hướng thời trang và ưu đãi mới nhất',
    subscribeNewsletter: 'Đăng Ký Bản Tin',
    premiumMember: 'Thành Viên Cao Cấp',
    welcomeKoshiro: 'Chào mừng đến với Koshiro',
    signInAccess: 'Đăng nhập để truy cập tài khoản',
    madeWithLove: 'Được tạo với',
    inJapan: 'tại Nhật Bản',
    authenticJapanese: 'Thời Trang Nhật Bản Chính Hiệu',
    language: 'Ngôn ngữ',
    newArrivals: 'Hàng Mới Về',
    trending: 'Đang Thịnh Hành',
    exclusive: 'Ưu Đãi Độc Quyền',
    flashSale: 'Flash Sale',
    limitedTime: 'Thời Gian Có Hạn',

    // Footer
    description: 'Thời trang Nhật Bản chính hãng cho tâm hồn hiện đại',
    shop: 'Cửa Hàng',
    quickLinks: 'Liên Kết Nhanh',
    customerService: 'Dịch Vụ Khách Hàng',
    shipping: 'Thông Tin Giao Hàng',
    legal: 'Pháp Lý',
    privacy: 'Chính Sách Bảo Mật',
    terms: 'Điều Khoản Dịch Vụ',
    newsletter: 'Bản Tin',
    emailPlaceholder: 'Email của bạn',
    rights: 'Tất cả quyền được bảo lưu.',
    followUs: 'Theo Dõi Chúng Tôi',
    contactUs: 'Liên Hệ',
    phone: 'Điện Thoại',
    email: 'Email',
    address: 'Địa Chỉ',

    // Messages
    noData: 'Không có dữ liệu',
    noResults: 'Không tìm thấy kết quả',
    emptyCart: 'Giỏ hàng trống',
    emptyWishlist: 'Danh sách yêu thích trống',
    noOrders: 'Không có đơn hàng',
    noProducts: 'Không có sản phẩm',
    noUsers: 'Không có người dùng',

    // Confirmation
    confirmDelete: 'Bạn có chắc chắn muốn xóa?',
    confirmClear: 'Bạn có chắc chắn muốn xóa tất cả?',
    confirmLogout: 'Bạn có chắc chắn muốn đăng xuất?',
    confirmCancel: 'Bạn có chắc chắn muốn hủy?',

    // Success messages
    saveSuccess: 'Lưu thành công',
    deleteSuccess: 'Xóa thành công',
    updateSuccess: 'Cập nhật thành công',
    createSuccess: 'Tạo thành công',

    // Info messages
    processingRequest: 'Đang xử lý yêu cầu...',
    pleaseWait: 'Vui lòng chờ...',
    loadingData: 'Đang tải dữ liệu...',
    savingData: 'Đang lưu dữ liệu...',

    // Time
    justNow: 'Vừa xong',
    minutesAgo: 'phút trước',
    hoursAgo: 'giờ trước',
    daysAgo: 'ngày trước',
    weeksAgo: 'tuần trước',
    monthsAgo: 'tháng trước',
    yearsAgo: 'năm trước'
  },
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    view: 'View',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',

    // Notifications
    addedToWishlist: 'Added to wishlist',
    removedFromWishlist: 'Removed from wishlist',
    addedToCart: 'Added to cart',
    removedFromCart: 'Removed from cart',
    orderPlaced: 'Order placed successfully',
    profileUpdated: 'Profile updated successfully',
    passwordChanged: 'Password changed successfully',
    loginSuccess: 'Login successful',
    logoutSuccess: 'Logout successful',
    registrationSuccess: 'Registration successful',

    // Errors
    errorLoading: 'Error loading data',
    errorSaving: 'Error saving data',
    errorDeleting: 'Error deleting data',
    errorCreating: 'Error creating data',
    errorUpdating: 'Error updating data',
    networkError: 'Network error',
    unauthorized: 'Unauthorized',
    notFound: 'Not found',
    validationError: 'Validation error',

    // Cart Operations
    pleaseLoginToAddToCart: 'Please login to add to cart',
    pleaseLogin: 'Please login',
    unableToAddToCart: 'Unable to add to cart',
    unableToRemoveFromCart: 'Unable to remove from cart',
    quantityMustBeGreaterThanZero: 'Quantity must be greater than 0',
    quantityUpdated: 'Quantity updated',
    unableToUpdateQuantity: 'Unable to update quantity',

    // Form validation
    required: 'This field is required',
    invalidEmail: 'Invalid email',
    invalidPhone: 'Invalid phone number',
    passwordTooShort: 'Password too short',
    passwordMismatch: 'Passwords do not match',
    invalidFormat: 'Invalid format',

    // Status
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    shipped: 'Shipped',
    delivered: 'Delivered',
    active: 'Active',
    inactive: 'Inactive',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',

    // Currency
    currency: 'USD',
    currencySymbol: '$',

    // Date/Time
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',

    // Navigation
    home: 'Home',
    products: 'Products',
    categories: 'Categories',
    cart: 'Cart',
    wishlist: 'Wishlist',
    profile: 'Profile',
    orders: 'Orders',
    admin: 'Admin',
    dashboard: 'Dashboard',
    users: 'Users',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    tops: 'Tops',
    bottoms: 'Bottoms',
    accessories: 'Accessories',
    kimono: 'Kimono',
    yukata: 'Yukata',
    hakama: 'Hakama',
    sale: 'Sale',
    account: 'Account',
    addresses: 'Addresses',
    payment: 'Payment',
    notifications: 'Notifications',
    guest: 'Guest',
    about: 'About',
    contact: 'Contact',

    // Admin specific
    manageProducts: 'Manage Products',
    manageCategories: 'Manage Categories',
    manageOrders: 'Manage Orders',
    manageUsers: 'Manage Users',
    revenueChart: 'Revenue Chart',
    productStats: 'Product Stats',
    recentOrders: 'Recent Orders',
    fromLastMonth: 'from last month',
    revenue: 'Revenue',

    // Actions
    viewDetails: 'View Details',
    addToCart: 'Add to Cart',
    addToWishlist: 'Add to Wishlist',
    removeFromCart: 'Remove from Cart',
    removeFromWishlist: 'Remove from Wishlist',
    checkout: 'Checkout',
    placeOrder: 'Place Order',
    continueShopping: 'Continue Shopping',
    updateQuantity: 'Update Quantity',
    clearCart: 'Clear Cart',
    clearWishlist: 'Clear Wishlist',

    // Mobile Menu & Additional
    menu: 'Menu',
    mainMenu: 'Main Menu',
    quickActions: 'Quick Actions',
    helpSupport: 'Help & Support',
    specialOffers: 'Special Offers',
    viewAll: 'View All',
    compare: 'Compare',
    trackOrder: 'Track Order',
    reviews: 'Reviews',
    sizeGuide: 'Size Guide',
    faq: 'FAQ',
    shippingInfo: 'Shipping Info',
    returnPolicy: 'Return Policy',
    firstOrderDiscount: 'First Order Discount',
    firstOrderDescription: 'Get 20% off your first purchase',
    shopNow: 'Shop Now',
    stayUpdated: 'Stay Updated',
    newsletterDescription: 'Get latest fashion trends & deals',
    subscribeNewsletter: 'Subscribe Newsletter',
    premiumMember: 'Premium Member',
    welcomeKoshiro: 'Welcome to Koshiro',
    signInAccess: 'Sign in to access your account',
    madeWithLove: 'Made with',
    inJapan: 'in Japan',
    authenticJapanese: 'Authentic Japanese Fashion',
    language: 'Language',
    newArrivals: 'New Arrivals',
    trending: 'Trending Now',
    exclusive: 'Exclusive Offers',
    flashSale: 'Flash Sale',
    limitedTime: 'Limited Time',

    // Footer
    description: 'Authentic Japanese fashion for the modern soul',
    shop: 'Shop',
    quickLinks: 'Quick Links',
    customerService: 'Customer Service',
    shipping: 'Shipping Info',
    legal: 'Legal',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    newsletter: 'Newsletter',
    emailPlaceholder: 'Your email',
    rights: 'All rights reserved.',
    followUs: 'Follow Us',
    contactUs: 'Contact Us',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',

    // Messages
    noData: 'No data',
    noResults: 'No results found',
    emptyCart: 'Cart is empty',
    emptyWishlist: 'Wishlist is empty',
    noOrders: 'No orders',
    noProducts: 'No products',
    noUsers: 'No users',

    // Confirmation
    confirmDelete: 'Are you sure you want to delete?',
    confirmClear: 'Are you sure you want to clear all?',
    confirmLogout: 'Are you sure you want to logout?',
    confirmCancel: 'Are you sure you want to cancel?',

    // Success messages
    saveSuccess: 'Saved successfully',
    deleteSuccess: 'Deleted successfully',
    updateSuccess: 'Updated successfully',
    createSuccess: 'Created successfully',

    // Info messages
    processingRequest: 'Processing request...',
    pleaseWait: 'Please wait...',
    loadingData: 'Loading data...',
    savingData: 'Saving data...',

    // Time
    justNow: 'Just now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    weeksAgo: 'weeks ago',
    monthsAgo: 'months ago',
    yearsAgo: 'years ago'
  },
  ja: {
    // Common
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    cancel: 'キャンセル',
    save: '保存',
    edit: '編集',
    delete: '削除',
    add: '追加',
    search: '検索',
    filter: 'フィルター',
    sort: '並び替え',
    view: '表示',
    close: '閉じる',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    submit: '送信',
    confirm: '確認',
    yes: 'はい',
    no: 'いいえ',
    ok: 'OK',

    // Notifications
    addedToWishlist: 'お気に入りに追加されました',
    removedFromWishlist: 'お気に入りから削除されました',
    addedToCart: 'カートに追加されました',
    removedFromCart: 'カートから削除されました',
    orderPlaced: '注文が完了しました',
    profileUpdated: 'プロフィールが更新されました',
    passwordChanged: 'パスワードが変更されました',
    loginSuccess: 'ログインしました',
    logoutSuccess: 'ログアウトしました',
    registrationSuccess: '登録が完了しました',

    // Errors
    errorLoading: 'データの読み込みエラー',
    errorSaving: 'データの保存エラー',
    errorDeleting: 'データの削除エラー',
    errorCreating: 'データの作成エラー',
    errorUpdating: 'データの更新エラー',
    networkError: 'ネットワークエラー',
    unauthorized: '認証が必要です',
    notFound: '見つかりません',
    validationError: '検証エラー',

    // Cart Operations
    pleaseLoginToAddToCart: 'カートに追加するにはログインしてください',
    pleaseLogin: 'ログインしてください',
    unableToAddToCart: 'カートに追加できません',
    unableToRemoveFromCart: 'カートから削除できません',
    quantityMustBeGreaterThanZero: '数量は0より大きくなければなりません',
    quantityUpdated: '数量を更新しました',
    unableToUpdateQuantity: '数量を更新できません',

    // Form validation
    required: 'この項目は必須です',
    invalidEmail: '無効なメールアドレス',
    invalidPhone: '無効な電話番号',
    passwordTooShort: 'パスワードが短すぎます',
    passwordMismatch: 'パスワードが一致しません',
    invalidFormat: '無効な形式',

    // Status
    pending: '保留中',
    processing: '処理中',
    completed: '完了',
    cancelled: 'キャンセル',
    shipped: '発送済み',
    delivered: '配達済み',
    active: 'アクティブ',
    inactive: '非アクティブ',
    inStock: '在庫あり',
    outOfStock: '在庫切れ',

    // Currency
    currency: 'JPY',
    currencySymbol: '¥',

    // Date/Time
    today: '今日',
    yesterday: '昨日',
    thisWeek: '今週',
    thisMonth: '今月',
    thisYear: '今年',

    // Navigation
    home: 'ホーム',
    products: '商品',
    categories: 'カテゴリ',
    cart: 'カート',
    wishlist: 'お気に入り',
    profile: 'プロフィール',
    orders: '注文',
    admin: '管理',
    dashboard: 'ダッシュボード',
    users: 'ユーザー',
    settings: '設定',
    logout: 'ログアウト',
    login: 'ログイン',
    register: '登録',
    tops: 'トップス',
    bottoms: 'ボトムス',
    accessories: 'アクセサリー',
    kimono: '着物',
    yukata: '浴衣',
    hakama: '袴',
    sale: 'セール',
    account: 'アカウント',
    addresses: '住所',
    payment: '支払い',
    notifications: '通知',
    guest: 'ゲスト',
    about: '会社概要',
    contact: 'お問い合わせ',

    // Admin specific
    manageProducts: '商品を管理',
    manageCategories: 'カテゴリを管理',
    manageOrders: '注文を管理',
    manageUsers: 'ユーザーを管理',
    revenueChart: '収益チャート',
    productStats: '商品統計',
    recentOrders: '最近の注文',
    fromLastMonth: '先月から',
    revenue: '収益',

    // Actions
    viewDetails: '詳細を見る',
    addToCart: 'カートに追加',
    addToWishlist: 'お気に入りに追加',
    removeFromCart: 'カートから削除',
    removeFromWishlist: 'お気に入りから削除',
    checkout: 'チェックアウト',
    placeOrder: '注文する',
    continueShopping: '買い物を続ける',
    updateQuantity: '数量を更新',
    clearCart: 'カートを空にする',
    clearWishlist: 'お気に入りを空にする',

    // Mobile Menu & Additional
    menu: 'メニュー',
    mainMenu: 'メインメニュー',
    quickActions: 'クイックアクション',
    helpSupport: 'ヘルプとサポート',
    specialOffers: '特別オファー',
    viewAll: 'すべて表示',
    compare: '比較',
    trackOrder: '注文追跡',
    reviews: 'レビュー',
    sizeGuide: 'サイズガイド',
    faq: 'よくある質問',
    shippingInfo: '配送情報',
    returnPolicy: '返品ポリシー',
    firstOrderDiscount: '初回注文割引',
    firstOrderDescription: '初回購入で20%オフ',
    shopNow: '今すぐ購入',
    stayUpdated: '最新情報を取得',
    newsletterDescription: '最新のファッショントレンドとお得な情報を入手',
    subscribeNewsletter: 'ニュースレターを購読',
    premiumMember: 'プレミアムメンバー',
    welcomeKoshiro: 'Koshiroへようこそ',
    signInAccess: 'アカウントにアクセスするにはログインしてください',
    madeWithLove: '愛を込めて作成',
    inJapan: '日本で',
    authenticJapanese: '本格的な日本ファッション',
    language: '言語',
    newArrivals: '新着商品',
    trending: 'トレンド',
    exclusive: '限定オファー',
    flashSale: 'フラッシュセール',
    limitedTime: '期間限定',

    // Footer
    description: '現代の魂のための本格的な日本ファッション',
    shop: 'ショップ',
    quickLinks: 'クイックリンク',
    customerService: 'カスタマーサービス',
    shipping: '配送情報',
    legal: '法的',
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
    newsletter: 'ニュースレター',
    emailPlaceholder: 'あなたのメール',
    rights: '全著作権所有。',
    followUs: 'フォローする',
    contactUs: 'お問い合わせ',
    phone: '電話',
    email: 'メール',
    address: '住所',

    // Messages
    noData: 'データがありません',
    noResults: '結果が見つかりません',
    emptyCart: 'カートは空です',
    emptyWishlist: 'お気に入りは空です',
    noOrders: '注文がありません',
    noProducts: '商品がありません',
    noUsers: 'ユーザーがありません',

    // Confirmation
    confirmDelete: '削除してもよろしいですか？',
    confirmClear: 'すべて削除してもよろしいですか？',
    confirmLogout: 'ログアウトしてもよろしいですか？',
    confirmCancel: 'キャンセルしてもよろしいですか？',

    // Success messages
    saveSuccess: '保存しました',
    deleteSuccess: '削除しました',
    updateSuccess: '更新しました',
    createSuccess: '作成しました',

    // Info messages
    processingRequest: 'リクエストを処理中...',
    pleaseWait: 'お待ちください...',
    loadingData: 'データを読み込み中...',
    savingData: 'データを保存中...',

    // Time
    justNow: '今',
    minutesAgo: '分前',
    hoursAgo: '時間前',
    daysAgo: '日前',
    weeksAgo: '週前',
    monthsAgo: 'ヶ月前',
    yearsAgo: '年前'
  }
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState('vi');

  useEffect(() => {
    const savedLanguage = localStorage.getItem("appLanguage");
    if (savedLanguage && ['vi', 'en', 'ja'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: string) => {
    if (['vi', 'en', 'ja'].includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem("appLanguage", lang);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langTranslations = translations[language as keyof typeof translations] || translations.vi;
    return langTranslations[key as keyof typeof langTranslations] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 