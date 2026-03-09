'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Edit, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function FrontDeskUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        username: '',
        password: '',
    })

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/front-desk')
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch front desk users')
            }

            setUsers(data)
        } catch (error: any) {
            toast.error(error.message)
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const openDialog = (user?: any) => {
        if (user) {
            setFormData({
                id: user.id,
                name: user.name,
                username: user.username,
                password: '',
            })
        } else {
            setFormData({
                id: '',
                name: '',
                username: '',
                password: '',
            })
        }

        setIsDialogOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const isEdit = !!formData.id
            const method = isEdit ? 'PUT' : 'POST'
            const url = isEdit ? `/api/admin/front-desk/${formData.id}` : '/api/admin/front-desk'

            const payload = {
                name: formData.name,
                username: formData.username,
                ...(formData.password ? { password: formData.password } : {}),
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to save front desk user')
            }

            toast.success(isEdit ? 'Front desk user updated' : 'Front desk user created')
            setIsDialogOpen(false)
            fetchUsers()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this front desk user?')) return

        try {
            const res = await fetch(`/api/admin/front-desk/${id}`, {
                method: 'DELETE',
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to delete front desk user')
            }

            toast.success('Front desk user deleted')
            fetchUsers()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Front Desk Users</h1>
                    <p className="text-muted-foreground">Admin can create and manage FRONT_DESK users.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openDialog()}>
                            <Plus className="mr-2 h-4 w-4" /> Add Front Desk User
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <form onSubmit={handleSave}>
                            <DialogHeader>
                                <DialogTitle>{formData.id ? 'Edit' : 'Add'} Front Desk User</DialogTitle>
                                <DialogDescription>
                                    {!formData.id
                                        ? 'Set login details for the front desk user.'
                                        : 'Update user details. Leave password empty to keep current password.'}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-1 gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!formData.id}
                                        placeholder={formData.id ? 'Leave empty to keep current password' : ''}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="overflow-hidden border-border/70">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-secondary/30">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center">Loading...</TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No front desk users found.</TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openDialog(user)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(user.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
