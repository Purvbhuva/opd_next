import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
    try {
        const url = new URL(req.url)
        const type = url.searchParams.get('type') // date wise, doctor wise, diagnosis wise, financial

        // Default to today for demo purposes if no date range is provided
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        switch (type) {
            case 'dashboard-summary': {
                const [financialStats, activeDoctors, patientsWaiting, diagnosisStats] = await Promise.all([
                    prisma.receipt.aggregate({
                        _sum: { totalAmount: true },
                        _count: { id: true },
                        where: {
                            paymentStatus: 'PAID',
                            date: {
                                gte: startOfDay,
                                lte: endOfDay,
                            },
                        },
                    }),
                    prisma.doctor.count(),
                    prisma.oPDVisit.count({ where: { status: 'QUEUED' } }),
                    prisma.oPDDiagnosis.groupBy({
                        by: ['diagnosisTypeId'],
                        _count: { id: true },
                        where: {
                            createdAt: {
                                gte: startOfDay,
                                lte: endOfDay,
                            },
                        },
                    }),
                ])

                let topDiagnosisName = 'No diagnoses yet'
                let topDiagnosisCount = 0

                if (diagnosisStats.length > 0) {
                    const topDiagnosis = diagnosisStats.reduce((prev, curr) =>
                        curr._count.id > prev._count.id ? curr : prev
                    )

                    topDiagnosisCount = topDiagnosis._count.id

                    const diagnosis = await prisma.diagnosisType.findUnique({
                        where: { id: topDiagnosis.diagnosisTypeId },
                        select: { name: true },
                    })

                    if (diagnosis?.name) {
                        topDiagnosisName = diagnosis.name
                    }
                }

                return NextResponse.json({
                    totalRevenueToday: Number(financialStats._sum.totalAmount || 0),
                    totalReceiptsToday: financialStats._count.id,
                    activeDoctors,
                    patientsWaiting,
                    topDiagnosisName,
                    topDiagnosisCount,
                    lastUpdatedAt: new Date().toISOString(),
                })
            }

            case 'doctor-wise': {
                const stats = await prisma.oPDVisit.groupBy({
                    by: ['doctorId'],
                    _count: { id: true },
                })

                // Fetch doctor names
                const doctorIds = stats.map(s => s.doctorId)
                const doctors = await prisma.doctor.findMany({
                    where: { id: { in: doctorIds } },
                    select: { id: true, name: true }
                })

                const result = stats.map(stat => {
                    const doc = doctors.find(d => d.id === stat.doctorId)
                    return {
                        doctorId: stat.doctorId,
                        doctorName: doc?.name || 'Unknown',
                        patientCount: stat._count.id
                    }
                })
                return NextResponse.json(result)
            }

            case 'diagnosis-wise': {
                const stats = await prisma.oPDDiagnosis.groupBy({
                    by: ['diagnosisTypeId'],
                    _count: { id: true }
                })

                const diagIds = stats.map(s => s.diagnosisTypeId)
                const diagnoses = await prisma.diagnosisType.findMany({
                    where: { id: { in: diagIds } },
                    select: { id: true, name: true }
                })

                const result = stats.map(stat => {
                    const diag = diagnoses.find(d => d.id === stat.diagnosisTypeId)
                    return {
                        diagnosisTypeId: stat.diagnosisTypeId,
                        diagnosisName: diag?.name || 'Unknown',
                        count: stat._count.id
                    }
                })
                return NextResponse.json(result)
            }

            case 'financial': {
                const stats = await prisma.receipt.aggregate({
                    _sum: { totalAmount: true },
                    _count: { id: true },
                    where: {
                        paymentStatus: 'PAID',
                        date: {
                            gte: startOfDay,
                            lte: endOfDay,
                        }
                    }
                })

                return NextResponse.json({
                    totalRevenueToday: stats._sum.totalAmount || 0,
                    totalReceiptsToday: stats._count.id
                })
            }

            default:
                return NextResponse.json({ message: 'Invalid report type' }, { status: 400 })
        }

    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Error generating report' }, { status: 500 })
    }
}
