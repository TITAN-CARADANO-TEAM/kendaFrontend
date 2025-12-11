"use client";

import { AuthScreen } from "@/components/auth/AuthScreen";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role');

    // Convert query param to proper role type
    const defaultRole = role === 'driver' ? 'DRIVER' : 'PASSENGER';

    return <AuthScreen defaultRole={defaultRole} />;
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <LoginContent />
        </Suspense>
    );
}
