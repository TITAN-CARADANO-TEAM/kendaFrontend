"use client";

import React, { useState, useEffect } from "react";
import {
    UserCog,
    Star,
    Car,
    FileText,
    Shield,
    ChevronRight,
    Camera,
    Award,
    Phone,
    Mail,
    MapPin,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Edit3,
    Lock,
    Fuel,
    Calendar,
    CreditCard,
    Route,
    Banknote
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "framer-motion";

// Document status type
type DocumentStatus = "valid" | "expiring" | "missing" | "expired";

interface Document {
    id: string;
    name: string;
    status: DocumentStatus;
    expiryDate?: string;
    icon: React.ReactNode;
}

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export default function DriverProfilePage() {
    const { user } = useAuth();
    const supabase = createClient();

    // Preferences state
    const [acceptLongDistance, setAcceptLongDistance] = useState(true);
    const [acceptCashPayment, setAcceptCashPayment] = useState(true);
    const [acceptCryptoPayment, setAcceptCryptoPayment] = useState(false);

    const [driverInfo, setDriverInfo] = useState<any>({
        name: "Chargement...",
        phone: "...",
        email: "...",
        city: "...",
        rating: 5.0,
        totalRides: 0,
        totalKm: 0,
        memberSince: "...",
        walletAddress: "...",
        isVerifiedOnChain: false,
        vehicle: {
            type: "...",
            brand: "...",
            model: "...",
            year: "...",
            plate: "...",
            color: "...",
            isValidated: false
        }
    });

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            // Fetch Rides count for stats
            const { count: rideCount } = await supabase
                .from('rides')
                .select('*', { count: 'exact', head: true })
                .eq('driver_id', user.id);

            const { data } = await supabase
                .from('driver_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) {
                const d = data as any;
                setDriverInfo({
                    name: user.user_metadata?.full_name || "Chauffeur",
                    phone: user.phone || "Non renseigné",
                    email: user.email,
                    city: "Goma, Nord-Kivu", // Defaut
                    rating: d.rating || 5.0,
                    totalRides: rideCount || 0,
                    totalKm: 0, // Placeholder
                    memberSince: new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
                    walletAddress: "addr1...", // Placeholder
                    isVerifiedOnChain: d.status === 'VERIFIED',
                    vehicle: {
                        type: d.vehicle_type || "Taxi",
                        brand: d.vehicle_brand || "-",
                        model: d.vehicle_model || "-",
                        year: d.vehicle_year?.toString() || "-",
                        plate: d.license_plate || "-",
                        color: d.vehicle_color || "-",
                        isValidated: d.status === 'VERIFIED'
                    }
                });
            }
        };
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const documents: Document[] = [
        {
            id: "1",
            name: "Permis de Conduire",
            status: "valid",
            expiryDate: "15 Mars 2027",
            icon: <FileText className="w-5 h-5" />
        },
        {
            id: "2",
            name: "Carte Rose (Immatriculation)",
            status: "valid",
            expiryDate: "N/A",
            icon: <Car className="w-5 h-5" />
        },
        {
            id: "3",
            name: "Assurance RC",
            status: "expiring",
            expiryDate: "20 Déc 2025",
            icon: <Shield className="w-5 h-5" />
        },
        {
            id: "4",
            name: "Contrôle Technique",
            status: "valid",
            expiryDate: "01 Juin 2026",
            icon: <Fuel className="w-5 h-5" />
        },
        {
            id: "5",
            name: "Casier Judiciaire",
            status: "missing",
            icon: <FileText className="w-5 h-5" />
        },
    ];

    const getStatusConfig = (status: DocumentStatus) => {
        switch (status) {
            case "valid":
                return {
                    color: "text-green-500",
                    bg: "bg-green-500/10",
                    label: "Valide",
                    icon: <CheckCircle2 className="w-4 h-4" />
                };
            case "expiring":
                return {
                    color: "text-orange-500",
                    bg: "bg-orange-500/10",
                    label: "Expire bientôt",
                    icon: <AlertTriangle className="w-4 h-4" />
                };
            case "expired":
                return {
                    color: "text-red-500",
                    bg: "bg-red-500/10",
                    label: "Expiré",
                    icon: <XCircle className="w-4 h-4" />
                };
            case "missing":
                return {
                    color: "text-red-500",
                    bg: "bg-red-500/10",
                    label: "Manquant",
                    icon: <XCircle className="w-4 h-4" />
                };
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-24 overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/10 flex items-center justify-center">
                        <UserCog className="w-5 h-5 text-[#F0B90B]" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold">Profil Chauffeur</h1>
                </div>
                <p className="text-[#9A9A9A] text-sm">Gérez votre profil professionnel et vos documents</p>
            </div>

            {/* ========== PROFILE HEADER ========== */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="bg-gradient-to-br from-[#0C0C0C] to-[#151515] border-[#1A1A1A] mb-6 overflow-hidden relative">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/5 rounded-full blur-3xl" />

                    <CardContent className="p-6 relative">
                        <div className="flex items-start gap-4 mb-6">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="w-24 h-24 rounded-2xl bg-[#1A1A1A] border-2 border-[#F0B90B] flex items-center justify-center overflow-hidden">
                                    <Image
                                        src="/logo.jpg"
                                        alt="Avatar"
                                        width={96}
                                        height={96}
                                        className="object-cover"
                                    />
                                </div>
                                <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#F0B90B] flex items-center justify-center shadow-lg hover:bg-[#D4A50A] transition-colors">
                                    <Camera className="w-4 h-4 text-black" />
                                </button>
                                {/* Rating Badge */}
                                <div className="absolute -top-2 -left-2 flex items-center gap-1 bg-[#1A1A1A] border border-[#333] rounded-full px-2 py-1">
                                    <Star className="w-3 h-3 text-[#F0B90B] fill-[#F0B90B]" />
                                    <span className="text-xs font-bold text-white">{driverInfo.rating}</span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-white truncate">{driverInfo.name}</h2>
                                <p className="text-sm text-[#9A9A9A] mb-3">{driverInfo.city}</p>

                                {/* Blockchain Verification Badge */}
                                {driverInfo.isVerifiedOnChain && (
                                    <motion.div
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F0B90B]/20 to-[#F0B90B]/5 border border-[#F0B90B]/30 rounded-full px-3 py-1.5"
                                    >
                                        <div className="relative">
                                            <Shield className="w-4 h-4 text-[#F0B90B]" />
                                            <CheckCircle2 className="w-2.5 h-2.5 text-[#F0B90B] absolute -bottom-0.5 -right-0.5 fill-black" />
                                        </div>
                                        <span className="text-xs font-bold text-[#F0B90B]">
                                            Identité Vérifiée sur Cardano
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[#0C0C0C] border border-[#1A1A1A] rounded-xl p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Star className="w-4 h-4 text-[#F0B90B] fill-[#F0B90B]" />
                                    <span className="text-lg font-bold text-white">{driverInfo.rating}</span>
                                </div>
                                <p className="text-[10px] text-[#666] uppercase tracking-wider">Note</p>
                            </div>
                            <div className="bg-[#0C0C0C] border border-[#1A1A1A] rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-white">{driverInfo.totalRides}</p>
                                <p className="text-[10px] text-[#666] uppercase tracking-wider">Courses</p>
                            </div>
                            <div className="bg-[#0C0C0C] border border-[#1A1A1A] rounded-xl p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Award className="w-4 h-4 text-[#F0B90B]" />
                                </div>
                                <p className="text-[10px] text-[#666] uppercase tracking-wider">Top Driver</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ========== CONTACT INFO ========== */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Card className="bg-[#0C0C0C] border-[#1A1A1A] mb-6">
                    <CardContent className="p-4">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#F0B90B]" />
                            Informations de Contact
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-[#666]" />
                                    <span className="text-sm text-[#9A9A9A]">{driverInfo.phone}</span>
                                </div>
                                <button className="text-[#F0B90B] text-xs">Modifier</button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-[#666]" />
                                    <span className="text-sm text-[#9A9A9A]">{driverInfo.email}</span>
                                </div>
                                <button className="text-[#F0B90B] text-xs">Modifier</button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-[#666]" />
                                    <span className="text-sm text-[#9A9A9A]">{driverInfo.city}</span>
                                </div>
                                <button className="text-[#F0B90B] text-xs">Modifier</button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ========== MY VEHICLE SECTION ========== */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card className="bg-[#0C0C0C] border-[#1A1A1A] mb-6 overflow-hidden">
                    <CardContent className="p-0">
                        {/* Vehicle Header */}
                        <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/10 flex items-center justify-center">
                                    <Car className="w-5 h-5 text-[#F0B90B]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Mon Véhicule</h3>
                                    <p className="text-xs text-[#666]">Informations de votre transport</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={driverInfo.vehicle.isValidated}
                                className={cn(
                                    "border-[#333] text-xs h-8",
                                    driverInfo.vehicle.isValidated
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:border-[#F0B90B] hover:text-[#F0B90B]"
                                )}
                            >
                                {driverInfo.vehicle.isValidated ? (
                                    <>
                                        <Lock className="w-3 h-3 mr-1" />
                                        Validé
                                    </>
                                ) : (
                                    <>
                                        <Edit3 className="w-3 h-3 mr-1" />
                                        Modifier
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Vehicle Photo & Info */}
                        <div className="p-4">
                            <div className="flex gap-4">
                                {/* Vehicle Image Placeholder */}
                                <div className="w-28 h-20 rounded-xl bg-[#151515] border border-[#1A1A1A] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    <div className="text-center">
                                        <Car className="w-8 h-8 text-[#333] mx-auto mb-1" />
                                        <span className="text-[10px] text-[#666]">Moto-Taxi</span>
                                    </div>
                                </div>

                                {/* Vehicle Details */}
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[10px] text-[#666] uppercase tracking-wider">Marque</p>
                                        <p className="text-sm font-medium text-white">{driverInfo.vehicle.brand}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#666] uppercase tracking-wider">Modèle</p>
                                        <p className="text-sm font-medium text-white">{driverInfo.vehicle.model}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#666] uppercase tracking-wider">Plaque</p>
                                        <p className="text-sm font-bold text-[#F0B90B]">{driverInfo.vehicle.plate}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#666] uppercase tracking-wider">Année</p>
                                        <p className="text-sm font-medium text-white">{driverInfo.vehicle.year}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Validation Status */}
                            {driverInfo.vehicle.isValidated && (
                                <div className="mt-4 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span className="text-xs text-green-500 font-medium">
                                        Véhicule vérifié et approuvé par KENDA
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ========== DOCUMENTS SECTION ========== */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                <Card className="bg-[#0C0C0C] border-[#1A1A1A] mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/10 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-[#F0B90B]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Mes Documents</h3>
                                    <p className="text-xs text-[#666]">Documents requis pour conduire</p>
                                </div>
                            </div>
                        </div>

                        {/* Documents List */}
                        <div className="space-y-3">
                            {documents.map((doc) => {
                                const statusConfig = getStatusConfig(doc.status);
                                return (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-3 bg-[#151515] rounded-xl border border-[#1A1A1A] hover:border-[#333] transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", statusConfig.bg)}>
                                                <div className={statusConfig.color}>
                                                    {doc.icon}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{doc.name}</p>
                                                {doc.expiryDate && (
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Calendar className="w-3 h-3 text-[#666]" />
                                                        <span className="text-xs text-[#666]">Exp: {doc.expiryDate}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold", statusConfig.bg, statusConfig.color)}>
                                                {statusConfig.icon}
                                                <span>{statusConfig.label}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-[#666]" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Document Button */}
                        <Button
                            variant="outline"
                            className="w-full mt-4 border-dashed border-[#333] text-[#9A9A9A] hover:border-[#F0B90B] hover:text-[#F0B90B]"
                            onClick={() => alert("Fonctionnalité à venir")}
                        >
                            + Ajouter un document
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ========== RIDE PREFERENCES ========== */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
            >
                <Card className="bg-[#0C0C0C] border-[#1A1A1A] mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/10 flex items-center justify-center">
                                <Route className="w-5 h-5 text-[#F0B90B]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Préférences de Course</h3>
                                <p className="text-xs text-[#666]">Personnalisez vos options de conduite</p>
                            </div>
                        </div>

                        {/* Preferences List */}
                        <div className="space-y-4">
                            {/* Long Distance */}
                            <div className="flex items-center justify-between p-3 bg-[#151515] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Route className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Courses longues distances</p>
                                        <p className="text-xs text-[#666]">Accepter les trajets {'>'} 20 km</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={acceptLongDistance}
                                    onCheckedChange={setAcceptLongDistance}
                                    className="data-[state=checked]:bg-[#F0B90B]"
                                />
                            </div>

                            {/* Cash Payment */}
                            <div className="flex items-center justify-between p-3 bg-[#151515] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <Banknote className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Paiement en espèces</p>
                                        <p className="text-xs text-[#666]">Accepter les paiements cash</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={acceptCashPayment}
                                    onCheckedChange={setAcceptCashPayment}
                                    className="data-[state=checked]:bg-[#F0B90B]"
                                />
                            </div>

                            {/* Crypto Payment */}
                            <div className="flex items-center justify-between p-3 bg-[#151515] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#F0B90B]/10 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-[#F0B90B]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Paiement Crypto (ADA)</p>
                                        <p className="text-xs text-[#666]">Accepter les paiements en Cardano</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={acceptCryptoPayment}
                                    onCheckedChange={setAcceptCryptoPayment}
                                    className="data-[state=checked]:bg-[#F0B90B]"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ========== SECURITY SETTINGS ========== */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
            >
                <Button
                    variant="outline"
                    className="w-full h-14 border-[#333333] text-white hover:bg-[#1A1A1A] hover:border-[#F0B90B] justify-between mb-4"
                    onClick={() => alert("Fonctionnalité à venir")}
                >
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[#F0B90B]" />
                        <span>Paramètres de sécurité</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#666]" />
                </Button>

                <Button
                    variant="ghost"
                    className="w-full h-12 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => alert("Fonctionnalité à venir")}
                >
                    Déconnexion
                </Button>
            </motion.div>

            {/* Version Info */}
            <p className="text-center text-xs text-[#666] mt-6">
                KENDA Driver • Version 1.0.2
            </p>
        </div>
    );
}
