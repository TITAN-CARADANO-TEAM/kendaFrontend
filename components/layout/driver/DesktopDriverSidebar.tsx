"use client";

import { Link, usePathname } from "@/lib/navigation";
import { LayoutDashboard, History, Wallet, UserCog, LogOut, ArrowLeftRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function DesktopDriverSidebar() {
    const pathname = usePathname();
    const t = useTranslations('DriverNav');
    const tCommon = useTranslations('Common');

    const navItems = [
        {
            label: t('dashboard'),
            href: "/driver/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: t('history'),
            href: "/driver/history",
            icon: History,
        },
        {
            label: t('wallet'),
            href: "/driver/wallet",
            icon: Wallet,
        },
        {
            label: t('profile'),
            href: "/driver/profile",
            icon: UserCog,
        },
    ];

    return (
        <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-[#0C0C0C] border-r border-[#1A1A1A] flex-col z-50">
            {/* Logo Section with Driver Badge */}
            <div className="p-6 border-b border-[#1A1A1A]">
                <div className="flex items-center gap-4 mb-3">
                    <Image
                        src="/logo.jpg"
                        alt="KENDA Logo"
                        width={56}
                        height={56}
                        className="rounded-xl"
                    />
                    <h1 className="font-heading font-bold text-2xl text-white tracking-tight">
                        KENDA
                    </h1>
                </div>
                {/* Driver Badge */}
                <div className="flex items-center gap-2 bg-[#F0B90B]/10 border border-[#F0B90B]/30 rounded-lg px-3 py-2">
                    <Shield className="w-4 h-4 text-[#F0B90B]" />
                    <span className="text-xs font-bold text-[#F0B90B] uppercase tracking-wider">
                        {t('driverSpace')}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-[#F0B90B]/10 text-[#F0B90B] border border-[#F0B90B]/30"
                                    : "text-[#9A9A9A] hover:text-white hover:bg-[#151515]"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F0B90B]" />
                            )}
                            <Icon className={cn("w-5 h-5", isActive ? "text-[#F0B90B]" : "text-current")} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[#1A1A1A] space-y-3">
                {/* Switch to Passenger Mode */}
                <Link href="/map">
                    <Button
                        variant="outline"
                        className="w-full justify-start border-[#333333] text-white hover:bg-[#1A1A1A] hover:border-[#F0B90B] h-11"
                    >
                        <ArrowLeftRight className="w-4 h-4 mr-3 text-[#F0B90B]" />
                        <span className="text-sm">{t('switchToPassenger')}</span>
                    </Button>
                </Link>

                {/* Logout Button */}
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 h-11"
                    onClick={() => alert("Fonctionnalité à venir")}
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    {t('logout')}
                </Button>

                {/* Version Info */}
                <p className="text-center text-[10px] text-[#666] pt-2">
                    KENDA Driver v1.0.2
                </p>
            </div>
        </aside>
    );
}
