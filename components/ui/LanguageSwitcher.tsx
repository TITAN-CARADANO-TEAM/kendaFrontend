'use client';

import { useLocale } from 'next-intl';
import { usePathname } from '@/lib/navigation';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import { useRouter as useNextRouter } from 'next/navigation';

export default function LanguageSwitcher() {
    const [isPending, startTransition] = useTransition();
    const locale = useLocale();
    const pathname = usePathname(); // Returns path WITHOUT locale prefix (e.g., "/account")
    const nextRouter = useNextRouter(); // Use Next.js router for direct navigation

    const onSelectChange = (nextLocale: string) => {
        startTransition(() => {
            // Construct the new URL with the new locale prefix
            // pathname from next-intl/navigation doesn't include locale, so we add it
            const newPath = `/${nextLocale}${pathname === '/' ? '' : pathname}`;
            nextRouter.replace(newPath);
        });
    };

    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <Globe className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <select
                    value={locale}
                    onChange={(e) => onSelectChange(e.target.value)}
                    disabled={isPending}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="fr">Français</option>
                    <option value="en">English (US)</option>
                    <option value="sw">Kiswahili</option>
                </select>
            </div>
        </div>
    );
}

