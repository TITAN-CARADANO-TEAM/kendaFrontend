"use client";

import { DriverPendingVerification } from "@/components/driver/DriverPendingVerification";
import { useRouter } from "next/navigation";

export default function DriverPendingPage() {
    const router = useRouter();

    const handleContactSupport = () => {
        // Redirect to support or open email client
        window.location.href = "mailto:support@kenda.app?subject=Vérification Chauffeur";
    };

    const handleLogout = () => {
        // Clear session and redirect to login
        router.push("/login");
    };

    return (
        <DriverPendingVerification
            onContactSupport={handleContactSupport}
            onLogout={handleLogout}
        />
    );
}
