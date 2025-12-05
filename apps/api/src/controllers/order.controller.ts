import { Response } from 'express';
import { Order, Product, Cart } from '@photographer-marketplace/database';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.query;
        let query: any = {};

        if (req.user?.role === 'buyer') {
            query.buyer = req.user.userId;
        } else if (req.user?.role === 'seller') {
            return res.status(403).json({
                success: false,
                error: 'Sellers should use /api/orders/seller endpoint'
            });
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('buyer', 'name email')
            .populate({
                path: 'items.product',
                select: 'title images category'
            })
            .populate('items.seller', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: { orders },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch orders'
        });
    }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'buyer') {
            return res.status(403).json({
                success: false,
                error: 'Only buyers can create orders'
            });
        }

        const { cartItems, shippingAddress, paymentMethod, notes } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Cart is empty'
            });
        }

        const orderItems = [];
        let totalAmount = 0;

        for (const item of cartItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: `Product ${item.product} not found`
                });
            }

            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;

            orderItems.push({
                product: product._id,
                seller: product.seller,
                quantity: item.quantity,
                price: product.price,
                subtotal: subtotal
            });
        }

        const order = await Order.create({
            buyer: req.user.userId,
            items: orderItems,
            totalAmount,
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: paymentMethod || 'card',
            shippingAddress,
            notes,
        });

        await Cart.findOneAndUpdate(
            { user: req.user.userId },
            { $set: { items: [] } }
        );

        const populatedOrder = await Order.findById(order._id)
            .populate('buyer', 'name email')
            .populate({
                path: 'items.product',
                select: 'title images category'
            })
            .populate('items.seller', 'name email');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: populatedOrder,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create order'
        });
    }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('buyer', 'name email')
            .populate({
                path: 'items.product',
                select: 'title images category',
            })
            .populate('items.seller', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        const isBuyer = order.buyer._id.toString() === req.user?.userId;
        const isSeller = order.items.some(
            (item: any) => item.seller._id.toString() === req.user?.userId
        );
        const isAdmin = req.user?.role === 'admin';

        if (!isBuyer && !isSeller && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized access'
            });
        }

        res.status(200).json({
            success: true,
            data: { order },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch order'
        });
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, cancelReason } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        const isBuyer = order.buyer.toString() === req.user?.userId;
        const isSeller = order.items.some(
            (item: any) => item.seller.toString() === req.user?.userId
        );
        const isAdmin = req.user?.role === 'admin';

        if (!isBuyer && !isSeller && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        order.status = status;
        if (cancelReason) {
            order.cancelReason = cancelReason;
        }
        if (status === 'completed') {
            order.completedAt = new Date();
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: { order },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update order'
        });
    }
};

export const getSellerOrders = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'seller') {
            return res.status(403).json({
                success: false,
                error: 'Only sellers can access this endpoint'
            });
        }

        const { status } = req.query;
        let query: any = {
            'items.seller': req.user.userId
        };

        if (status && status !== 'all') {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('buyer', 'name email')
            .populate({
                path: 'items.product',
                select: 'title images category'
            })
            .populate('items.seller', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        const filteredOrders = orders.map(order => ({
            ...order,
            items: order.items.filter((item: any) =>
                item.seller._id.toString() === req.user?.userId
            ),
            totalAmount: order.items
                .filter((item: any) => item.seller._id.toString() === req.user?.userId)
                .reduce((sum: number, item: any) => sum + item.subtotal, 0)
        }));

        res.status(200).json({
            success: true,
            data: filteredOrders,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch orders'
        });
    }
};
