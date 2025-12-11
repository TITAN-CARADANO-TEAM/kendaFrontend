"use client";

import React, { useState } from "react";
import { User, Lock, Mail, Phone, Loader2, Eye, EyeOff, Car, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";

type UserRole = 'PASSENGER' | 'DRIVER';

interface AuthScreenProps {
    onAuthenticated?: (role: UserRole) => void;
    defaultRole?: UserRole;
}

export function AuthScreen({ onAuthenticated, defaultRole = 'PASSENGER' }: AuthScreenProps) {
    const t = useTranslations('Auth');
    const router = useRouter();
    const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
    const [role, setRole] = useState<UserRole>(defaultRole);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [city, setCity] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            if (onAuthenticated) {
                onAuthenticated(role);
            } else {
                // Default behavior based on role - using locale-aware router
                if (role === 'DRIVER') {
                    if (mode === 'SIGNUP') {
                        // New driver registration - go to application form
                        router.push('/driver-application');
                    } else {
                        // Existing driver login - go to driver dashboard
                        // In a real app, you would check if the driver is verified
                        // and redirect to driver-pending if not verified yet
                        router.push('/driver-dashboard');
                    }
                } else {
                    // Passenger - go to map
                    router.push('/map');
                }
            }
        }, 1500);
    };

    return (
        <div className="min-h-[100dvh] w-full bg-black text-white flex items-center justify-center p-6 overflow-y-auto">
            <div className="w-full max-w-md bg-black md:bg-[#0C0C0C] md:border md:border-[#1A1A1A] md:rounded-3xl md:p-8 md:shadow-2xl flex flex-col h-full md:h-auto min-h-[500px]">
                {/* Logo Section */}
                <div className="flex flex-col items-center mt-6 md:mt-0 mb-10">
                    <h1 className="font-heading font-bold text-4xl text-white tracking-tight mb-2">
                        KENDA
                    </h1>
                    <p className="text-[#9A9A9A] text-sm font-medium tracking-wide uppercase">
                        {t('headerSubtitle')}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex w-full mb-8 border-b border-[#1A1A1A]">
                    <button
                        onClick={() => setMode('LOGIN')}
                        className={cn(
                            "flex-1 pb-3 text-sm font-bold transition-all relative",
                            mode === 'LOGIN' ? "text-white" : "text-[#9A9A9A]"
                        )}
                    >
                        {t('loginTab')}
                        {mode === 'LOGIN' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F0B90B]"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setMode('SIGNUP')}
                        className={cn(
                            "flex-1 pb-3 text-sm font-bold transition-all relative",
                            mode === 'SIGNUP' ? "text-white" : "text-[#9A9A9A]"
                        )}
                    >
                        {t('signupTab')}
                        {mode === 'SIGNUP' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F0B90B]"
                            />
                        )}
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: mode === 'LOGIN' ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: mode === 'LOGIN' ? 20 : -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4 w-full"
                        >
                            {/* Role Selector - Only in SIGNUP mode */}
                            {mode === 'SIGNUP' && (
                                <div className="mb-2">
                                    <label className="text-xs font-bold text-[#9A9A9A] uppercase tracking-wider mb-2 block">
                                        {t('registerAs')}
                                    </label>
                                    <div className="flex items-center gap-2 bg-[#1A1A1A] p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setRole('PASSENGER')}
                                            className={cn(
                                                "flex-1 py-3 px-4 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2",
                                                role === 'PASSENGER'
                                                    ? "bg-[#F0B90B] text-black shadow-lg"
                                                    : "bg-transparent text-[#9A9A9A] hover:text-white"
                                            )}
                                        >
                                            <User className="w-4 h-4" />
                                            {t('passenger')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('DRIVER')}
                                            className={cn(
                                                "flex-1 py-3 px-4 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2",
                                                role === 'DRIVER'
                                                    ? "bg-[#F0B90B] text-black shadow-lg"
                                                    : "bg-transparent text-[#9A9A9A] hover:text-white"
                                            )}
                                        >
                                            <Car className="w-4 h-4" />
                                            {t('driver')}
                                        </button>
                                    </div>

                                    {/* Partner Badge - Only when Driver is selected */}
                                    {role === 'DRIVER' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-3 flex items-center gap-2 bg-[#F0B90B]/10 border border-[#F0B90B]/20 rounded-lg px-3 py-2"
                                        >
                                            <Shield className="w-4 h-4 text-[#F0B90B]" />
                                            <span className="text-xs text-[#F0B90B] font-bold">
                                                {t('proSpace')}
                                            </span>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {mode === 'SIGNUP' && (
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <Input
                                        placeholder={t('fullName')}
                                        className="h-14 pl-12 bg-[#0C0C0C] md:bg-black border-[#1A1A1A] text-white placeholder:text-[#666] focus-visible:ring-[#F0B90B]/50 rounded-xl"
                                        required
                                    />
                                </div>
                            )}

                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder={t('emailPhone')}
                                    className="h-14 pl-12 bg-[#0C0C0C] md:bg-black border-[#1A1A1A] text-white placeholder:text-[#666] focus-visible:ring-[#F0B90B]/50 rounded-xl"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('password')}
                                    className="h-14 pl-12 pr-12 bg-[#0C0C0C] md:bg-black border-[#1A1A1A] text-white placeholder:text-[#666] focus-visible:ring-[#F0B90B]/50 rounded-xl"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A9A9A] hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {mode === 'SIGNUP' && (
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder={t('confirmPassword')}
                                        className="h-14 pl-12 bg-[#0C0C0C] md:bg-black border-[#1A1A1A] text-white placeholder:text-[#666] focus-visible:ring-[#F0B90B]/50 rounded-xl"
                                        required
                                    />
                                </div>
                            )}

                            {/* City Field - Only for Driver Signup */}
                            {mode === 'SIGNUP' && role === 'DRIVER' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="relative"
                                >
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <select
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="h-14 w-full pl-12 pr-4 bg-[#0C0C0C] md:bg-black border border-[#1A1A1A] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="" disabled className="bg-[#0C0C0C] text-[#666]">
                                            {t('cityPlaceholder')}
                                        </option>
                                        <option value="goma" className="bg-[#0C0C0C]">Goma</option>
                                        <option value="bukavu" className="bg-[#0C0C0C]">Bukavu</option>
                                        <option value="kinshasa" className="bg-[#0C0C0C]">Kinshasa</option>
                                        <option value="lubumbashi" className="bg-[#0C0C0C]">Lubumbashi</option>
                                    </select>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-auto pt-8 mb-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-[#F0B90B] text-black font-bold text-lg rounded-xl hover:bg-[#F0B90B]/90 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                mode === 'LOGIN'
                                    ? t('loginAction')
                                    : role === 'DRIVER'
                                        ? t('startApplication')
                                        : t('createAccount')
                            )}
                        </Button>

                        {/* Driver Signup Notice */}
                        {mode === 'SIGNUP' && role === 'DRIVER' && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-3 text-xs text-center text-[#9A9A9A] leading-relaxed"
                            >
                                <Car className="w-3 h-3 inline mr-1" />
                                {t('driverNotice')}
                            </motion.p>
                        )}

                        {mode === 'LOGIN' && (
                            <button
                                type="button"
                                className="w-full mt-4 text-sm text-[#9A9A9A] hover:text-white underline decoration-[#9A9A9A] underline-offset-4"
                            >
                                {t('forgotPassword')}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
