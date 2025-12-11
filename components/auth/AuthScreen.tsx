"use client";

import React, { useState } from "react";
import { User, Lock, Mail, Phone, Loader2, Eye, EyeOff, Car, MapPin, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type UserRole = 'PASSENGER' | 'DRIVER';

interface AuthScreenProps {
    onAuthenticated?: (role: UserRole) => void;
    defaultRole?: UserRole;
}

// Message component for displaying errors/success
function AuthMessage({ type, message }: { type: 'error' | 'success'; message: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium",
                type === 'error'
                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                    : "bg-green-500/10 border border-green-500/20 text-green-400"
            )}
        >
            {type === 'error'
                ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
                : <CheckCircle className="w-4 h-4 flex-shrink-0" />
            }
            <span>{message}</span>
        </motion.div>
    );
}

export function AuthScreen({ onAuthenticated, defaultRole = 'PASSENGER' }: AuthScreenProps) {
    const t = useTranslations('Auth');
    const router = useRouter();

    // Form mode and role
    const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
    const [role, setRole] = useState<UserRole>(defaultRole);

    // Form fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [city, setCity] = useState("");

    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

    // Initialize Supabase client
    const supabase = createClient();

    // Clear message after delay
    const showMessage = (type: 'error' | 'success', text: string) => {
        setMessage({ type, text });
        if (type === 'success') {
            setTimeout(() => setMessage(null), 5000);
        }
    };

    // Handle Sign Up
    const handleSignup = async () => {
        // Validation
        if (!fullName.trim()) {
            showMessage('error', t('errorFullNameRequired') || 'Le nom complet est requis');
            return;
        }

        if (!email.trim()) {
            showMessage('error', t('errorEmailRequired') || 'L\'email est requis');
            return;
        }

        if (password.length < 6) {
            showMessage('error', t('errorPasswordTooShort') || 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('error', t('errorPasswordMismatch') || 'Les mots de passe ne correspondent pas');
            return;
        }

        if (role === 'DRIVER' && !city) {
            showMessage('error', t('errorCityRequired') || 'Veuillez sélectionner votre ville');
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    data: {
                        full_name: fullName.trim(),
                        phone: phone.trim() || null,
                        role: role,
                        city: role === 'DRIVER' ? city : null,
                    }
                }
            });

            if (error) {
                console.error('Signup error:', error);

                // Handle specific error messages
                if (error.message.includes('already registered')) {
                    showMessage('error', t('errorEmailExists') || 'Cet email est déjà utilisé');
                } else if (error.message.includes('invalid email')) {
                    showMessage('error', t('errorInvalidEmail') || 'Email invalide');
                } else {
                    showMessage('error', error.message);
                }
                return;
            }

            if (data.user) {
                // Check if email confirmation is required
                if (data.user.identities && data.user.identities.length === 0) {
                    showMessage('error', t('errorEmailExists') || 'Cet email est déjà utilisé');
                    return;
                }

                // Check if session exists (email confirmation is disabled)
                if (data.session) {
                    // User is automatically logged in - redirect based on role
                    showMessage('success', t('signupSuccessAutoLogin') || 'Compte créé ! Connexion automatique...');

                    setTimeout(() => {
                        if (onAuthenticated) {
                            onAuthenticated(role);
                        } else {
                            if (role === 'DRIVER') {
                                router.push('/driver-application');
                            } else {
                                router.push('/map');
                            }
                        }
                    }, 1000);
                } else {
                    // Email confirmation is required
                    showMessage('success', t('signupSuccessConfirmEmail') || 'Compte créé ! Vérifiez votre email pour confirmer votre inscription.');

                    // Clear form and switch to login
                    setFullName("");
                    setPhone("");
                    setPassword("");
                    setConfirmPassword("");
                    setCity("");

                    // Auto-switch to login after delay
                    setTimeout(() => {
                        setMode('LOGIN');
                        setMessage(null);
                    }, 4000);
                }
            }

        } catch (err) {
            console.error('Unexpected signup error:', err);
            showMessage('error', t('errorUnexpected') || 'Une erreur inattendue s\'est produite');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Login
    const handleLogin = async () => {
        if (!email.trim()) {
            showMessage('error', t('errorEmailRequired') || 'L\'email est requis');
            return;
        }

        if (!password) {
            showMessage('error', t('errorPasswordRequired') || 'Le mot de passe est requis');
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) {
                console.error('Login error:', error);

                // Handle specific error messages
                if (error.message.includes('Invalid login credentials')) {
                    showMessage('error', t('errorInvalidCredentials') || 'Email ou mot de passe incorrect');
                } else if (error.message.includes('Email not confirmed')) {
                    showMessage('error', t('errorEmailNotConfirmed') || 'Veuillez confirmer votre email');
                } else {
                    showMessage('error', error.message);
                }
                return;
            }

            if (data.user) {
                // Get user role from metadata
                const userRole = (data.user.user_metadata?.role as UserRole) || 'PASSENGER';

                showMessage('success', t('loginSuccess') || 'Connexion réussie !');

                // Call callback if provided
                if (onAuthenticated) {
                    onAuthenticated(userRole);
                    return;
                }

                // Default navigation based on role
                setTimeout(() => {
                    if (userRole === 'DRIVER') {
                        // Check if driver profile exists or needs application
                        // For now, redirect to dashboard
                        router.push('/driver/dashboard');
                    } else {
                        // Passenger goes to map
                        router.push('/map');
                    }
                }, 500);
            }

        } catch (err) {
            console.error('Unexpected login error:', err);
            showMessage('error', t('errorUnexpected') || 'Une erreur inattendue s\'est produite');
        } finally {
            setIsLoading(false);
        }
    };

    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'SIGNUP') {
            await handleSignup();
        } else {
            await handleLogin();
        }
    };

    // Reset form when switching modes
    const handleModeChange = (newMode: 'LOGIN' | 'SIGNUP') => {
        setMode(newMode);
        setMessage(null);
        // Keep email for convenience when switching
        setPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="min-h-[100dvh] w-full bg-black text-white flex items-center justify-center p-6 overflow-y-auto">
            <div className="w-full max-w-md bg-black md:bg-[#0C0C0C] md:border md:border-[#1A1A1A] md:rounded-3xl md:p-8 md:shadow-2xl flex flex-col h-full md:h-auto min-h-[500px]">
                {/* Logo Section */}
                <div className="flex flex-col items-center mt-6 md:mt-0 mb-10">
                    <div className="flex items-center gap-4 mb-2">
                        <Image
                            src="/logo.jpg"
                            alt="KENDA Logo"
                            width={64}
                            height={64}
                            className="rounded-2xl"
                        />
                        <h1 className="font-heading font-bold text-4xl text-white tracking-tight">
                            KENDA
                        </h1>
                    </div>
                    <p className="text-[#9A9A9A] text-sm font-medium tracking-wide uppercase">
                        {t('headerSubtitle')}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex w-full mb-6 border-b border-[#1A1A1A]">
                    <button
                        onClick={() => handleModeChange('LOGIN')}
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
                        onClick={() => handleModeChange('SIGNUP')}
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

                {/* Message Display */}
                <AnimatePresence mode="wait">
                    {message && (
                        <div className="mb-4">
                            <AuthMessage type={message.type} message={message.text} />
                        </div>
                    )}
                </AnimatePresence>

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

                            {/* Full Name - Signup only */}
                            {mode === 'SIGNUP' && (
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <Input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder={t('fullName')}
                                        className="h-14 pl-12 bg-[#0C0C0C] md:bg-black border-[#1A1A1A] text-white placeholder:text-[#666] focus-visible:ring-[#F0B90B]/50 rounded-xl"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            )}

                            {/* Phone - Signup only */}
                            {mode === 'SIGNUP' && (
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <Input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder={t('phone') || '+243 ...'}
                                        className="h-14 pl-12 bg-[#0C0C0C] md:bg-black border-[#1A1A1A] text-white placeholder:text-[#666] focus-visible:ring-[#F0B90B]/50 rounded-xl"
                                        disabled={isLoading}
                                    />
                                </div>
                            )}

                            {/* Email */}
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('email') || 'Email'}
                                    className="h-14 pl-12 bg-[#0C0C0C] md:bg-black border-[#1A1A1A] text-white placeholder:text-[#666] focus-visible:ring-[#F0B90B]/50 rounded-xl"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('password')}
                                    className="h-14 pl-12 pr-12 bg-[#0C0C0C] md:bg-black border-[#1A1A1A] text-white placeholder:text-[#666] focus-visible:ring-[#F0B90B]/50 rounded-xl"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A9A9A] hover:text-white"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Confirm Password - Signup only */}
                            {mode === 'SIGNUP' && (
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={t('confirmPassword')}
                                        className="h-14 pl-12 bg-[#0C0C0C] md:bg-black border-[#1A1A1A] text-white placeholder:text-[#666] focus-visible:ring-[#F0B90B]/50 rounded-xl"
                                        required
                                        disabled={isLoading}
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
                                        className="h-14 w-full pl-12 pr-4 bg-[#0C0C0C] md:bg-black border border-[#1A1A1A] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 appearance-none cursor-pointer disabled:opacity-50"
                                        required
                                        disabled={isLoading}
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
                            className="w-full h-14 bg-[#F0B90B] text-black font-bold text-lg rounded-xl hover:bg-[#F0B90B]/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
                                disabled={isLoading}
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
