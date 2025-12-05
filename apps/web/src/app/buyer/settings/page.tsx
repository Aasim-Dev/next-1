"use client";

import { useState, useEffect } from "react";
import { User, Mail, Lock, Bell, Shield } from "lucide-react";

interface UserProfile {
    name: string;
    email: string;
    role: string;
}

export default function SettingsPage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            if (data.success || data.user) {
                setUser(data.data?.user || data.user);
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-600 mt-2">Manage your profile and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation */}
                <div className="col-span-1">
                    <nav className="space-y-1">
                        <button className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium">
                            <User size={20} />
                            <span>Profile Information</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                            <Lock size={20} />
                            <span>Security</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                            <Bell size={20} />
                            <span>Notifications</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                            <Shield size={20} />
                            <span>Privacy</span>
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="col-span-2 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

                        <div className="flex items-center space-x-6 mb-8">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                                <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                    Change Photo
                                </button>
                            </div>
                        </div>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            defaultValue={user?.name}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            defaultValue={user?.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <button
                                    type="button"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Account Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Status</h2>
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center space-x-3">
                                <Shield className="text-green-600" size={24} />
                                <div>
                                    <p className="font-medium text-green-900">Active Buyer Account</p>
                                    <p className="text-sm text-green-700">Your account is fully verified and active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
