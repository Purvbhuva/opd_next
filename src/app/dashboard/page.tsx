'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Stethoscope, Users, CreditCard, ActivitySquare } from 'lucide-react'

type DashboardStats = {
    revenue: number
    receipts: number
    activeDoctors: number
    waitingPatients: number
    topDiagnosisName: string
    topDiagnosisCount: number
    lastUpdatedAt: string | null
}

export default function DashboardHome() {
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState<DashboardStats>({
        revenue: 0,
        receipts: 0,
        activeDoctors: 0,
        waitingPatients: 0,
        topDiagnosisName: 'No diagnoses yet',
        topDiagnosisCount: 0,
        lastUpdatedAt: null,
    })

    useEffect(() => {
        let isMounted = true

        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me')
                if (!res.ok) throw new Error('Failed to fetch user')
                const data = await res.json()
                if (isMounted) setUser(data.user)
            } catch (error) {
                console.error('Error fetching user:', error)
            }
        }

        fetchUser()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') return

        let isMounted = true

        const fetchStats = async () => {
            try {
                const res = await fetch('/api/reports?type=dashboard-summary', { cache: 'no-store' })
                if (!res.ok) throw new Error('Failed to fetch dashboard summary')

                const data = await res.json()

                if (!isMounted) return

                setStats({
                    revenue: Number(data.totalRevenueToday || 0),
                    receipts: Number(data.totalReceiptsToday || 0),
                    activeDoctors: Number(data.activeDoctors || 0),
                    waitingPatients: Number(data.patientsWaiting || 0),
                    topDiagnosisName: String(data.topDiagnosisName || 'No diagnoses yet'),
                    topDiagnosisCount: Number(data.topDiagnosisCount || 0),
                    lastUpdatedAt: data.lastUpdatedAt || new Date().toISOString(),
                })
            } catch (error) {
                console.error('Error fetching dashboard stats:', error)
            }
        }

        fetchStats()
        const interval = setInterval(fetchStats, 30000)

        return () => {
            isMounted = false
            clearInterval(interval)
        }
    }, [user])

    if (!user) return null

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-1 text-lg">Welcome back, <span className="font-medium text-foreground">{user.name}</span>. Here is what&apos;s happening today.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {user.role === 'ADMIN' && (
                    <>
                        <Card className="overflow-hidden border-indigo-100 dark:border-indigo-900/50 relative bg-gradient-to-br from-white to-indigo-50/30 dark:from-card dark:to-indigo-900/10">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <CreditCard className="w-24 h-24" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                                <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Total Revenue Today</CardTitle>
                                <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 rounded-lg">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="z-10 relative">
                                <div className="text-3xl font-bold text-foreground">${stats.revenue.toFixed(2)}</div>
                                <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1 font-medium">from {stats.receipts} receipts</p>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-emerald-100 dark:border-emerald-900/50 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Stethoscope className="w-24 h-24" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                                <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Active Doctors</CardTitle>
                                <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-lg">
                                    <Stethoscope className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="z-10 relative">
                                <div className="text-2xl font-bold">{stats.activeDoctors}</div>
                                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-medium">Registered doctors</p>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-blue-100 dark:border-blue-900/50 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Users className="w-24 h-24" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                                <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Patients Waiting</CardTitle>
                                <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-lg">
                                    <Users className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="z-10 relative">
                                <div className="text-2xl font-bold">{stats.waitingPatients}</div>
                                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1 font-medium">
                                    {stats.waitingPatients === 1 ? 'patient currently in queue' : 'patients currently in queue'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-orange-100 dark:border-orange-900/50 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <ActivitySquare className="w-24 h-24" />
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                                <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Top Diagnosis</CardTitle>
                                <div className="p-2 bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 rounded-lg">
                                    <ActivitySquare className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="z-10 relative">
                                <div className="text-2xl font-bold truncate">{stats.topDiagnosisName}</div>
                                <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-1 font-medium">{stats.topDiagnosisCount} cases today</p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {user.role === 'ADMIN' && (
                <p className="text-xs text-muted-foreground">
                    Live metrics refresh every 30 seconds
                    {stats.lastUpdatedAt ? ` (last updated at ${new Date(stats.lastUpdatedAt).toLocaleTimeString()})` : ''}
                </p>
            )}

            <div className="mt-8">
                <Card className="border-0 shadow-none bg-gradient-to-r from-primary/5 via-primary/10 to-transparent dark:from-primary/10 dark:via-primary/5">
                    <div className="flex flex-col md:flex-row items-center justify-between py-8 px-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
                                <Stethoscope className="w-8 h-8" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-2xl font-bold tracking-tight">Ready to start operations?</h2>
                                <p className="text-muted-foreground mt-1 max-w-md">
                                    Select an action from the sidebar to manage hospital operations efficiently.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
