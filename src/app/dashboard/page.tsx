'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Stethoscope, Users, CreditCard, ActivitySquare } from 'lucide-react'

export default function DashboardHome() {
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState({ revenue: 0, receipts: 0 })

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => setUser(data.user))

        // Fetch some basic stats
        fetch('/api/reports?type=financial')
            .then(res => res.json())
            .then(data => setStats({ revenue: data.totalRevenueToday, receipts: data.totalReceiptsToday }))
    }, [])

    if (!user) return null

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-zinc-500">Welcome back, {user.name}. Here is what&apos;s happening today.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {user.role === 'ADMIN' && (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue Today</CardTitle>
                                <CreditCard className="h-4 w-4 text-zinc-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
                                <p className="text-xs text-zinc-500">from {stats.receipts} receipts</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
                                <Stethoscope className="h-4 w-4 text-zinc-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12</div>
                                <p className="text-xs text-zinc-500">On duty today</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Patients Waiting</CardTitle>
                                <Users className="h-4 w-4 text-zinc-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">45</div>
                                <p className="text-xs text-zinc-500">+12% from last hour</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Top Diagnosis</CardTitle>
                                <ActivitySquare className="h-4 w-4 text-zinc-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-truncate">Viral Fever</div>
                                <p className="text-xs text-zinc-500">28 cases today</p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <div className="mt-8">
                <Card className="border-0 shadow-sm bg-white/50 dark:bg-zinc-900/50">
                    <div className="flex flex-col items-center justify-center py-12 text-center h-64">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                            <Stethoscope className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-semibold">Your Quick Actions</h2>
                        <p className="text-sm text-zinc-500 max-w-sm mt-2">
                            Select an action from the sidebar to manage hospital operations efficiently.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
