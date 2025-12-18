"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { MapPin, Navigation, Clock, X, CalendarClock, Car, Bike, Sparkles, ChevronRight, CreditCard, DollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

import { type DriverLocation } from "@/types";

interface RideType {
    id: 'kenda_go' | 'kenda_comfort' | 'kenda_moto';
    name: string;
    description: string;
    icon: React.ElementType;
    basePrice: number;
    pricePerKm: number;
    multiplier: number;
    capacity: number;
}

interface RideRequestSheetProps {
    isOpen?: boolean;
    onClose?: () => void;
    destination?: [number, number] | null;
    distance?: number;
    onOrder?: (rideTypeId: string, price: number) => void;
    selectedDriver?: DriverLocation | null;
    onDriverClear?: () => void;
}

export const RideRequestSheet = ({
    isOpen = true,
    onClose,
    destination: externalDestination,
    distance: externalDistance = 0,
    onOrder,
    selectedDriver,
    onDriverClear
}: RideRequestSheetProps) => {
    const t = useTranslations('Ride');
    const [selectedRideType, setSelectedRideType] = useState<RideType['id']>('kenda_go');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'WALLET'>('CASH');

    const rideTypes = useMemo<RideType[]>(() => [
        {
            id: 'kenda_go',
            name: "Kenda Go",
            description: "Trajets quotidiens abordables",
            icon: Car,
            basePrice: 2000,
            pricePerKm: 500,
            multiplier: 1,
            capacity: 4
        },
        {
            id: 'kenda_comfort',
            name: "Kenda Comfort",
            description: "Voitures récentes et spacieuses",
            icon: Sparkles,
            basePrice: 3500,
            pricePerKm: 800,
            multiplier: 1.4,
            capacity: 4
        },
        {
            id: 'kenda_moto',
            name: "Kenda Moto",
            description: "Rapide, évite les bouchons",
            icon: Bike,
            basePrice: 1000,
            pricePerKm: 300,
            multiplier: 0.6,
            capacity: 1
        }
    ], []);

    const calculatePrice = (type: RideType) => {
        if (!externalDistance) return 0;
        const total = type.basePrice + (type.pricePerKm * externalDistance);
        return Math.round(total / 100) * 100; // Round to nearest 100
    };

    const estimatedTime = externalDistance ? Math.ceil(externalDistance * 2) : 0;

    // Handle drag to close
    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.y > threshold) {
            onClose?.();
        }
    };

    if (!isOpen) return null;

    const currentRideType = rideTypes.find(r => r.id === selectedRideType)!;
    const currentPrice = calculatePrice(currentRideType);

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                initial={{ y: "100%" }}
                animate={{ y: isOpen ? 0 : "100%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className={cn(
                    "w-full max-w-lg pointer-events-auto",
                    "bg-[#0F0F0F] border-t border-[#1F1F1F]",
                    "rounded-t-[32px] overflow-hidden",
                    "shadow-[0_-8px_30px_rgb(0,0,0,0.5)] relative"
                )}
            >
                {/* Header Section */}
                <div className="px-6 pt-3 pb-4">
                    {/* Drag Handle */}
                    <div className="w-10 h-1 bg-[#2F2F2F] rounded-full mx-auto mb-4" />

                    {/* Routing Info (Minimized) */}
                    <div className="flex items-center gap-3 bg-[#1A1A1A] p-3 rounded-2xl border border-[#2A2A2A] mb-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#F0B90B]" />
                            <div className="w-0.5 h-4 bg-[#2A2A2A]" />
                            <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[#9A9A9A] text-xs font-medium truncate">{t('currentPosition')}</p>
                            <p className="text-white text-sm font-semibold truncate">
                                {externalDestination ? t('destinationSelected', { distance: externalDistance.toFixed(1) }) : t('selectDestination')}
                            </p>
                        </div>
                        {onClose && (
                            <button onClick={onClose} className="p-2 hover:bg-[#2A2A2A] rounded-full transition-colors">
                                <X className="w-5 h-5 text-[#9A9A9A]" />
                            </button>
                        )}
                    </div>

                    {/* Selected Driver Banner */}
                    {selectedDriver && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mb-4 bg-[#F0B90B]/10 border border-[#F0B90B]/30 rounded-2xl p-3 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#F0B90B] flex items-center justify-center text-black font-bold border-2 border-[#0F0F0F]">
                                    {selectedDriver.driver_name?.[0]}
                                </div>
                                <div>
                                    <p className="text-[#F0B90B] text-[10px] font-bold uppercase tracking-wider">Demande directe</p>
                                    <p className="text-white font-bold">{selectedDriver.driver_name}</p>
                                </div>
                            </div>
                            <button onClick={onDriverClear} className="p-1.5 hover:bg-white/10 rounded-full">
                                <X className="w-4 h-4 text-[#F0B90B]" />
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Ride Types List */}
                <div className="px-3 max-h-[40vh] overflow-y-auto no-scrollbar">
                    <div className="space-y-2">
                        {rideTypes.map((type) => {
                            const isSelected = selectedRideType === type.id;
                            const price = calculatePrice(type);

                            return (
                                <motion.button
                                    key={type.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedRideType(type.id)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200",
                                        isSelected
                                            ? "bg-[#1A1A1A] border-2 border-[#F0B90B]"
                                            : "bg-transparent border-2 border-transparent hover:bg-[#151515]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                                        isSelected ? "bg-[#F0B90B] text-black" : "bg-[#1A1A1A] text-[#9A9A9A]"
                                    )}>
                                        <type.icon className="w-8 h-8" />
                                    </div>

                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold text-lg">{type.name}</span>
                                            <span className="flex items-center gap-1 text-[#9A9A9A] text-xs">
                                                <Clock className="w-3 h-3" />
                                                {estimatedTime + (type.id === 'kenda_moto' ? -1 : 2)} min
                                            </span>
                                        </div>
                                        <p className="text-[#9A9A9A] text-xs">{type.description}</p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-white font-bold text-lg">
                                            {externalDestination ? `${price.toLocaleString()} FC` : '--'}
                                        </p>
                                        <p className="text-[#9A9A9A] text-[10px] line-through">
                                            {externalDestination ? `${Math.round(price * 1.2).toLocaleString()} FC` : ''}
                                        </p>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="p-6 bg-[#121212] border-t border-[#1F1F1F] mt-2">
                    {/* Payment Method Selector */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setPaymentMethod(prev => prev === 'CASH' ? 'WALLET' : 'CASH')}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] rounded-full border border-[#2A2A2A] hover:bg-[#252525] transition-colors"
                        >
                            {paymentMethod === 'CASH' ? (
                                <DollarSign className="w-4 h-4 text-green-500" />
                            ) : (
                                <Wallet className="w-4 h-4 text-[#F0B90B]" />
                            )}
                            <span className="text-white text-sm font-medium">
                                {paymentMethod === 'CASH' ? 'Espèces' : 'Portefeuille'}
                            </span>
                            <ChevronRight className="w-4 h-4 text-[#9A9A9A]" />
                        </button>

                        <button className="flex items-center gap-2 text-[#9A9A9A] hover:text-white transition-colors">
                            <CalendarClock className="w-4 h-4" />
                            <span className="text-xs font-medium">Planifier</span>
                        </button>
                    </div>

                    {/* Order Button */}
                    <Button
                        disabled={!externalDestination}
                        onClick={() => onOrder?.(selectedRideType, currentPrice)}
                        className={cn(
                            "w-full h-16 rounded-2xl text-xl font-bold transition-all active:scale-95",
                            "bg-[#F0B90B] text-black hover:bg-[#F0B90B]/90 shadow-[0_4px_20px_rgba(240,185,11,0.3)]",
                            "disabled:opacity-50 disabled:grayscale"
                        )}
                    >
                        {externalDestination ? `${t('orderBtn')} ${currentRideType.name}` : t('selectDestination')}
                    </Button>

                    <div className="h-[env(safe-area-inset-bottom)]" />
                </div>
            </motion.div>
        </div>
    );
};

