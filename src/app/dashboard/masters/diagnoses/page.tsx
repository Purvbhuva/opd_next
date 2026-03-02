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

export default function DiagnosisMaster() {
    const [diagnoses, setDiagnoses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({ id: '', name: '', description: '' })

    const fetchDiagnoses = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/masters/diagnoses')
            const data = await res.json()
            setDiagnoses(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDiagnoses()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const method = formData.id ? 'PUT' : 'POST'
            const url = formData.id ? `/api/masters/diagnoses/${formData.id}` : '/api/masters/diagnoses'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to save diagnosis')

            toast.success(formData.id ? 'Diagnosis updated' : 'Diagnosis created')
            setIsDialogOpen(false)
            fetchDiagnoses()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this diagnosis?')) return
        try {
            const res = await fetch(`/api/masters/diagnoses/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete diagnosis')
            toast.success('Diagnosis deleted')
            fetchDiagnoses()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const openDialog = (diagnosis?: any) => {
        if (diagnosis) {
            setFormData({
                id: diagnosis.id,
                name: diagnosis.name,
                description: diagnosis.description || ''
            })
        } else {
            setFormData({ id: '', name: '', description: '' })
        }
        setIsDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Diagnosis Master</h1>
                    <p className="text-zinc-500">Manage standard diagnosis types used by doctors.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openDialog()}>
                            <Plus className="mr-2 h-4 w-4" /> Add Diagnosis
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSave}>
                            <DialogHeader>
                                <DialogTitle>{formData.id ? 'Edit' : 'Add'} Diagnosis Type</DialogTitle>
                                <DialogDescription>Define a standard medical condition.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Diagnosis Name</Label>
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

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                            <TableRow>
                                <TableHead>Diagnosis Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : diagnoses.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="text-center py-8 text-zinc-500">No diagnoses found.</TableCell></TableRow>
                            ) : (
                                diagnoses.map(diag => (
                                    <TableRow key={diag.id}>
                                        <TableCell className="font-medium">{diag.name}</TableCell>
                                        <TableCell>{diag.description || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openDialog(diag)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(diag.id)}><Trash2 className="h-4 w-4" /></Button>
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
