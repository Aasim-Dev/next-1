import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@photographer-marketplace/database';
import { config } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const register = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User already exists with this email'
            });
        }

        const userData: any = {
            name,
            email,
            password,
            role,
            profile: {},
        };

        if (role === 'seller') {
            userData.photographerProfile = {
                specialties: [],
                experience: 0,
                priceRange: {
                    min: 0,
                    max: 0,
                    currency: 'USD',
                    per: 'hour'
                },
                availability: {
                    weekDays: [1, 2, 3, 4, 5],
                    timeSlots: [{ start: '09:00', end: '17:00' }],
                    blackoutDates: []
                },
                portfolio: [],
                serviceAreas: [],
            };
        }

        const user = await User.create(userData);

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            config.jwtSecret,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified,
                }
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Registration failed'
        });
    }
};

export const login = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
                isVerified: user.isVerified,
            },
            config.jwtSecret,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified,
                },
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Login failed'
        });
    }
};

export const logout = async (req: AuthRequest, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch user'
        });
    }
};
