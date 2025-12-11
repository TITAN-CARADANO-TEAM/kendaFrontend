"use client";

import React, { useState, useEffect } from "react";
import { Car, Wallet, Shield, Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { Notification, NotificationType } from "@/types";
// TODO: Import service when ready
// import { getNotifications, markAsRead, markAllAsRead } from "@/services/notificationService";

export function NotificationsScreen() {
    const t = useTranslations('Notifications');

    // State for notifications from backend
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // TODO: Connect to Supabase
        // const fetchNotifications = async () => {
        //     setIsLoading(true);
        //     try {
        //         const response = await getNotifications(userId);
        //         if (response.data) setNotifications(response.data);
        //     } catch (error) {
        //         console.error('Failed to fetch notifications:', error);
        //     } finally {
        //         setIsLoading(false);
        //     }
        // };
        // fetchNotifications();
        //
        // // Subscribe to realtime notifications
        // const unsubscribe = subscribeToNotifications(userId, (newNotification) => {
        //     setNotifications(prev => [newNotification, ...prev]);
        // });
        // return () => unsubscribe();

        // Simulate loading for now
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleMarkAllRead = async () => {
        // TODO: Connect to Supabase
        // await markAllAsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    const handleMarkRead = async (notificationId: string) => {
        // TODO: Connect to Supabase
        // await markAsRead(notificationId);
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="h-full overflow-y-auto bg-black text-white pb-24 pt-safe">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md -mx-4 px-4 py-4 mb-2 border-b border-[#1A1A1A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-heading font-bold text-white">
                        {t('title')}
                    </h1>
                    {unreadCount > 0 && (
                        <span className="bg-[#F0B90B] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        className="text-[#F0B90B] hover:text-[#F0B90B]/80 hover:bg-[#F0B90B]/10 text-xs font-bold h-8 px-3"
                        onClick={handleMarkAllRead}
                    >
                        {t('markAllRead')}
                    </Button>
                )}
            </header>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-[#666]" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{t('noNotifications')}</h3>
                    <p className="text-sm text-[#9A9A9A]">
                        {t('noNotificationsDesc')}
                    </p>
                </div>
            )}

            {/* Notifications List */}
            {!isLoading && notifications.length > 0 && (
                <div className="px-4">
                    {notifications.map((notif, index) => (
                        <NotificationItem
                            key={notif.id}
                            notification={notif}
                            isLast={index === notifications.length - 1}
                            onRead={() => handleMarkRead(notif.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface NotificationItemProps {
    notification: Notification;
    isLast: boolean;
    onRead: () => void;
}

function NotificationItem({ notification, isLast, onRead }: NotificationItemProps) {
    const t = useTranslations('Notifications');

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "TRANSPORT":
                return {
                    icon: Car,
                    bg: "bg-blue-500/10",
                    text: "text-blue-500"
                };
            case "PAYMENT":
                return {
                    icon: Wallet,
                    bg: "bg-[#F0B90B]/10",
                    text: "text-[#F0B90B]"
                };
            case "SYSTEM":
                return {
                    icon: Shield,
                    bg: "bg-green-500/10",
                    text: "text-green-500"
                };
            default:
                return {
                    icon: Bell,
                    bg: "bg-gray-500/10",
                    text: "text-gray-500"
                };
        }
    };

    const style = getIcon(notification.type);
    const Icon = style.icon;

    // Format time relative to now
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return t('minutesAgo', { count: diffMins });
        if (diffHours < 24) return t('hoursAgo', { count: diffHours });
        if (diffDays === 1) return t('yesterday');
        return date.toLocaleDateString();
    };

    return (
        <button
            onClick={onRead}
            className={cn(
                "w-full flex gap-4 py-4 text-left transition-opacity",
                !isLast && "border-b border-[#1A1A1A]",
                notification.is_read && "opacity-60"
            )}
        >
            {/* Icon */}
            <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                style.bg
            )}>
                <Icon className={cn("w-6 h-6", style.text)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className={cn(
                        "font-bold text-sm truncate pr-2",
                        "text-white"
                    )}>
                        {notification.title}
                    </h3>
                    <span className="text-[10px] text-[#9A9A9A] shrink-0 mt-0.5">
                        {formatTime(notification.created_at)}
                    </span>
                </div>
                <p className="text-xs text-[#9A9A9A] leading-relaxed line-clamp-2">
                    {notification.message}
                </p>
                {!notification.is_read && (
                    <div className="mt-2 flex items-center gap-1 text-[#F0B90B]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F0B90B]" />
                        <span className="text-[10px] font-bold">{t('new')}</span>
                    </div>
                )}
            </div>
        </button>
    );
}
