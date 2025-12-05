import { Response } from 'express';
import { User, Product, Order } from '@photographer-marketplace/database';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getStats = async (req: AuthRequest, res: Response) => {
    try {
        const [
            totalSellers,
            totalBuyers,
            totalOrders,
            totalProducts,
            pendingOrders,
            completedOrders,
            recentSellers,
            recentOrders,
        ] = await Promise.all([
            User.countDocuments({ role: 'seller' }),
            User.countDocuments({ role: 'buyer' }),
            Order.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments({ status: 'pending' }),
            Order.countDocuments({ status: 'completed' }),
            User.find({ role: 'seller' })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name email createdAt'),
            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('buyer', 'name email')
                .populate('items.seller', 'name email'),
        ]);

        const orders = await Order.find({ status: 'completed' });
        const totalRevenue = orders.reduce(
            (sum, order) => sum + order.totalAmount,
            0
        );

        res.status(200).json({
            success: true,
            data: {
                totalSellers,
                totalBuyers,
                totalOrders,
                totalProducts,
                totalRevenue,
                pendingOrders,
                completedOrders,
                recentSellers,
                recentOrders,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch statistics'
        });
    }
};

export const getBuyers = async (req: AuthRequest, res: Response) => {
    try {
        const buyers = await User.find({ role: 'buyer' })
            .select('name email profile isVerified createdAt')
            .lean();

        const buyersWithStats = await Promise.all(
            buyers.map(async (buyer) => {
                const orders = await Order.find({ buyer: buyer._id });
                const orderCount = orders.length;
                const totalSpent = orders.reduce(
                    (sum, order) => sum + order.totalAmount,
                    0
                );

                return {
                    ...buyer,
                    orderCount,
                    totalSpent,
                };
            })
        );

        res.status(200).json({
            success: true,
            data: buyersWithStats,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch buyers'
        });
    }
};

export const getSellers = async (req: AuthRequest, res: Response) => {
    try {
        const sellers = await User.find({ role: 'seller' })
            .select('-password')
            .lean();

        const enrichedSellers = await Promise.all(
            sellers.map(async (seller: any) => {
                const productCount = await Product.countDocuments({ seller: seller._id });
                const orders = await Order.find({ 'items.seller': seller._id }).lean();

                let totalSales = 0;
                let totalRevenue = 0;

                orders.forEach((order: any) => {
                    order.items.forEach((item: any) => {
                        if (item.seller.toString() === seller._id.toString()) {
                            totalSales += item.quantity;
                            totalRevenue += item.subtotal;
                        }
                    });
                });

                return {
                    ...seller,
                    productCount,
                    totalSales,
                    totalRevenue,
                };
            })
        );

        res.status(200).json({
            success: true,
            data: enrichedSellers,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch sellers'
        });
    }
};
