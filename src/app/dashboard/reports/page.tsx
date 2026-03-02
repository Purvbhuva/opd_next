'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart3, TrendingUp, Users, ActivitySquare, Ban } from 'lucide-react'
import { toast } from 'sonner'

export default function ReportsScreen() {
    const [reportType, setReportType] = useState('financial')
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const fetchReport = async (type: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/reports?type=${type}`)
            if (!res.ok) throw new Error('Failed to fetch report data')
            setData(await res.json())
        } catch (e: any) {
            toast.error(e.message)
            setData(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReport(reportType)
    }, [reportType])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
                    <p className="text-zinc-500">Monitor hospital performance, finances, and doctor statistics.</p>
                </div>
                <div className="w-64">
                    <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Report Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="financial">Financial Overview</SelectItem>
                            <SelectItem value="doctor-wise">Doctor-wise Consultations</SelectItem>
                            <SelectItem value="diagnosis-wise">Diagnosis Analytics</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!loading && !data && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center h-64 text-zinc-500">
                        <Ban className="w-8 h-8 mb-4 text-zinc-300" />
                        <p>No data available to display for this report type.</p>
                    </CardContent>
                </Card>
            )}

            {loading && (
                <Card>
                    <CardContent className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </CardContent>
                </Card>
            )}

            {reportType === 'financial' && data && !loading && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Total Revenue (Today)</CardTitle>
                                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                                    ${data.totalRevenueToday.toFixed(2)}
                                </div>
                                <p className="text-xs text-emerald-600/80 dark:text-emerald-500 mt-1">Generated today across all departments.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Receipts Issued</CardTitle>
                                <BarChart3 className="h-4 w-4 text-zinc-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">
                                    {data.totalReceiptsToday}
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Total invoices processed today.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {reportType === 'doctor-wise' && data && !loading && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-500" /> Patient Loads by Doctor</CardTitle>
                        <CardDescription>Number of total visits (all statuses) assigned to each doctor.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                                <TableRow>
                                    <TableHead>Doctor Name</TableHead>
                                    <TableHead className="text-right">Total Patients Handled</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length === 0 ? (
                                    <TableRow><TableCell colSpan={2} className="text-center py-8 text-zinc-500">No data available.</TableCell></TableRow>
                                ) : (
                                    data.map((d: any) => (
                                        <TableRow key={d.doctorId}>
                                            <TableCell className="font-medium">Dr. {d.doctor?.name || 'Unknown'}</TableCell>
                                            <TableCell className="text-right font-bold text-lg">{d._count.id}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {reportType === 'diagnosis-wise' && data && !loading && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ActivitySquare className="w-5 h-5 text-red-500" /> Top Diagnoses Frequentcy</CardTitle>
                        <CardDescription>Aggregated count of common diseases or conditions diagnosed.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                                <TableRow>
                                    <TableHead>Diagnosis Condition</TableHead>
                                    <TableHead className="text-right">Occurrence Count</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length === 0 ? (
                                    <TableRow><TableCell colSpan={2} className="text-center py-8 text-zinc-500">No data available.</TableCell></TableRow>
                                ) : (
                                    data.map((d: any) => (
                                        <TableRow key={d.diagnosisTypeId}>
                                            <TableCell className="font-medium text-red-600 dark:text-red-400">{d.diagnosisType?.name || 'Unknown'}</TableCell>
                                            <TableCell className="text-right font-bold font-mono text-lg">{d._count.id}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
