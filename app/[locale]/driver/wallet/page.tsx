"use client";

import React from "react";
import { Wallet, ArrowDownRight, ArrowUpRight, CreditCard, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock transactions
const transactions = [
    {
        id: "1",
        type: "earning",
        description: "Course - Aéroport → Ihusi",
        amount: "+7,500 FC",
        date: "10 Déc 2025, 14:32",
        status: "completed"
    },
    {
        id: "2",
        type: "earning",
        description: "Course - Majengo → Birere",
        amount: "+3,000 FC",
        date: "10 Déc 2025, 11:15",
        status: "completed"
    },
    {
        id: "3",
        type: "withdrawal",
        description: "Retrait Mobile Money",
        amount: "-50,000 FC",
        date: "09 Déc 2025, 18:00",
        status: "completed"
    },
    {
        id: "4",
        type: "bonus",
        description: "Bonus hebdomadaire",
        amount: "+5,000 FC",
        date: "08 Déc 2025, 00:00",
        status: "completed"
    },
    {
        id: "5",
        type: "earning",
        description: "Course - Himbi → Ndosho",
        amount: "+5,000 FC",
        date: "07 Déc 2025, 18:45",
        status: "completed"
    },
];

export default function DriverWalletPage() {
    return (
        <div className="min-h-screen bg-black text-white p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/10 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-[#F0B90B]" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold">Mon Portefeuille</h1>
                </div>
                <p className="text-[#9A9A9A] text-sm">Gérez vos gains et retraits</p>
            </div>

            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-[#F0B90B] via-[#D4A50A] to-[#B8910A] border-none mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
                <CardContent className="p-6 relative">
                    <p className="text-black/60 text-sm font-medium mb-1">Solde disponible</p>
                    <p className="text-4xl font-bold text-black mb-4">125,500 FC</p>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-black/60" />
                        <span className="text-sm text-black/60">+18% cette semaine</span>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="bg-[#0C0C0C] border-[#1A1A1A]">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowDownRight className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-[#9A9A9A]">Gains aujourd&apos;hui</span>
                        </div>
                        <p className="text-xl font-bold text-white">10,500 FC</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#0C0C0C] border-[#1A1A1A]">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-[#F0B90B]" />
                            <span className="text-xs text-[#9A9A9A]">En attente</span>
                        </div>
                        <p className="text-xl font-bold text-white">0 FC</p>
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Button
                    className="h-14 bg-[#F0B90B] text-black hover:bg-[#F0B90B]/90 font-bold"
                    onClick={() => alert("Fonctionnalité à venir")}
                >
                    <ArrowUpRight className="w-5 h-5 mr-2" />
                    Retirer
                </Button>
                <Button
                    variant="outline"
                    className="h-14 border-[#333333] text-white hover:bg-[#1A1A1A]"
                    onClick={() => alert("Fonctionnalité à venir")}
                >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Méthodes
                </Button>
            </div>

            {/* Transactions */}
            <div>
                <h2 className="text-lg font-bold mb-4">Transactions récentes</h2>
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <Card key={tx.id} className="bg-[#0C0C0C] border-[#1A1A1A]">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        tx.type === "earning" && "bg-green-500/10",
                                        tx.type === "withdrawal" && "bg-red-500/10",
                                        tx.type === "bonus" && "bg-[#F0B90B]/10"
                                    )}>
                                        {tx.type === "earning" && <ArrowDownRight className="w-5 h-5 text-green-500" />}
                                        {tx.type === "withdrawal" && <ArrowUpRight className="w-5 h-5 text-red-500" />}
                                        {tx.type === "bonus" && <TrendingUp className="w-5 h-5 text-[#F0B90B]" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{tx.description}</p>
                                        <p className="text-xs text-[#666]">{tx.date}</p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-sm font-bold",
                                    tx.type === "withdrawal" ? "text-red-500" : "text-green-500"
                                )}>
                                    {tx.amount}
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
