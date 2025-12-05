import { Response } from 'express';
import { Product } from '@photographer-marketplace/database';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getProducts = async (req: AuthRequest, res: Response) => {
    try {
        const { search, category, sellerId, status } = req.query;

        let query: any = {};

        if (sellerId) {
            query.seller = sellerId;
        } else {
            query.isActive = true;
        }

        if (status && sellerId) {
            query.isActive = status === 'active';
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const products = await Product.find(query)
            .populate('seller', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch products'
        });
    }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'seller') {
            return res.status(403).json({
                success: false,
                error: 'Only sellers can create products'
            });
        }

        const { title, description, category, price, location, duration, deliverables, tags, status } = req.body;

        if (!title || !description || !category || !price || !location) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const product = await Product.create({
            title,
            description,
            category,
            price,
            location,
            duration: duration || 1,
            deliverables: deliverables || [],
            tags: tags || [],
            images: [{ url: '/placeholder-image.jpg' }],
            isActive: status === 'active',
            seller: req.user.userId,
        });

        const populatedProduct = await Product.findById(product._id)
            .populate('seller', 'name email');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: populatedProduct,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create product'
        });
    }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, ...updateData } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'Product ID is required'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        if (product.seller.toString() !== req.user?.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this product'
            });
        }

        Object.assign(product, updateData);
        await product.save();

        const updatedProduct = await Product.findById(productId)
            .populate('seller', 'name email');

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update product'
        });
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { productId } = req.query;

        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'Product ID is required'
            });
        }

        const product = await Product.findById(productId as string);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        if (product.seller.toString() !== req.user?.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this product'
            });
        }

        await Product.findByIdAndDelete(productId);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete product'
        });
    }
};
