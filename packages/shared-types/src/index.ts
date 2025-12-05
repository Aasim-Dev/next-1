export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: 'buyer' | 'seller' | 'admin';
    isVerified: boolean;
    profile?: any;
    photographerProfile?: any;
}

export interface IProduct {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    seller: IUser | string;
    images: Array<{ url: string; publicId?: string }>;
    isActive: boolean;
}

export interface IOrderItem {
    product: IProduct | string;
    seller: IUser | string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface IOrder {
    _id: string;
    orderId: string;
    buyer: IUser | string;
    items: IOrderItem[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
