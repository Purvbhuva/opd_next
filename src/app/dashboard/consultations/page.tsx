'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Stethoscope, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Consultations() {
    const [user, setUser] = useState<any>(null)
    const [opdVisits, setOpdVisits] = useState<any[]>([])
    const [diagnosesMaster, setDiagnosesMaster] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [activeConsultation, setActiveConsultation] = useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const [diagnosesEntries, setDiagnosesEntries] = useState([{ diagnosisTypeId: '', notes: '' }])

    const fetchData = async (doctorUser: any) => {
        setLoading(true)
        try {
            // Find doctor profile for this user
            const docRes = await fetch('/api/masters/doctors')
            const doctors = await docRes.json()
            const myDoc = doctors.find((d: any) => d.userId === doctorUser.id)

            if (myDoc || doctorUser.role === 'ADMIN') {
                // fetch queue
                const opdUrl = doctorUser.role === 'ADMIN'
                    ? '/api/opd?status=QUEUED'
                    : `/api/opd?status=QUEUED&doctorId=${myDoc.id}`

                const opdRes = await fetch(opdUrl)
                if (opdRes.ok) {
                    setOpdVisits(await opdRes.json())
                }
            }

            // fetch diagnoses list
            const diagRes = await fetch('/api/masters/diagnoses')
            if (diagRes.ok) {
                const diagnosesData = await diagRes.json()
                console.log('Diagnoses loaded:', diagnosesData)
                setDiagnosesMaster(Array.isArray(diagnosesData) ? diagnosesData : [])
            } else {
                console.error('Failed to fetch diagnoses')
                setDiagnosesMaster([])
            }

        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                setUser(data.user)
                fetchData(data.user)
            })
    }, [])

    const startConsultation = (visit: any) => {
        setActiveConsultation(visit)
        setDiagnosesEntries([{ diagnosisTypeId: '', notes: '' }])
        setIsDialogOpen(true)
    }

    const handleAddDiagnosisRow = () => {
        setDiagnosesEntries([...diagnosesEntries, { diagnosisTypeId: '', notes: '' }])
    }

    const handleDiagnosisChange = (index: number, field: string, value: string) => {
        const updated = [...diagnosesEntries]
        updated[index] = { ...updated[index], [field]: value }
        setDiagnosesEntries(updated)
    }

    const handleRemoveDiagnosisRow = (index: number) => {
        const updated = diagnosesEntries.filter((_, i) => i !== index)
        setDiagnosesEntries(updated)
    }

    const handleCompleteConsultation = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // Filter out empty entries
            const validDiagnoses = diagnosesEntries.filter(d => d.diagnosisTypeId)

            const res = await fetch(`/api/opd/${activeConsultation.id}/consultation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'COMPLETED',
                    diagnoses: validDiagnoses
                })
            })

            if (!res.ok) throw new Error('Failed to save consultation')

            toast.success('Consultation Completed', { description: 'Patient moved to billing.' })
            setIsDialogOpen(false)
            fetchData(user)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Doctor Consultation Queue</h1>
                    <p className="text-muted-foreground mt-1">View your assigned patients waiting for consultation.</p>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <form onSubmit={handleCompleteConsultation}>
                        <DialogHeader>
                            <DialogTitle>Patient Consultation</DialogTitle>
                            <DialogDescription asChild>
                                <div className="mt-4 mb-2 flex flex-col gap-4 rounded-xl border border-border/70 bg-secondary/20 p-5 sm:flex-row">
                                    <div className="flex-1">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Patient Info</p>
                                        <p className="font-semibold text-lg text-foreground leading-none mb-1">{activeConsultation?.patient?.name}</p>
                                        <p className="text-sm text-muted-foreground">{activeConsultation?.patient?.uniqueId} • {activeConsultation?.patient?.age}y / {activeConsultation?.patient?.gender}</p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Primary Complaint</p>
                                        <div className="rounded-md border border-border/70 bg-card p-2 text-sm font-medium italic text-foreground">
                                            {activeConsultation?.reason}
                                        </div>
                                    </div>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2 max-h-[50vh] overflow-y-auto pr-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">Diagnosis Assessment</h3>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddDiagnosisRow}>+ Add Condition</Button>
                            </div>

                            {diagnosesEntries.map((diag, index) => (
                                <div key={index} className="group relative flex items-start gap-4 rounded-lg border border-border/70 bg-card p-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Select Diagnosis</Label>
                                            <Select
                                                value={diag.diagnosisTypeId}
                                                onValueChange={(v) => handleDiagnosisChange(index, 'diagnosisTypeId', v)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Search condition..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {diagnosesMaster.length === 0 ? (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                                            No diagnoses available. Please add diagnoses in Diagnosis Master first.
                                                        </div>
                                                    ) : (
                                                        diagnosesMaster.map(d => (
                                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Doctors Notes / Prescription Details</Label>
                                            <Input
                                                value={diag.notes}
                                                onChange={(e) => handleDiagnosisChange(index, 'notes', e.target.value)}
                                                placeholder="Add instructions or specific case notes here..."
                                            />
                                        </div>
                                    </div>
                                    {diagnosesEntries.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveDiagnosisRow(index)}>
                                            ✕
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <DialogFooter className="mt-6 border-t pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Queue for later</Button>
                            <Button type="submit">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Completed & Send to Billing
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Card className="overflow-hidden border-border/70">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-secondary/30">
                            <TableRow>
                                <TableHead>Queue Time</TableHead>
                                <TableHead>Patient details</TableHead>
                                <TableHead>Primary Complaint</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-8">Updating Queue...</TableCell></TableRow>
                            ) : opdVisits.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Stethoscope className="h-12 w-12 text-muted-foreground/40" />
                                            <span>No patients in your queue currently.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                opdVisits.map(visit => (
                                    <TableRow key={visit.id}>
                                        <TableCell className="text-xs font-mono">{new Date(visit.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                        <TableCell>
                                            <div className="font-semibold">{visit.patient?.name}</div>
                                            <div className="text-xs text-muted-foreground">{visit.patient?.age}y / {visit.patient?.gender}</div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate font-medium">{visit.reason}</TableCell>
                                        <TableCell className="text-right">
                                            <Button onClick={() => startConsultation(visit)}>
                                                Start Consultation
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
