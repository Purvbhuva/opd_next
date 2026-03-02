'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    LogOut,
    LayoutDashboard,
    Users,
    Stethoscope,
    Building2,
    ClipboardList,
    CreditCard,
    Pill,
    Menu,
    ActivitySquare,
    BarChart3
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

function NavItems({ role }: { role: string }) {
    const pathname = usePathname()

    const links = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'FRONT_DESK', 'DOCTOR', 'BILLING'] },

        // Front Desk
        { name: 'Patient Registration', href: '/dashboard/patients', icon: Users, roles: ['ADMIN', 'FRONT_DESK'] },
        { name: 'OPD Entry', href: '/dashboard/opd', icon: ClipboardList, roles: ['ADMIN', 'FRONT_DESK'] },

        // Doctor
        { name: 'Consultations', href: '/dashboard/consultations', icon: Stethoscope, roles: ['ADMIN', 'DOCTOR'] },

        // Billing
        { name: 'Receipt Entry', href: '/dashboard/receipts', icon: CreditCard, roles: ['ADMIN', 'BILLING'] },

        // Admin Masters
        { name: 'Hospital Master', href: '/dashboard/masters/hospitals', icon: Building2, roles: ['ADMIN'] },
        { name: 'Doctor Master', href: '/dashboard/masters/doctors', icon: Stethoscope, roles: ['ADMIN'] },
        { name: 'Diagnosis Master', href: '/dashboard/masters/diagnoses', icon: ActivitySquare, roles: ['ADMIN'] },
        { name: 'Treatments', href: '/dashboard/masters/treatments', icon: Pill, roles: ['ADMIN'] },

        // Analytics
        { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: ['ADMIN'] },
    ]

    return (
        <nav className="space-y-2 mt-4 flex-1">
            {links.map((link) => {
                if (!link.roles.includes(role)) return null
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                return (
                    <Link key={link.href} href={link.href}>
                        <div className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                            isActive ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800"
                        )}>
                            <link.icon className={cn("h-5 w-5", isActive ? "text-blue-700 dark:text-blue-200" : "")} />
                            {link.name}
                        </div>
                    </Link>
                )
            })}
        </nav>
    )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => {
                if (res.ok) return res.json()
                throw new Error('Not authenticated')
            })
            .then(data => setUser(data.user))
            .catch(() => router.push('/login'))
    }, [router])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }

    if (!user) return <div className="h-screen flex items-center justify-center">Loading...</div>

    return (
        <div className="min-h-screen flex w-full bg-zinc-50/50 dark:bg-zinc-950">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 border-r bg-white dark:bg-zinc-900 md:flex flex-col p-4 shadow-sm z-10">
                <div className="flex h-14 items-center border-b px-2 gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">OPD Manager</span>
                </div>

                <NavItems role={user?.role} />

                <div className="mt-auto border-t pt-4">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold uppercase">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col text-sm">
                            <span className="font-medium truncate">{user.name}</span>
                            <span className="text-zinc-500 text-xs">{user.role}</span>
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="flex h-14 items-center gap-4 border-b bg-white dark:bg-zinc-900 px-4 md:hidden shadow-sm z-10">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col w-64 p-4">
                            <div className="flex h-14 items-center border-b px-2 gap-3 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Stethoscope className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-lg tracking-tight">OPD Manager</span>
                            </div>
                            <NavItems role={user?.role} />
                            <div className="mt-auto border-t pt-4">
                                <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1 md:hidden flex justify-end">
                        <span className="text-sm font-medium">{user.name}</span>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
