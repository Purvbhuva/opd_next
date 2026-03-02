import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
    try {
        const url = new URL(req.url)
        const status = url.searchParams.get('status')
        const doctorId = url.searchParams.get('doctorId')

        const where: any = {}
        if (status) where.status = status
        if (doctorId) where.doctorId = doctorId

        const opdVisits = await prisma.oPDVisit.findMany({
            where,
            include: {
                patient: true,
                doctor: true,
                diagnoses: {
                    include: { diagnosisType: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(opdVisits)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Error fetching OPD visits' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()

        const opdVisit = await prisma.oPDVisit.create({
            data: {
                patientId: data.patientId,
                doctorId: data.doctorId,
                reason: data.reason,
                status: 'QUEUED' // Initial status
            },
            include: {
                patient: true,
                doctor: true
            }
        })
        return NextResponse.json(opdVisit, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: 'Error creating OPD visit' }, { status: 500 })
    }
}
