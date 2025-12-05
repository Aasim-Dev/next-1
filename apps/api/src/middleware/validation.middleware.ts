import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

export const validate = (schema: yup.AnySchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validate(req.body, { abortEarly: false });
            next();
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                return res.status(400).json({
                    success: false,
                    error: error.errors[0],
                    errors: error.errors
                });
            }
            next(error);
        }
    };
};
