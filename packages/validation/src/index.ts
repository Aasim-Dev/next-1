import * as yup from 'yup';

export const registerSchema = yup.object({
    name: yup.string().min(2).max(50).required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    role: yup.string().oneOf(['buyer', 'seller'], 'Invalid role').required('Role is required'),
});

export const loginSchema = yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required'),
});

export const productSchema = yup.object({
    title: yup.string().min(3).max(200).required('Title is required'),
    description: yup.string().max(2000).required('Description is required'),
    category: yup.string().required('Category is required'),
    price: yup.number().min(0).required('Price is required'),
    location: yup.string().required('Location is required'),
});
