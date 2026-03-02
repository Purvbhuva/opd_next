'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Receipt, Search, Printer, Plus, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function ReceiptEntry() {
    const [receipts, setReceipts] = useState<any[]>([])
    const [patients, setPatients] = useState<any[]>([])
    const [completedOpds, setCompletedOpds] = useState<any[]>([])

    // Masters
    const [treatments, setTreatments] = useState<any[]>([])
    const [subTreatments, setSubTreatments] = useState<any[]>([])

    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedOpdInfo, setSelectedOpdInfo] = useState<any>(null)

    const [formData, setFormData] = useState({
        patientId: '',
        opdVisitId: '',
        paymentStatus: 'PAID'
    })

    const [lineItems, setLineItems] = useState([{ treatmentTypeId: '', subTreatmentTypeId: '', amount: '' }])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [recRes, patRes, opdRes, treatRes, subRes] = await Promise.all([
                fetch('/api/receipts'),
                fetch('/api/patients'),
                fetch('/api/opd?status=COMPLETED'), // Fetch unbilled completed OPDs
                fetch('/api/masters/treatments'),
                fetch('/api/masters/sub-treatments')
            ])

            setReceipts(await recRes.json())
            setPatients(await patRes.json())
            setCompletedOpds(await opdRes.json())
            setTreatments(await treatRes.json())
            setSubTreatments(await subRes.json())
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleOpdSelect = (opdId: string) => {
        const opd = completedOpds.find(o => o.id === opdId)
        if (opd) {
            setFormData({ ...formData, opdVisitId: opdId, patientId: opd.patientId })
            setSelectedOpdInfo(opd)
        }
    }

    const handleAddLineItem = () => {
        setLineItems([...lineItems, { treatmentTypeId: '', subTreatmentTypeId: '', amount: '' }])
    }

    const handleLineItemChange = (index: number, field: string, value: string) => {
        const updated = [...lineItems]
        updated[index] = { ...updated[index], [field]: value }

        // Automatically filter sub-treatments if treatmentTypeId changes. Not implemented strictly here,
        // but we can clear subTreatmentTypeId when treatment changes to prevent mismatch.
        if (field === 'treatmentTypeId') {
            updated[index].subTreatmentTypeId = ''
        }

        setLineItems(updated)
    }

    const handleRemoveLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index))
    }

    const calculateTotal = () => {
        return lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (!formData.patientId) throw new Error('Patient must be selected')

            const validItems = lineItems.filter(l => l.treatmentTypeId && Number(l.amount) > 0)
            if (validItems.length === 0) throw new Error('At least one valid line item with an amount is required')

            const res = await fetch('/api/receipts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    transactions: validItems
                })
            })

            if (!res.ok) throw new Error('Failed to generate receipt')

            toast.success('Receipt Generated Successfully')
            setIsDialogOpen(false)
            fetchData()

            // Reset form
            setFormData({ patientId: '', opdVisitId: '', paymentStatus: 'PAID' })
            setLineItems([{ treatmentTypeId: '', subTreatmentTypeId: '', amount: '' }])
            setSelectedOpdInfo(null)
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Receipt & Billing</h1>
                    <p className="text-zinc-500">Manage patient payments, generate invoices and receipts.</p>
                </div>

                <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Receipt className="mr-2 h-4 w-4" /> Generate Receipt
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <form onSubmit={handleSave}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-2xl"><Receipt className="text-emerald-500" /> New Billing Invoice</DialogTitle>
                            <DialogDescription>Link against an OPD consultation or directly bill a patient.</DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-12 gap-6 py-4">
                            <div className="col-span-4 space-y-4 border-r pr-6">
                                <div>
                                    <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-zinc-500">Patient Details</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Select recent OPD Visit (Optional)</Label>
                                            <Select
                                                value={formData.opdVisitId}
                                                onValueChange={handleOpdSelect}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Completed Consultations..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Direct Bill (No OPD) --</SelectItem>
                                                    {completedOpds.map(opd => (
                                                        <SelectItem key={opd.id} value={opd.id}>
                                                            {new Date(opd.visitDate).toLocaleDateString()} - {opd.patient?.name} (Dr. {opd.doctor?.name})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs text-red-500">Or Select Patient Directly *</Label>
                                            <Select
                                                value={formData.patientId}
                                                onValueChange={(val) => setFormData({ ...formData, patientId: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Search Patient Database..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {patients.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.uniqueId} - {p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {selectedOpdInfo && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                        <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 uppercase">Consultation Notes</h4>
                                        <p className="text-sm">Assigned: <span className="font-medium">Dr. {selectedOpdInfo.doctor?.name}</span></p>
                                        <p className="text-sm">Reason: <span className="italic">{selectedOpdInfo.reason}</span></p>
                                        {selectedOpdInfo.diagnoses && selectedOpdInfo.diagnoses.length > 0 && (
                                            <div className="mt-2 text-xs">
                                                <strong className="block mb-1">Diagnoses:</strong>
                                                <ul className="list-disc pl-4">
                                                    {selectedOpdInfo.diagnoses.map((d: any) => (
                                                        <li key={d.id}>{d.diagnosisType.name}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="col-span-8 space-y-4">
                                <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800 p-2 rounded-t-lg">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider pl-2">Bill Line Items</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddLineItem} className="bg-white"><Plus className="w-4 h-4 mr-1" /> Item</Button>
                                </div>

                                <div className="space-y-3 max-h-[40vh] overflow-y-auto px-2 pb-4">
                                    {lineItems.map((item, index) => {
                                        const availableSubTreatments = subTreatments.filter(st => st.treatmentTypeId === item.treatmentTypeId)

                                        return (
                                            <div key={index} className="flex gap-3 items-end p-3 rounded-lg border shadow-sm relative group bg-white dark:bg-zinc-900">
                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-xs">Treatment Category</Label>
                                                    <Select value={item.treatmentTypeId} onValueChange={(v) => handleLineItemChange(index, 'treatmentTypeId', v)}>
                                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                                        <SelectContent>
                                                            {treatments.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-xs">Specific Sub-Treatment</Label>
                                                    <Select value={item.subTreatmentTypeId} onValueChange={(v) => handleLineItemChange(index, 'subTreatmentTypeId', v)} disabled={!item.treatmentTypeId}>
                                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                                        <SelectContent>
                                                            {availableSubTreatments.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="w-32 space-y-1">
                                                    <Label className="text-xs flex justify-end">Amount (USD)</Label>
                                                    <Input type="number" min="0" step="0.01" value={item.amount} onChange={(e) => handleLineItemChange(index, 'amount', e.target.value)} required className="text-right font-mono font-medium text-lg" />
                                                </div>
                                                {lineItems.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveLineItem(index)}>✕</Button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <div className="bg-emerald-50 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100 p-4 rounded-lg min-w-[300px] flex justify-between items-center border border-emerald-200 dark:border-emerald-800">
                                        <span className="text-lg font-semibold uppercase tracking-wider">Total Due:</span>
                                        <span className="text-3xl font-bold font-mono">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="border-t pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700"><Receipt className="w-4 h-4 mr-2" /> Save Receipt & Mark as Paid</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                            <TableRow>
                                <TableHead>Receipt No (ID)</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Patient details</TableHead>
                                <TableHead>Linked OPD</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading receipts...</TableCell></TableRow>
                            ) : receipts.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-12 text-zinc-500">No receipts found. Generate your first invoice.</TableCell></TableRow>
                            ) : (
                                receipts.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-mono text-xs">{r.id.split('-')[0].toUpperCase()}</TableCell>
                                        <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{r.patient?.name}</div>
                                            <div className="text-xs text-zinc-500">{r.patient?.uniqueId}</div>
                                        </TableCell>
                                        <TableCell>{r.opdVisit ? `Dr. ${r.opdVisit.doctor?.name}` : '-'}</TableCell>
                                        <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            ${r.totalAmount.toFixed(2)}
                                            <div className="text-[10px] uppercase text-zinc-400 mt-1">{r.paymentStatus}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="text-blue-600">
                                                <Printer className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Download className="w-4 h-4" />
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
