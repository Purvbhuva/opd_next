'use client'

import { useState, useEffect, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

function OPDEntryContent() {
    const searchParams = useSearchParams()
    const initialPatientId = searchParams.get('patientId')

    const [doctors, setDoctors] = useState<any[]>([])
    const [patients, setPatients] = useState<any[]>([])
    const [opdVisits, setOpdVisits] = useState<any[]>([])

    const [isDialogOpen, setIsDialogOpen] = useState(!!initialPatientId)
    const [formData, setFormData] = useState({
        patientId: initialPatientId || '',
        doctorId: '',
        reason: ''
    })

    const fetchData = async () => {
        try {
            const [docsRes, patRes, opdRes] = await Promise.all([
                fetch('/api/masters/doctors'),
                fetch('/api/patients'),
                fetch('/api/opd?status=QUEUED') // only showing active queue usually for front desk
            ])

            setDoctors(await docsRes.json())
            setPatients(await patRes.json())
            setOpdVisits(await opdRes.json())
        } catch (e) {
            toast.error('Failed to load initial data')
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/opd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Failed to create OPD visit')

            toast.success('Patient added to Doctor\'s Queue')
            setIsDialogOpen(false)
            setFormData({ patientId: '', doctorId: '', reason: '' })
            fetchData() // Refresh list
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">OPD Entry & Queue</h1>
                    <p className="text-zinc-500">Assign registered patients to doctors for consultation.</p>
                </div>

                <Button onClick={() => setIsDialogOpen(true)}>
                    New OPD Entry
                </Button>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <form onSubmit={handleSave}>
                            <DialogHeader>
                                <DialogTitle>Create OPD Visit</DialogTitle>
                                <DialogDescription>Assign a patient to a doctor queue.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Select Patient</Label>
                                    <Select
                                        value={formData.patientId}
                                        onValueChange={(val) => setFormData({ ...formData, patientId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Search Patient..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name} ({p.uniqueId})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Assign Doctor</Label>
                                    <Select
                                        value={formData.doctorId}
                                        onValueChange={(val) => setFormData({ ...formData, doctorId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Doctor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors.map(d => (
                                                <SelectItem key={d.id} value={d.id}>Dr. {d.name} ({d.department})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason for Visit (Primary Complaint)</Label>
                                    <Input id="reason" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Add to Queue</Button>
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
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Patient Details</TableHead>
                                <TableHead>Assigned Doctor</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {opdVisits.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8 text-zinc-500">No active queued visits found.</TableCell></TableRow>
                            ) : (
                                opdVisits.map(visit => (
                                    <TableRow key={visit.id}>
                                        <TableCell className="text-xs">{new Date(visit.visitDate).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{visit.patient?.name}</div>
                                            <div className="text-xs text-zinc-500">{visit.patient?.uniqueId}</div>
                                        </TableCell>
                                        <TableCell>Dr. {visit.doctor?.name}</TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={visit.reason}>{visit.reason}</TableCell>
                                        <TableCell>
                                            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider">
                                                {visit.status}
                                            </span>
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

export default function OPDEntry() {
    return (
        <Suspense fallback={<div>Loading OPD System...</div>}>
            <OPDEntryContent />
        </Suspense>
    )
}
