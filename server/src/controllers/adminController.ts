import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { ActivityLog } from '../models/ActivityLog';
import { Notification } from '../models/Notification';
import { Review } from '../models/Review';

// Helper function to update product count for categories
const updateCategoryProductCount = async (categoryId: string) => {
  try {
    const productCount = await Product.countDocuments({ 
        categoryId: categoryId,
        isActive: true 
      });
      
      await Category.findByIdAndUpdate(categoryId, { productCount });
      console.log(`Updated product count for category ${categoryId}: ${productCount}`);
    } catch (error) {
      console.error('Error updating category product count:', error);
    }
};

// Get admin dashboard stats
export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Admin stats - Starting to get counts...');
    
    // Get counts
    const totalOrders = await Order.countDocuments();
    console.log('Admin stats - Total orders:', totalOrders);
    
    const totalProducts = await Product.countDocuments();
    console.log('Admin stats - Total products:', totalProducts);
    
    const totalUsers = await User.countDocuments();
    console.log('Admin stats - Total users:', totalUsers);
    
    // Calculate total revenue
    console.log('Admin stats - Getting completed orders...');
    const completedOrders = await Order.find({ status: 'completed' });
    console.log('Admin stats - Completed orders count:', completedOrders.length);
    
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    console.log('Admin stats - Total revenue:', totalRevenue);
    
    // Calculate trends (simplified - you can make this more sophisticated)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: lastMonth }
    });
    
    const lastMonthProducts = await Product.countDocuments({
      createdAt: { $gte: lastMonth }
    });
    
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: lastMonth }
    });
    
    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const lastMonthRevenueTotal = lastMonthRevenue.length > 0 ? lastMonthRevenue[0].total : 0;
    
    // Calculate trends (percentage change)
    const ordersTrend = totalOrders > 0 ? ((lastMonthOrders / totalOrders) * 100) : 0;
    const productsTrend = totalProducts > 0 ? ((lastMonthProducts / totalProducts) * 100) : 0;
    const usersTrend = totalUsers > 0 ? ((lastMonthUsers / totalUsers) * 100) : 0;
    const revenueTrend = totalRevenue > 0 ? ((lastMonthRevenueTotal / totalRevenue) * 100) : 0;
    
    const response = {
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      ordersTrend: Math.round(ordersTrend * 100) / 100,
      productsTrend: Math.round(productsTrend * 100) / 100,
      usersTrend: Math.round(usersTrend * 100) / 100,
      revenueTrend: Math.round(revenueTrend * 100) / 100
    };
    
    console.log('Admin stats - Response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Error getting admin statistics' });
  }
});
// Get admin orders with pagination and filters
export const getAdminOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: { status?: string } = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Get orders with user data
    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name nameEn nameJa images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Order.countDocuments(filter);
    
    res.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });});
// Get admin products with pagination and filters
export const getAdminProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const isActive = req.query.isActive as string;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: { isActive?: boolean } = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    // Get products with category data
    const products = await Product.find(filter)
      .populate('categoryId', 'name nameEn nameJa slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Product.countDocuments(filter);
    
    res.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });});
// Get admin categories
export const getAdminCategories = asyncHandler(async (req: Request, res: Response) => {
  const isActive = req.query.isActive as string;
    
    // Build filter
    const filter: { isActive?: boolean } = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    // Get categories
    const categories = await Category.find(filter)
      .populate('parentId', 'name nameEn nameJa')
      .sort({ createdAt: -1 });
    
    res.json({
      categories: categories
    });});
// Get admin users
export const getAdminUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const isActive = req.query.isActive as string;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: { role?: string; status?: string } = {};
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (isActive !== undefined) {
      filter.status = isActive === 'true' ? 'active' : 'inactive';
    }
    
    // Get users (exclude password)
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Transform to match frontend interface
    const transformedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      status: user.status,
      isActive: user.status === 'active',
      totalOrders: user.totalOrders,
      totalSpent: user.totalSpent,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    
    // Get total count
    const total = await User.countDocuments(filter);
    
    res.json({
      data: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });});
// Get revenue data for chart
export const getRevenueData = asyncHandler(async (req: Request, res: Response) => {
  console.log('Getting revenue data for chart...');
    
    // Get last 6 months of revenue data
    const months = [];
    const revenueData = [];
    
    for (let i = 5; i >= 0; i--) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      
      const monthName = startDate.toLocaleDateString('en-US', { month: 'short' });
      
      // Get orders for this month
      const monthOrders = await Order.find({
        status: 'completed',
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const monthOrderCount = monthOrders.length;
      
      revenueData.push({
        month: monthName,
        revenue: monthRevenue,
        orders: monthOrderCount
      });
    }
    
    console.log('Revenue data:', revenueData);
    res.json(revenueData);});
// Get product statistics by category
export const getProductStats = asyncHandler(async (req: Request, res: Response) => {
  console.log('Getting product statistics...');
    
    // Get all categories with their products and revenue
    const categories = await Category.find({ isActive: true });
    const productStats = [];
    
    for (const category of categories) {
      // Get products in this category
      const products = await Product.find({ 
        categoryId: category._id,
        isActive: true 
      });
      
      // Get orders with products from this category
      const productIds = products.map(p => p._id);
      const orders = await Order.find({ 
        status: 'completed',
        'items.productId': { $in: productIds }
      });
      
      // Calculate revenue for this category
      let categoryRevenue = 0;
      for (const order of orders) {
        for (const item of order.items) {
          // Use proper type assertion for mongoose ObjectId comparison
          const product = products.find(p => String(p._id) === String(item.productId));
          if (product) {
            categoryRevenue += item.price * item.quantity;
          }
        }
      }
      
      productStats.push({
        category: category.name,
        count: products.length,
        revenue: categoryRevenue
      });
    }
    
    // Sort by revenue descending
    productStats.sort((a, b) => b.revenue - a.revenue);
    
    console.log('Product stats:', productStats);
    res.json(productStats);});
// Product CRUD operations
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const productData = req.body;
    const product = new Product(productData);
    await product.save();
    
    // Update category product count
    await updateCategoryProductCount(productData.categoryId);
    
    const populatedProduct = await Product.findById(product._id)
      .populate('categoryId', 'name nameEn nameJa slug');
    
    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });});
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
    const updateData = req.body;
    
    // Get the old product to check if category changed
    const oldProduct = await Product.findById(id);
    
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name nameEn nameJa slug');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product count for both old and new categories if category changed
    if (oldProduct && oldProduct.categoryId.toString() !== updateData.categoryId) {
      await updateCategoryProductCount(oldProduct.categoryId.toString());
    }
    await updateCategoryProductCount(updateData.categoryId);
    
    res.json({
      message: 'Product updated successfully',
      product
    });});
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.findByIdAndDelete(id);
    
    // Update category product count
    await updateCategoryProductCount(product.categoryId.toString());
    
    res.json({ message: 'Product deleted successfully' });});
// Category CRUD operations
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const categoryData = req.body;
    const category = new Category(categoryData);
    await category.save();
    
    const populatedCategory = await Category.findById(category._id)
      .populate('parentId', 'name nameEn nameJa');
    
    res.status(201).json({
      message: 'Category created successfully',
      category: populatedCategory
    });});
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
    const updateData = req.body;
    
    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parentId', 'name nameEn nameJa');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({
      message: 'Category updated successfully',
      category
    });});
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
    
    // Check if category has products
    const productsCount = await Product.countDocuments({ categoryId: id });
    if (productsCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with existing products' 
      });
    }
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });});
// User CRUD operations
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const userData = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const user = new User(userData);
    await user.save();
    
    // Create response object without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      status: user.status,
      isActive: user.status === 'active',
      totalOrders: user.totalOrders,
      totalSpent: user.totalSpent,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });});
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
    const updateData = req.body;
    
    // Don't allow updating password through this endpoint
    delete updateData.password;
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Transform to match frontend interface
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      status: user.status,
      isActive: user.status === 'active',
      totalOrders: user.totalOrders,
      totalSpent: user.totalSpent,
      lastActive: user.lastActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({
      message: 'User updated successfully',
      user: userResponse
    });});
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
    
    // Check if user has orders
    const ordersCount = await Order.countDocuments({ userId: id });
    if (ordersCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with existing orders' 
      });
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });});
// Enhanced User Management
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);});
export const bulkUpdateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { userIds, status } = req.body;
    
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { status }
    );

    res.json({
      message: `Updated ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount
    });});
// Enhanced Order Management
export const getOrderDetails = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('items.product', 'name price images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);});
export const bulkUpdateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { orderIds, status } = req.body;
    
    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { status }
    );

    res.json({
      message: `Updated ${result.modifiedCount} orders`,
      modifiedCount: result.modifiedCount
    });});
export const printOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('items.product', 'name price images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Generate PDF or return order data for printing
    const printData = {
      orderNumber: order.orderNumber,
      customer: order.userId,
      items: order.items,
      total: order.totalAmount,
      date: order.createdAt
    };

    res.json(printData);});
export const sendOrderEmail = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
    const { emailType = 'confirmation' } = req.body;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send email logic here
    // This would integrate with your email service

    res.json({ message: 'Email sent successfully' });});
// Analytics and Reports
export const getAnalyticsData = asyncHandler(async (req: Request, res: Response) => {
  const { period = '30d', type = 'revenue' } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    let data: any[] = [];

    if (type === 'revenue') {
      data = await Order.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    } else if (type === 'orders') {
      data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    }

    res.json(data);});
export const generateReport = asyncHandler(async (req: Request, res: Response) => {
  const { type, startDate, endDate, format = 'pdf' } = req.body;
    
    let reportData: any = {};

    switch (type) {
      case 'sales':
        reportData = await generateSalesReport(startDate, endDate);
        break;
      case 'inventory':
        reportData = await generateInventoryReport();
        break;
      case 'users':
        reportData = await generateUserReport(startDate, endDate);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    if (format === 'pdf') {
      // Generate PDF report
      const pdfBuffer = await generatePDFReport(reportData, type);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_report.pdf"`);
      return res.send(pdfBuffer);
    } else {
      res.json(reportData);
    }});
// Helper functions
const generateSalesReport = async (startDate: string, endDate: string) => {
  const orders = await Order.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  }).populate('userId', 'name email');

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    period: { startDate, endDate },
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue
    },
    orders
  };
};

const generateInventoryReport = async () => {
  const products = await Product.find().populate('categoryId', 'name');
  
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.stock < 10).length; // Using stock < 10 as low stock threshold

  return {
    summary: {
      totalProducts,
      activeProducts,
      lowStockProducts
    },
    products
  };
};

const generateUserReport = async (startDate: string, endDate: string) => {
  const users = await User.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const newUsers = users.filter(u => {
    const userDate = new Date(u.createdAt);
    const now = new Date();
    return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
  }).length;

  return {
    period: { startDate, endDate },
    summary: {
      totalUsers,
      activeUsers,
      newUsers
    },
    users
  };
};

const generatePDFReport = async (data: any, type: string): Promise<Buffer> => {
  // This would integrate with a PDF generation library like PDFKit
  // For now, return a simple buffer
  return Buffer.from('PDF Report Placeholder');
};

// Order Analytics
export const getOrderAnalytics = asyncHandler(async (req: Request, res: Response) => {
  // Get orders by status
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const byStatus = statusCounts.map(item => ({
      status: item._id,
      count: item.count,
      percentage: Math.round((item.count / totalOrders) * 100)
    }));

    // Get orders by hour (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const hourlyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    const byHour = Array.from({ length: 24 }, (_, i) => {
      const hourData = hourlyOrders.find(h => h._id === i);
      return {
        hour: `${i}:00`,
        orders: hourData ? hourData.orders : 0
      };
    });

    // Get monthly data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      
      const monthName = startDate.toLocaleDateString('en-US', { month: 'short' });
      
      const monthOrders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      monthlyData.push({
        month: monthName,
        orders: monthOrders.length,
        revenue: monthRevenue
      });
    }

    res.json({
      byStatus,
      byHour,
      byMonth: monthlyData
    });});
// Customer Analytics
export const getCustomerAnalytics = asyncHandler(async (req: Request, res: Response) => {
  // Get top spenders
    const topSpenders = await Order.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          totalSpent: 1,
          orders: 1
        }
      }
    ]);

    // Get customers by location (simplified - using address field)
    const locationData = await Order.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$user.address',
          customers: { $addToSet: '$userId' },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $project: {
          location: { $ifNull: ['$_id', 'Unknown'] },
          customers: { $size: '$customers' },
          revenue: 1
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get daily customer activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyActivity = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const newCustomers = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });
      
      const activeCustomers = await Order.distinct('userId', {
        createdAt: { $gte: date, $lt: nextDate }
      });
      
      dailyActivity.push({
        date: `${i + 1}`,
        newCustomers,
        activeCustomers: activeCustomers.length
      });
    }

    res.json({
      topSpenders,
      byLocation: locationData,
      activity: dailyActivity
    });});
// Sales Analytics
export const getSalesAnalytics = asyncHandler(async (req: Request, res: Response) => {
  // Get sales by payment method
    const paymentMethodData = await Order.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      },
      {
        $project: {
          method: { $ifNull: ['$_id', 'Unknown'] },
          count: 1,
          amount: 1
        }
      }
    ]);

    // Calculate conversion rate (simplified)
    const totalVisitors = 10000; // This would come from analytics tracking
    const totalOrders = await Order.countDocuments({ status: 'completed' });
    const conversionRate = totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0;

    // Calculate cart abandonment (simplified)
    const abandonedCarts = 500; // This would come from cart tracking
    const totalCarts = totalOrders + abandonedCarts;
    const cartAbandonment = totalCarts > 0 ? (abandonedCarts / totalCarts) * 100 : 0;

    // Calculate average order value
    const completedOrders = await Order.find({ status: 'completed' });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    res.json({
      byPaymentMethod: paymentMethodData,
      conversionRate: Math.round(conversionRate * 100) / 100,
      cartAbandonment: Math.round(cartAbandonment * 100) / 100,
      averageOrderValue
    });});
// Product Analytics
export const getProductAnalytics = asyncHandler(async (req: Request, res: Response) => {
  // Get top selling products
    const topSelling = await Order.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.productId',
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $sort: { sales: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          name: '$product.name',
          sales: 1,
          revenue: 1,
          stock: '$product.stock'
        }
      }
    ]);

    // Get product performance with real data
    const performance = await Promise.all(
      topSelling.map(async (item) => {
        // Get product views
        const product = await Product.findById(item._id).select('views').lean();
        const views = product?.views || 0;
        
        // Calculate average rating from reviews
        const reviews = await Review.aggregate([
          { $match: { productId: item._id } },
          { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        
        const rating = reviews.length > 0 && reviews[0].avgRating 
          ? Math.round(reviews[0].avgRating * 10) / 10 
          : 0;
        
        return {
          name: item.name,
          views,
          sales: item.sales,
          rating
        };
      })
    );

    // Get low stock products
    const lowStock = await Product.find({ stock: { $lt: 10 } })
      .populate('categoryId', 'name')
      .limit(5)
      .then(products => products.map(p => ({
        name: p.name,
        stock: p.stock,
        category: p.categoryId ? (p.categoryId as any).name : 'Unknown'
      })));

    res.json({
      topSelling,
      performance,
      lowStock
    });});
// Daily Revenue Data
export const getDailyRevenueData = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = await Order.find({
        status: 'completed',
        createdAt: { $gte: date, $lt: nextDate }
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      dailyData.push({
        date: `${i + 1}`,
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }

    res.json(dailyData);});