'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Edit, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function DoctorMaster() {
    const [doctors, setDoctors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({ id: '', name: '', username: '', specialization: '', department: '', availability: '' })

    const fetchDoctors = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/masters/doctors')
            const data = await res.json()
            setDoctors(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDoctors()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const isEdit = !!formData.id
            const method = isEdit ? 'PUT' : 'POST'
            const url = isEdit ? `/api/masters/doctors/${formData.id}` : '/api/masters/doctors'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to save doctor')

            toast.success(isEdit ? 'Doctor updated' : 'Doctor created')
            setIsDialogOpen(false)
            fetchDoctors()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this doctor? Their user account will also be deleted.')) return
        try {
            const res = await fetch(`/api/masters/doctors/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete doctor')
            toast.success('Doctor deleted')
            fetchDoctors()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const openDialog = (doctor?: any) => {
        if (doctor) {
            setFormData({
                id: doctor.id,
                name: doctor.name,
                username: doctor.user.username,
                specialization: doctor.specialization,
                department: doctor.department,
                availability: doctor.availability
            })
        } else {
            setFormData({ id: '', name: '', username: '', specialization: '', department: '', availability: '' })
        }
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Doctor Master</h1>
                    <p className="text-zinc-500">Manage doctor profiles and login access.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openDialog()}>
                            <Plus className="mr-2 h-4 w-4" /> Add Doctor
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSave}>
                            <DialogHeader>
                                <DialogTitle>{formData.id ? 'Edit' : 'Add'} Doctor</DialogTitle>
                                <DialogDescription>
                                    Enter the doctor details. {!formData.id && 'A DOCTOR user account will automatically be created and the default password is "password123".'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                {!formData.id && (
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Login Username</Label>
                                        <Input id="username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="specialization">Specialization</Label>
                                    <Input id="specialization" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Input id="department" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} required />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="availability">Availability</Label>
                                    <Input id="availability" placeholder="e.g. Mon-Fri 09:00 AM - 05:00 PM" value={formData.availability} onChange={e => setFormData({ ...formData, availability: e.target.value })} required />
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

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                            <TableRow>
                                <TableHead>Doctor Name</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Specialization</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                                </TableRow>
                            ) : doctors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">No doctors found.</TableCell>
                                </TableRow>
                            ) : (
                                doctors.map(doctor => (
                                    <TableRow key={doctor.id}>
                                        <TableCell className="font-medium">{doctor.name}</TableCell>
                                        <TableCell>{doctor.user?.username || 'N/A'}</TableCell>
                                        <TableCell>{doctor.department}</TableCell>
                                        <TableCell>{doctor.specialization}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openDialog(doctor)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(doctor.id)}>
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
