'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, Search, CalendarPlus } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function PatientRegistration() {
    const [patients, setPatients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const [formData, setFormData] = useState({
        name: '', age: '', gender: 'Male', mobile: '', address: ''
    })

    const fetchPatients = async (query = '') => {
        setLoading(true)
        try {
            const res = await fetch(`/api/patients${query ? `?search=${query}` : ''}`)
            const data = await res.json()
            setPatients(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPatients()
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchPatients(search)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to register patient')

            toast.success('Patient Registered', {
                description: `ID: ${data.uniqueId} created successfully.`
            })
            setIsDialogOpen(false)
            setFormData({ name: '', age: '', gender: 'Male', mobile: '', address: '' })
            fetchPatients()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Patient Records</h1>
                    <p className="text-zinc-500">Register new patients or search existing records.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Patient
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <form onSubmit={handleSave}>
                            <DialogHeader>
                                <DialogTitle>Register New Patient</DialogTitle>
                                <DialogDescription>A unique Patient ID will be generated upon save.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4 grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input id="age" type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="mobile">Mobile Number</Label>
                                    <Input id="mobile" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} required />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="address">Address (Optional)</Label>
                                    <Input id="address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Register Patient</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-4">
                    <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                        <Input
                            placeholder="Search by Name, Mobile, or Patient ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-md"
                        />
                        <Button type="submit" variant="secondary">
                            <Search className="h-4 w-4 mr-2" /> Search
                        </Button>
                        {search && (
                            <Button type="button" variant="ghost" onClick={() => { setSearch(''); fetchPatients() }}>Clear</Button>
                        )}
                    </form>

                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                            <TableRow>
                                <TableHead>Patient ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Age/Gender</TableHead>
                                <TableHead>Mobile</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8">Searching records...</TableCell></TableRow>
                            ) : patients.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8 text-zinc-500">No patients found. Try adjusting your search.</TableCell></TableRow>
                            ) : (
                                patients.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium text-blue-600 dark:text-blue-400">{p.uniqueId}</TableCell>
                                        <TableCell className="font-medium">{p.name}</TableCell>
                                        <TableCell>{p.age} / {p.gender}</TableCell>
                                        <TableCell>{p.mobile}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/opd?patientId=${p.id}`}>
                                                    <CalendarPlus className="mr-2 h-4 w-4" /> Create OPD Visit
                                                </Link>
                                            </Button>
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
