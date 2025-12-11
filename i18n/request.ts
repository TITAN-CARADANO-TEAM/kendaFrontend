import { getRequestConfig } from 'next-intl/server';

const locales = ['fr', 'en', 'sw'] as const;
type Locale = typeof locales[number];

export default getRequestConfig(async ({ requestLocale }) => {
    // Get the locale from the request (set by middleware)
    let locale = await requestLocale;

    // Validate that the incoming `locale` parameter is valid
    if (!locale || !locales.includes(locale as Locale)) {
        locale = 'fr'; // Fallback locale
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});

