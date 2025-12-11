import { Metadata } from "next";
import { DriverDashboard } from "@/components/driver/DriverDashboard";

export const metadata: Metadata = {
    title: "Tableau de Bord Chauffeur | KENDA",
    description: "Gérez vos courses, suivez vos revenus et recevez des demandes de transport.",
};

export default function DriverDashboardPage() {
    return <DriverDashboard />;
}
