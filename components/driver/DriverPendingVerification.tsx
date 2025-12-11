"use client";
import React from "react";
import {
    ShieldAlert,
    Clock,
    FileText,
    User,
    CheckCircle2,
    RefreshCw,
    Mail,
    Bell,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface DriverPendingVerificationProps {
    onContactSupport?: () => void;
    onLogout?: () => void;
}

export function DriverPendingVerification({
    onContactSupport,
    onLogout
}: DriverPendingVerificationProps) {
    const t = useTranslations('Driver');
    const { user } = useAuth();
    const router = useRouter();
    const supabase = createClient();
    const [isValidating, setIsValidating] = useState(false);

    // Auto-validate simulation (for demo purposes)
    useEffect(() => {
        if (!user) return;

        console.log("Validation simulation started. Waiting 15s...");
        const timer = setTimeout(async () => {
            setIsValidating(true);
            try {
                // Update driver profile status
                const { error: profileError } = await supabase
                    .from('driver_profiles')
                    .update({ status: 'VERIFIED' })
                    .eq('user_id', user.id);

                if (profileError) console.error("Error updating profile:", profileError);

                // Also update user verification status (if allowed by RLS, otherwise might fail but we proceed)
                // Note: 'users' table update might be restricted. If so, ignore error for demo.
                const { error: userError } = await supabase
                    .from('users')
                    .update({ is_verified: true })
                    .eq('id', user.id);

                if (userError) console.error("Error updating user verification:", userError);

                // Redirect to dashboard
                console.log("Validation complete, redirecting...");
                router.push('/driver/dashboard');
            } catch (error) {
                console.error("Simulation error:", error);
            }
        }, 15000); // 15 seconds

        return () => clearTimeout(timer);
    }, [user, router, supabase]);

    const driverName = user?.user_metadata?.full_name || "Chauffeur";
    const submittedDate = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
    const estimatedDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

    const handleRefresh = () => {
        // Simulate API call to check verification status
        window.location.reload();
    };

    const verificationSteps = [
        {
            icon: <FileText className="w-4 h-4" />,
            label: t('stepDocuments'),
            status: "in-progress" as const,
            time: t('statusInProgress')
        },
        {
            icon: <User className="w-4 h-4" />,
            label: t('stepAuthorities'),
            status: "pending" as const,
            time: "12-24h"
        },
        {
            icon: <CheckCircle2 className="w-4 h-4" />,
            label: t('stepActivation'),
            status: "pending" as const,
            time: "24-48h"
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <div className="pt-safe px-6 py-6 border-b border-[#1A1A1A]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Image
                            src="/logo.jpg"
                            alt="KENDA Logo"
                            width={48}
                            height={48}
                            className="rounded-xl"
                        />
                        <div>
                            <h1 className="text-2xl font-heading font-bold">KENDA</h1>
                            <p className="text-xs text-[#9A9A9A] uppercase tracking-widest">{t('driverSpace')}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="text-sm text-[#9A9A9A] hover:text-white transition-colors"
                    >
                        {t('logout', { fallback: 'Déconnexion' })}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-6 py-12">
                <div className="w-full max-w-md mx-auto space-y-8">
                    {/* Animated Icon */}
                    <div className="relative mx-auto w-32 h-32 mb-8">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-2 border-dashed border-[#F0B90B]/30"
                        />
                        <div className="absolute inset-4 rounded-full bg-[#F0B90B]/10 border-2 border-[#F0B90B]/30 flex items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <ShieldAlert className="w-12 h-12 text-[#F0B90B]" />
                            </motion.div>
                        </div>
                        <div className="absolute inset-0 rounded-full bg-[#F0B90B]/5 animate-ping" />
                    </div>

                    {/* Title */}
                    <div className="text-center">
                        <h2 className="text-3xl font-heading font-bold mb-3">
                            {t('pendingVerification')}
                        </h2>
                        <p className="text-[#9A9A9A] leading-relaxed">
                            {t.rich('welcome', {
                                name: driverName,
                                span: (chunks) => <span className="text-white font-bold">{chunks}</span>
                            })}
                        </p>
                        <p className="text-[#9A9A9A] leading-relaxed mt-2">
                            {t('pendingSubtitle')}
                        </p>
                    </div>

                    {/* Status Card */}
                    <Card className="bg-[#0C0C0C] border-[#1A1A1A]">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#F0B90B]" />
                                    <span className="text-sm font-bold text-white">{t('statusVerification')}</span>
                                </div>
                                <button
                                    onClick={handleRefresh}
                                    className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors group"
                                >
                                    <RefreshCw className="w-4 h-4 text-[#9A9A9A] group-hover:text-[#F0B90B] group-hover:rotate-180 transition-all" />
                                </button>
                            </div>

                            <div className="space-y-3 mb-4">
                                {verificationSteps.map((step, index) => (
                                    <VerificationStep
                                        key={index}
                                        icon={step.icon}
                                        label={step.label}
                                        status={step.status}
                                        time={step.time}
                                    />
                                ))}
                            </div>

                            <div className="pt-4 border-t border-[#1A1A1A] space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-[#666]">{t('submissionDate')}:</span>
                                    <span className="text-white">{submittedDate}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[#666]">{t('estimatedCompletion')}:</span>
                                    <span className="text-[#F0B90B] font-bold">{estimatedDate}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Cards */}
                    <div className="space-y-4">
                        {/* Notification Card */}
                        <Card className="bg-gradient-to-r from-[#F0B90B]/10 to-transparent border-l-4 border-[#F0B90B]">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Bell className="w-5 h-5 text-[#F0B90B] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">
                                            {t('notificationTitle')}
                                        </p>
                                        <p className="text-xs text-[#9A9A9A] leading-relaxed">
                                            {t('notificationDesc')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* What's Next Card */}
                        <Card className="bg-[#0C0C0C] border-[#1A1A1A]">
                            <CardContent className="p-4">
                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4 text-[#F0B90B]" />
                                    {t('whileWaiting')}
                                </h3>
                                <ul className="space-y-2 text-xs text-[#9A9A9A]">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#F0B90B] mt-0.5">•</span>
                                        <span>{t('waitingTip1')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#F0B90B] mt-0.5">•</span>
                                        <span>{t('waitingTip2')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#F0B90B] mt-0.5">•</span>
                                        <span>{t('waitingTip3')}</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            onClick={onContactSupport}
                            variant="outline"
                            className="w-full h-12 border-[#333333] text-white hover:bg-[#1A1A1A] hover:border-[#F0B90B]"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            {t('contactSupport')}
                        </Button>

                        <p className="text-center text-xs text-[#666]">
                            {t('averageDelay')} : <span className="text-[#F0B90B] font-bold">{t('hours2448')}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-6 border-t border-[#1A1A1A] pb-safe">
                <p className="text-center text-xs text-[#666]">
                    © 2025 KENDA • Version 1.0.2
                </p>
            </div>
        </div>
    );
}

// Sub-component
function VerificationStep({
    icon,
    label,
    status,
    time
}: {
    icon: React.ReactNode;
    label: string;
    status: 'in-progress' | 'pending' | 'completed';
    time: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                    status === 'in-progress' && "bg-[#F0B90B]/20 text-[#F0B90B] animate-pulse",
                    status === 'pending' && "bg-[#1A1A1A] text-[#666]",
                    status === 'completed' && "bg-green-500/20 text-green-500"
                )}
            >
                {icon}
            </div>
            <div className="flex-1">
                <p className={cn(
                    "text-sm font-medium",
                    status === 'in-progress' && "text-white",
                    status === 'pending' && "text-[#9A9A9A]",
                    status === 'completed' && "text-white"
                )}>
                    {label}
                </p>
            </div>
            <span className={cn(
                "text-xs",
                status === 'in-progress' && "text-[#F0B90B] font-bold",
                status === 'pending' && "text-[#666]",
                status === 'completed' && "text-green-500"
            )}>
                {time}
            </span>
        </div>
    );
}
