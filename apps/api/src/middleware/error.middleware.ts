import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface AppError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
}

export const errorMiddleware = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        error: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
