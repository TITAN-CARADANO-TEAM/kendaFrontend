import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { NavigationWrapper } from "@/components/layout/NavigationWrapper";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
    display: "swap",
});

export const metadata: Metadata = {
    title: "KENDA - Urban Mobility on Cardano",
    description: "Decentralized urban mobility platform powered by Cardano blockchain",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${manrope.variable} antialiased h-dvh w-screen overflow-hidden bg-black text-white flex`}>
                <NavigationWrapper>
                    {children}
                </NavigationWrapper>
            </body>
        </html>
    );
}
