'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Edit, Trash2, Plus, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SubTreatmentMaster() {
    const [subTreatments, setSubTreatments] = useState<any[]>([])
    const [treatmentTypes, setTreatmentTypes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({ id: '', name: '', treatmentTypeId: '' })

    const fetchTypes = async () => {
        const res = await fetch('/api/masters/treatments')
        setTreatmentTypes(await res.json())
    }

    const fetchSubTreatments = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/masters/sub-treatments')
            setSubTreatments(await res.json())
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTypes()
        fetchSubTreatments()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.treatmentTypeId) return toast.error('Please select a parent Treatment Type.')

        try {
            const method = formData.id ? 'PUT' : 'POST'
            const url = formData.id ? `/api/masters/sub-treatments/${formData.id}` : '/api/masters/sub-treatments'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to save sub-treatment')

            toast.success(formData.id ? 'Sub-treatment updated' : 'Sub-treatment created')
            setIsDialogOpen(false)
            fetchSubTreatments()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sub-treatment?')) return
        try {
            const res = await fetch(`/api/masters/sub-treatments/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete sub-treatment')
            toast.success('Sub-treatment deleted')
            fetchSubTreatments()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const openDialog = (sub?: any) => {
        if (sub) {
            setFormData({
                id: sub.id,
                name: sub.name,
                treatmentTypeId: sub.treatmentTypeId
            })
        } else {
            setFormData({ id: '', name: '', treatmentTypeId: '' })
        }
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/masters/treatments"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sub-Treatment Type Master</h1>
                    <p className="text-muted-foreground">Manage specific services that are billed to the patient.</p>
                </div>
            </div>

            <div className="flex justify-end mb-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openDialog()}>
                            <Plus className="mr-2 h-4 w-4" /> Add Sub-Treatment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSave}>
                            <DialogHeader>
                                <DialogTitle>{formData.id ? 'Edit' : 'Add'} Sub-Treatment</DialogTitle>
                                <DialogDescription>Define a specific sub-category item for billing.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Parent Treatment Type</Label>
                                    <Select
                                        value={formData.treatmentTypeId}
                                        onValueChange={(val) => setFormData({ ...formData, treatmentTypeId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Parent Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {treatmentTypes.map(tt => (
                                                <SelectItem key={tt.id} value={tt.id}>{tt.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Sub-Treatment Name</Label>
                                    <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
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
                                <TableHead>Sub-Treatment Name</TableHead>
                                <TableHead>Parent Category</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : subTreatments.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">No sub-treatments found.</TableCell></TableRow>
                            ) : (
                                subTreatments.map(sub => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-medium">{sub.name}</TableCell>
                                        <TableCell>
                                            <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">
                                                {sub.treatmentType?.name || 'Unknown'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openDialog(sub)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(sub.id)}><Trash2 className="h-4 w-4" /></Button>
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
