"use client";

import { DriverDashboard } from "@/components/driver/DriverDashboard";
import { useAuth } from "@/hooks/useAuth";

export default function DriverDashboardPage() {
    const { user } = useAuth();

    return (
        <DriverDashboard
            driverName={user?.user_metadata?.full_name}
            driverAvatar={user?.user_metadata?.avatar_url}
        />
    );
}
