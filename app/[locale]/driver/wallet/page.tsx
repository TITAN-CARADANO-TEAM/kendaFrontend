"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Wallet, ArrowDownRight, ArrowUpRight, CreditCard, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Transaction type for local state
interface Transaction {
    id: string;
    type: "earning" | "withdrawal" | "bonus";
    description: string;
    amount: string;
    date: string;
    status: string;
}

export default function DriverWalletPage() {
    const { user } = useAuth();
    const supabase = createClient();

    // State
    const [balance, setBalance] = useState(0);
    const [todayEarnings, setTodayEarnings] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            setIsLoading(true);
            // Fetch Completed Rides
            const { data: rides } = await supabase
                .from('rides')
                .select('*')
                .eq('driver_id', user.id)
                .eq('status', 'COMPLETED')
                .order('created_at', { ascending: false });

            if (rides) {
                // Calc Balance (Total Earnings for now)
                // Note: In a real app, this should be (Total Earnings - Withdrawals) from a ledger table
                const total = rides.reduce((sum, r: any) => sum + (r.price || r.final_price || 0), 0);
                setBalance(total);

                // Calc Today Earnings
                const today = new Date().toISOString().split('T')[0];
                const todayRides = rides.filter((r: any) => r.created_at.startsWith(today));
                const todaySum = todayRides.reduce((sum, r: any) => sum + (r.price || r.final_price || 0), 0);
                setTodayEarnings(todaySum);

                // Map to Transactions
                const txList: Transaction[] = rides.slice(0, 15).map((r: any) => ({
                    id: r.id,
                    type: 'earning',
                    description: `Course - ${r.dest_address || r.destination_address || 'Client'}`,
                    amount: `+${(r.price || r.final_price || 0).toLocaleString()} FC`,
                    date: new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' ' + new Date(r.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    status: 'completed'
                }));
                setTransactions(txList);
            }
            setIsLoading(false);
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-24">
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
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0h dPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
                <CardContent className="p-6 relative">
                    <p className="text-black/60 text-sm font-medium mb-1">Solde disponible</p>
                    <p className="text-4xl font-bold text-black mb-4">
                        {isLoading ? "..." : `${balance.toLocaleString()} FC`}
                    </p>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-black/60" />
                        <span className="text-sm text-black/60">+0% cette semaine</span>
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
                        <p className="text-xl font-bold text-white">
                            {isLoading ? "..." : `${todayEarnings.toLocaleString()} FC`}
                        </p>
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
                    onClick={() => alert("Les retraits seront bientôt disponibles.")}
                >
                    <ArrowUpRight className="w-5 h-5 mr-2" />
                    Retirer
                </Button>
                <Button
                    variant="outline"
                    className="h-14 border-[#333333] text-white hover:bg-[#1A1A1A]"
                    onClick={() => alert("Gestion des méthodes de paiement bientôt disponible.")}
                >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Méthodes
                </Button>
            </div>

            {/* Transactions */}
            <div>
                <h2 className="text-lg font-bold mb-4">Dernières Courses</h2>
                <div className="space-y-3">
                    {transactions.length === 0 && !isLoading && (
                        <p className="text-[#666] text-sm">Aucune transaction récente.</p>
                    )}
                    {transactions.map((tx) => (
                        <Card key={tx.id} className="bg-[#0C0C0C] border-[#1A1A1A]">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        "bg-green-500/10"
                                    )}>
                                        <ArrowDownRight className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{tx.description}</p>
                                        <p className="text-xs text-[#666]">{tx.date}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-green-500">
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
