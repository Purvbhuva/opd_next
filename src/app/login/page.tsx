'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Stethoscope } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Login failed')
            }

            toast.success('Login Successful', {
                description: `Welcome back, ${data.user.name}`
            })

            // The middleware handles routing, but we push to trigger soft-navigation
            router.push('/dashboard')
            router.refresh()
        } catch (error: any) {
            toast.error('Authentication Error', {
                description: error.message
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
            {/* Decorative background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/20 rounded-full blur-[100px]" />

            <Card className="w-full max-w-lg z-10 shadow-2xl border-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                <CardHeader className="space-y-4 text-center pb-6">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-bold tracking-tight">OPD Manager</CardTitle>
                        <CardDescription className="text-zinc-500 dark:text-zinc-400">
                            Sign in to access your hospital workspace
                        </CardDescription>
                    </div>
                </CardHeader>

                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="Enter your username"
                                className="h-12 bg-white/50 dark:bg-zinc-800/50"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-12 bg-white/50 dark:bg-zinc-800/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 pb-8">
                        <Button
                            type="submit"
                            className="w-full h-12 text-md font-medium"
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </Button>
                        <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                            Secure access restricted to authorized personnel.
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
