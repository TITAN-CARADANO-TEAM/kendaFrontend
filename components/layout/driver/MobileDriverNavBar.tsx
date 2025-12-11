"use client";

import { Link, usePathname } from "@/lib/navigation";
import { LayoutDashboard, History, Wallet, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function MobileDriverNavBar() {
    const pathname = usePathname();
    const t = useTranslations('DriverNav');

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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#000000] border-t-2 border-[#F0B90B] pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center w-full h-full space-y-1 relative"
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#F0B90B] rounded-full" />
                            )}
                            <Icon
                                className={cn(
                                    "w-6 h-6 transition-colors duration-200",
                                    isActive ? "text-[#F0B90B]" : "text-[#9A9A9A]"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-[10px] font-medium transition-colors duration-200",
                                    isActive ? "text-[#F0B90B]" : "text-[#9A9A9A]"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
