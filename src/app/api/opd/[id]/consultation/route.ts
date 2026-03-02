import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const data = await req.json()
        // data.diagnoses should be an array of { diagnosisTypeId: string, notes: string }

        // 1. Update OPD Visit Status to IN_CONSULTATION or COMPLETED
        const opdVisit = await prisma.oPDVisit.update({
            where: { id },
            data: {
                status: data.status || 'COMPLETED'
            }
        })

        // 2. Add Diagnoses records
        if (data.diagnoses && data.diagnoses.length > 0) {
            const diagnosisPromises = data.diagnoses.map((diag: any) => {
                return prisma.oPDDiagnosis.create({
                    data: {
                        opdVisitId: id,
                        diagnosisTypeId: diag.diagnosisTypeId,
                        notes: diag.notes || null,
                    }
                })
            })
            await Promise.all(diagnosisPromises)
        }

        return NextResponse.json({ message: 'Consultation saved successfully', opdVisit })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Error saving consultation details' }, { status: 500 })
    }
}

// Get consultation details specifically
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const opdVisit = await prisma.oPDVisit.findUnique({
            where: { id },
            include: {
                patient: true,
                doctor: true,
                diagnoses: {
                    include: { diagnosisType: true }
                }
            }
        })

        if (!opdVisit) {
            return NextResponse.json({ message: 'OPD Visit not found' }, { status: 404 })
        }

        return NextResponse.json(opdVisit)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching consultation details' }, { status: 500 })
    }
}
