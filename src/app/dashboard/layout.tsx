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
        { name: 'Doctor Master', href: '/dashboard/masters/doctors', icon: Stethoscope, roles: ['ADMIN'] },
        { name: 'Front Desk Users', href: '/dashboard/masters/front-desk', icon: Users, roles: ['ADMIN'] },
        { name: 'Billing Users', href: '/dashboard/masters/billing', icon: CreditCard, roles: ['ADMIN'] },
        { name: 'Diagnosis Master', href: '/dashboard/masters/diagnoses', icon: ActivitySquare, roles: ['ADMIN'] },
        { name: 'Treatments', href: '/dashboard/masters/treatments', icon: Pill, roles: ['ADMIN'] },

        // Analytics
        { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: ['ADMIN'] },
    ]

    return (
        <nav className="mt-4 flex-1 space-y-1.5">
            {links.map((link) => {
                if (!link.roles.includes(role)) return null
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                return (
                    <Link key={link.href} href={link.href} className="group block">
                        <div className={cn(
                            "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                                ? "border-primary/25 bg-primary/10 text-primary"
                                : "border-transparent text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                        )}>
                            <link.icon className={cn("h-4 w-4 transition-transform", isActive ? "scale-105" : "opacity-80 group-hover:opacity-100")} />
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

    if (!user) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading...</div>

    return (
        <div className="flex min-h-screen w-full bg-secondary/25 dark:bg-background">
            {/* Desktop Sidebar */}
            <aside className="z-20 hidden w-64 flex-col border-r border-border/70 bg-card/95 p-4 backdrop-blur md:flex">
                <div className="mb-6 flex h-14 items-center gap-3 px-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Stethoscope className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground">OPD Manager</span>
                </div>

                <NavItems role={user?.role} />

                <div className="mt-auto border-t border-border/70 pt-4">
                    <div className="mb-2 flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold uppercase text-primary">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col text-sm flex-1 min-w-0">
                            <span className="font-semibold truncate text-foreground">{user.name}</span>
                            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{user.role}</span>
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="z-20 flex h-16 items-center gap-4 border-b border-border/70 bg-card/95 px-4 backdrop-blur md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex w-72 flex-col border-r border-border/70 p-4">
                            <div className="mb-4 flex h-14 items-center gap-3 border-b border-border/70 px-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Stethoscope className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-lg tracking-tight">OPD Manager</span>
                            </div>
                            <NavItems role={user?.role} />
                            <div className="mt-auto border-t border-border/70 pt-4">
                                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
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

                <div className="flex-1 overflow-auto p-4 md:p-7 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
