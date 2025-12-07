import { Request, Response } from 'express';
import { Order, generateOrderNumber } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Get all orders (admin)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      orderNumber,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: Record<string, unknown> = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (orderNumber) {
      filter.orderNumber = { $regex: orderNumber, $options: 'i' };
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name nameEn nameJa images')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user orders
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find({ userId })
      .populate('items.productId', 'name nameEn nameJa images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments({ userId });

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single order
export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const order = await Order.findById(id)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name nameEn nameJa images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && order.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Track order by order number (public route)
export const trackOrder = async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber })
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name nameEn nameJa images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Track order error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Track order by email (public route)
export const trackOrderByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    // Find orders by both userId (populated email) and guestEmail
    const userOrders = await Order.find({ userId: { $exists: true } })
      .populate({
        path: 'userId',
        match: { email: email },
        select: 'name email phone'
      })
      .populate('items.productId', 'name nameEn nameJa images')
      .sort({ createdAt: -1 });

    // Filter out orders where userId didn't match
    const matchedUserOrders = userOrders.filter(order => order.userId && (order.userId as any).email === email);

    // Find guest orders by guestEmail
    const guestOrders = await Order.find({ 
      guestEmail: email.toLowerCase().trim(),
      isGuestOrder: true
    })
      .populate('items.productId', 'name nameEn nameJa images')
      .sort({ createdAt: -1 });

    // Combine and sort
    const allOrders = [...matchedUserOrders, ...guestOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5); // Limit to last 5 orders

    if (!allOrders || allOrders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this email' });
    }

    res.json(allOrders);
  } catch (error) {
    console.error('Track order by email error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userRole = req.user.role;
    const {
      userId: requestedUserId,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
      status,
      paymentStatus,
      trackingNumber
    } = req.body;

    // Determine the actual userId to use
    let userId: string;
    if (userRole === 'admin' && requestedUserId) {
      // Admin creating order for another user
      userId = requestedUserId;
    } else {
      // Customer creating order for themselves
      userId = req.user.userId;
    }

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.district) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    // Validate payment method
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }

      if (!product.isActive) {
        return res.status(400).json({ message: `Product ${product.name} is not available` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.nameEn || product.name,
        nameVi: product.name,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color
      });

      // Update product stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Generate unique order number
    const orderNumber = await generateOrderNumber();
    
    // Prepare order data
    const orderData: any = {
      orderNumber,
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes
    };

    // Add admin-specific fields if provided
    if (userRole === 'admin') {
      if (status) orderData.status = status;
      if (paymentStatus) orderData.paymentStatus = paymentStatus;
      if (trackingNumber) orderData.trackingNumber = trackingNumber;
    }
    
    const order = new Order(orderData);

    await order.save();

    // Update user statistics
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: { 
          totalOrders: 1,
          totalSpent: totalAmount
        }
      });
    } catch (userUpdateError) {
      console.error('Error updating user statistics:', userUpdateError);
      // Don't fail the order creation if user update fails
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create guest order (no authentication required)
export const createGuestOrder = async (req: Request, res: Response) => {
  try {
    const {
      email,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes
    } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required for guest orders' });
    }

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.district) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    // Validate payment method
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }

      if (!product.isActive) {
        return res.status(400).json({ message: `Product ${product.name} is not available` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.nameEn || product.name,
        nameVi: product.name,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color
      });

      // Update product stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Generate unique order number
    const orderNumber = await generateOrderNumber();
    
    // Prepare order data for guest
    const orderData: any = {
      orderNumber,
      guestEmail: email.toLowerCase().trim(),
      isGuestOrder: true,
      items: orderItems,
      totalAmount,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      notes
    };
    
    const order = new Order(orderData);
    await order.save();

    res.status(201).json({
      message: 'Guest order created successfully',
      order
    });
  } catch (error) {
    console.error('Create guest order error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name nameEn nameJa images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Cancel order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const filter: Record<string, unknown> = { _id: id };
    if (userRole !== 'admin') {
      filter.userId = userId;
    }

    const order = await Order.findOne(filter);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending orders can be cancelled' 
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    // Update user statistics
    await User.findByIdAndUpdate(order.userId, {
      $inc: { 
        totalOrders: -1,
        totalSpent: -order.totalAmount
      }
    });

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete order (Admin only)
export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { id } = req.params;
    const userRole = req.user.role;
    
    // Only admin can delete orders
    if (userRole !== 'Admin' && userRole !== 'Super Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow deletion of cancelled orders or very old completed orders
    if (order.status !== 'cancelled' && order.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Only cancelled or completed orders can be deleted' 
      });
    }

    // If deleting a cancelled order, restore product stock
    if (order.status === 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    // Delete the order
    await Order.findByIdAndDelete(id);

    // Update user statistics if needed
    if (order.status === 'completed') {
      await User.findByIdAndUpdate(order.userId, {
        $inc: { 
          totalOrders: -1,
          totalSpent: -order.totalAmount
        }
      });
    }

    res.json({
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update order (Admin only)
export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { id } = req.params;
    const userRole = req.user.role;
    
    // Only admin can update orders
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.userId;
    delete updateData.orderNumber;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get order statistics (admin)
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const totalRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
          } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 
