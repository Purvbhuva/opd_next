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

export default function TreatmentMaster() {
    const [treatments, setTreatments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({ id: '', name: '', description: '' })

    const fetchTreatments = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/masters/treatments')
            const data = await res.json()
            setTreatments(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTreatments()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const method = formData.id ? 'PUT' : 'POST'
            const url = formData.id ? `/api/masters/treatments/${formData.id}` : '/api/masters/treatments'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to save treatment')

            toast.success(formData.id ? 'Treatment updated' : 'Treatment created')
            setIsDialogOpen(false)
            fetchTreatments()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this treatment?')) return
        try {
            const res = await fetch(`/api/masters/treatments/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete treatment')
            toast.success('Treatment deleted')
            fetchTreatments()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const openDialog = (treatment?: any) => {
        if (treatment) {
            setFormData({
                id: treatment.id,
                name: treatment.name,
                description: treatment.description || ''
            })
        } else {
            setFormData({ id: '', name: '', description: '' })
        }
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Treatment Type Master</h1>
                    <p className="text-muted-foreground">Manage standard high-level treatments (e.g., Surgery, Therapy).</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* Link to Sub-Treatments */}
                    <Button variant="outline" asChild>
                        <a href="/dashboard/masters/sub-treatments">Configure Sub-Treatments</a>
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => openDialog()}>
                                <Plus className="mr-2 h-4 w-4" /> Add Treatment
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleSave}>
                                <DialogHeader>
                                    <DialogTitle>{formData.id ? 'Edit' : 'Add'} Treatment Type</DialogTitle>
                                    <DialogDescription>Define a broad category of treatment.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Treatment Name</Label>
                                        <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Input id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
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
            </div>

            <Card className="overflow-hidden border-border/70">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-secondary/30">
                            <TableRow>
                                <TableHead>Treatment Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : treatments.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">No treatments found.</TableCell></TableRow>
                            ) : (
                                treatments.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium">{t.name}</TableCell>
                                        <TableCell>{t.description || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openDialog(t)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4" /></Button>
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
