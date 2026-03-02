import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const subTreatments = await prisma.subTreatmentType.findMany({
            include: { treatmentType: true },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(subTreatments)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching sub-treatments' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const subTreatment = await prisma.subTreatmentType.create({
            data: {
                name: data.name,
                treatmentTypeId: data.treatmentTypeId
            },
            include: { treatmentType: true }
        })
        return NextResponse.json(subTreatment, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: 'Error creating sub-treatment' }, { status: 500 })
    }
}
