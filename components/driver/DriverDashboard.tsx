"use client";

import React, { useState } from "react";
import {
    Power,
    User,
    TrendingUp,
    MapPin,
    Clock,
    DollarSign,
    Navigation,
    CheckCircle2,
    Star,
    ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface DriverDashboardProps {
    driverName?: string;
    driverAvatar?: string;
}

export function DriverDashboard({
    driverName,
    driverAvatar
}: DriverDashboardProps) {
    const t = useTranslations('Driver');
    const [isOnline, setIsOnline] = useState(false);
    const [showBottomSheet, setShowBottomSheet] = useState(true);

    // Mock data
    const todaysEarnings = 45000;
    const completedRides = 3;
    const currentRating = 4.9;

    const recentRide = {
        from: "Rond-point Signers",
        to: "Marché Birere",
        earnings: 3500,
        time: "Il y a 15 min",
        distance: "4.2 km"
    };

    const handleToggleOnline = () => {
        setIsOnline(!isOnline);
    };

    return (
        <div className="h-full w-full bg-black relative overflow-hidden">
            {/* Map Background with Overlay */}
            <div className="absolute inset-0 bg-[#0A0A0A]">
                {/* Simulated Map - Replace with real Leaflet Map */}
                <div className="relative w-full h-full">
                    {/* Map Placeholder */}
                    <div className={cn(
                        "w-full h-full transition-all duration-500",
                        isOnline ? "opacity-100" : "opacity-30 grayscale"
                    )}>
                        {/* Grid Pattern for Map Simulation */}
                        <div
                            className="w-full h-full"
                            style={{
                                backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)',
                                backgroundSize: '50px 50px'
                            }}
                        />

                        {/* Simulated Heatmap Zones (High Demand Areas) */}
                        {isOnline && (
                            <>
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 0.3 }}
                                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                                    className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-[#F0B90B] blur-2xl"
                                />
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 0.2 }}
                                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: 0.3 }}
                                    className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-orange-500 blur-3xl"
                                />
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 0.25 }}
                                    transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", delay: 0.6 }}
                                    className="absolute bottom-1/3 left-1/2 w-36 h-36 rounded-full bg-yellow-500 blur-2xl"
                                />
                            </>
                        )}

                        {/* Driver Position (when online) */}
                        {isOnline && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="relative"
                                >
                                    <div className="w-16 h-16 rounded-full bg-[#F0B90B]/20 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-[#F0B90B] flex items-center justify-center shadow-lg shadow-[#F0B90B]/50">
                                            <Navigation className="w-6 h-6 text-black" />
                                        </div>
                                    </div>
                                    <div className="absolute -inset-4 rounded-full border-2 border-[#F0B90B]/30 animate-ping" />
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col">
                {/* Header with Status Toggle */}
                <div className="pt-safe px-4 pb-4 bg-gradient-to-b from-black via-black/90 to-transparent">
                    <div className="flex items-center justify-between mb-4">
                        {/* Avatar */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border-2 border-[#F0B90B] flex items-center justify-center overflow-hidden">
                                {driverAvatar ? (
                                    <img src={driverAvatar} alt={driverName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-[#F0B90B]" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{driverName || "Chauffeur"}</p>
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-[#F0B90B] fill-current" />
                                    <span className="text-xs text-[#9A9A9A]">{currentRating}</span>
                                </div>
                            </div>
                        </div>

                        {/* Settings Icon (placeholder) */}
                        <button className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center">
                            <span className="text-white">⚙️</span>
                        </button>
                    </div>

                    {/* Online/Offline Toggle Button */}
                    <button
                        onClick={handleToggleOnline}
                        className={cn(
                            "w-full h-16 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg",
                            isOnline
                                ? "bg-[#F0B90B] text-black shadow-[#F0B90B]/30 active:scale-[0.98]"
                                : "bg-[#1A1A1A] text-[#9A9A9A] border-2 border-[#333333] active:scale-[0.98]"
                        )}
                    >
                        <Power className={cn("w-6 h-6", isOnline && "animate-pulse")} />
                        {isOnline ? t('online') : t('offline')}
                    </button>
                </div>

                {/* Earnings Card */}
                <div className="px-4 mb-4">
                    <Card className="bg-[#0C0C0C] border-2 border-[#F0B90B]/30 overflow-hidden shadow-xl shadow-[#F0B90B]/10">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-[#9A9A9A] uppercase tracking-wide">
                                    {t('todayEarnings')}
                                </span>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-4xl md:text-5xl font-heading font-extrabold text-[#F0B90B] tracking-tight">
                                        {todaysEarnings.toLocaleString()}
                                        <span className="text-xl text-white ml-2">FC</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-2 rounded-lg border border-[#333333]">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-bold text-white">{completedRides} Courses</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom Sheet - Recent Activity */}
                <AnimatePresence>
                    {showBottomSheet && (
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-[#0C0C0C] border-t-2 border-[#1A1A1A] rounded-t-3xl pb-safe"
                        >
                            {/* Drag Handle */}
                            <div className="pt-3 pb-4 flex justify-center">
                                <button
                                    onClick={() => setShowBottomSheet(false)}
                                    className="w-16 h-1.5 bg-[#333333] rounded-full"
                                />
                            </div>

                            <div className="px-4 pb-6">
                                {/* Section Title */}
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-heading font-bold text-white">
                                        {t('lastRide')}
                                    </h3>
                                    <span className="text-xs text-[#9A9A9A] flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {recentRide.time}
                                    </span>
                                </div>

                                {/* Recent Ride Card */}
                                <Card className="bg-[#1A1A1A] border-[#333333]">
                                    <CardContent className="p-4">
                                        {/* Route */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-3 h-3 rounded-full bg-[#9A9A9A]" />
                                                <div className="w-0.5 h-8 bg-[#333333]" />
                                                <div className="w-3 h-3 rounded-full bg-[#F0B90B]" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="mb-3">
                                                    <p className="text-xs text-[#666] mb-0.5">De</p>
                                                    <p className="text-sm font-bold text-white">{recentRide.from}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#666] mb-0.5">À</p>
                                                    <p className="text-sm font-bold text-white">{recentRide.to}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex items-center justify-between pt-3 border-t border-[#333333]">
                                            <div className="flex items-center gap-2 text-[#9A9A9A] text-xs">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{recentRide.distance}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-green-500" />
                                                <span className="text-lg font-bold text-[#F0B90B]">
                                                    {recentRide.earnings.toLocaleString()} FC
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Bonus Info (Optional) */}
                                <div className="mt-4 p-3 bg-gradient-to-r from-[#F0B90B]/10 to-transparent border-l-4 border-[#F0B90B] rounded">
                                    <p className="text-xs text-[#F0B90B] font-bold mb-1">
                                        💡 {t('bonusAvailable')}
                                    </p>
                                    <p className="text-xs text-[#9A9A9A]">
                                        {t('bonusDesc')}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Action Button (when bottom sheet is closed) */}
                {!showBottomSheet && (
                    <motion.button
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onClick={() => setShowBottomSheet(true)}
                        className="absolute bottom-8 right-4 w-14 h-14 rounded-full bg-[#F0B90B] flex items-center justify-center shadow-lg shadow-[#F0B90B]/30 active:scale-95 transition-transform"
                    >
                        <ChevronUp className="w-6 h-6 text-black" />
                    </motion.button>
                )}
            </div>

            {/* Offline Overlay Message */}
            {!isOnline && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="text-center px-6">
                        <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border-2 border-[#333333] flex items-center justify-center mx-auto mb-4">
                            <Power className="w-10 h-10 text-[#666]" />
                        </div>
                        <p className="text-xl font-bold text-[#666] mb-2">{t('offlineMode')}</p>
                        <p className="text-sm text-[#444]">
                            {t('offlineDesc')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
