"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CartContextType {
    cartCount: number;
    cartItems: string[]; // List of product IDs in cart
    refreshCartCount: () => Promise<void>;
    addToCartItems: (productId: string) => void;
    removeFromCartItems: (productId: string) => void;
    isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartCount, setCartCount] = useState(0);
    const [cartItems, setCartItems] = useState<string[]>([]);

    const refreshCartCount = async () => {
        try {
            const res = await fetch("/api/cart");
            const data = await res.json();
            if (data.success && data.data) {
                setCartCount(data.data.items.length);
                setCartItems(data.data.items.map((item: any) => item.product._id));
            } else {
                // If cart is empty or not found
                setCartCount(0);
                setCartItems([]);
            }
        } catch (error) {
            console.error("Failed to fetch cart count:", error);
        }
    };

    const addToCartItems = (productId: string) => {
        setCartItems((prev) => [...prev, productId]);
        setCartCount((prev) => prev + 1);
    };

    const removeFromCartItems = (productId: string) => {
        setCartItems((prev) => prev.filter((id) => id !== productId));
        setCartCount((prev) => Math.max(0, prev - 1));
    };

    const isInCart = (productId: string) => {
        return cartItems.includes(productId);
    };

    useEffect(() => {
        refreshCartCount();
    }, []);

    return (
        <CartContext.Provider
            value={{
                cartCount,
                cartItems,
                refreshCartCount,
                addToCartItems,
                removeFromCartItems,
                isInCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
