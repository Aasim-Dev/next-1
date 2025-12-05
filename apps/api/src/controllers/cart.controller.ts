import { Response } from 'express';
import { Cart, Product } from '@photographer-marketplace/database';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        let cart = await Cart.findOne({ user: req.user?.userId })
            .populate({
                path: 'items.product',
                populate: {
                    path: 'seller',
                    select: 'name email'
                }
            })
            .lean();

        if (!cart) {
            cart = {
                _id: undefined,
                user: req.user?.userId,
                items: [],
                __v: 0
            } as any;
        }

        res.status(200).json({
            success: true,
            data: cart,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch cart'
        });
    }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity = 1 } = req.body;

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

        let cart = await Cart.findOne({ user: req.user?.userId });

        if (!cart) {
            cart = await Cart.create({
                user: req.user?.userId,
                items: [{
                    product: productId,
                    quantity,
                    price: product.price,
                    addedAt: new Date(),
                }],
            });
        } else {
            const existingItem = cart.items.find((item: any) =>
                item.product.toString() === productId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({
                    product: productId,
                    quantity,
                    price: product.price,
                    addedAt: new Date()
                } as any);
            }

            await cart.save();
        }

        cart = await Cart.findOne({ user: req.user?.userId })
            .populate({
                path: 'items.product',
                populate: {
                    path: 'seller',
                    select: 'name email'
                }
            });

        res.status(200).json({
            success: true,
            message: 'Product added to cart',
            data: cart,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to add product to cart'
        });
    }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Product ID and quantity are required'
            });
        }

        const cart = await Cart.findOne({ user: req.user?.userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                error: 'Cart not found'
            });
        }

        const item = cart.items.find((item: any) =>
            item.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Product not in cart'
            });
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter((item: any) =>
                item.product.toString() !== productId
            );
        } else {
            item.quantity = quantity;
        }

        await cart.save();

        const updatedCart = await Cart.findOne({ user: req.user?.userId })
            .populate({
                path: 'items.product',
                populate: {
                    path: 'seller',
                    select: 'name email'
                }
            });

        res.status(200).json({
            success: true,
            message: 'Cart updated',
            data: updatedCart,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update cart'
        });
    }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
    try {
        const { productId } = req.query;

        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'Product ID is required'
            });
        }

        const cart = await Cart.findOne({ user: req.user?.userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                error: 'Cart not found'
            });
        }

        cart.items = cart.items.filter((item: any) =>
            item.product.toString() !== productId
        );

        if (cart.items.length === 0) {
            await Cart.deleteOne({ _id: cart._id });
        } else {
            await cart.save();
        }

        const updatedCart = await Cart.findOne({ user: req.user?.userId })
            .populate({
                path: 'items.product',
                populate: {
                    path: 'seller',
                    select: 'name email'
                }
            });

        res.status(200).json({
            success: true,
            message: 'Product removed from cart',
            data: updatedCart,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to remove product from cart'
        });
    }
};

export const getCartCount = async (req: AuthRequest, res: Response) => {
    try {
        const cart = await Cart.findOne({ user: req.user?.userId });
        const count = cart ? cart.items.length : 0;

        res.status(200).json({
            success: true,
            data: { count },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch cart count'
        });
    }
};
