import { MobileDriverNavBar } from "@/components/layout/driver/MobileDriverNavBar";
import { DesktopDriverSidebar } from "@/components/layout/driver/DesktopDriverSidebar";

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full w-full bg-black text-white">
            {/* Desktop Sidebar - Hidden on mobile */}
            <DesktopDriverSidebar />

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-y-auto md:ml-64 pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation - Hidden on desktop */}
            <MobileDriverNavBar />
        </div>
    );
}
