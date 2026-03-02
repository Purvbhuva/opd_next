import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const data = await req.json()
        const subTreatment = await prisma.subTreatmentType.update({
            where: { id },
            data: {
                name: data.name,
                treatmentTypeId: data.treatmentTypeId
            },
            include: { treatmentType: true }
        })
        return NextResponse.json(subTreatment)
    } catch (error) {
        return NextResponse.json({ message: 'Error updating sub-treatment' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.subTreatmentType.delete({
            where: { id }
        })
        return NextResponse.json({ message: 'Sub-treatment deleted successfully' })
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting sub-treatment' }, { status: 500 })
    }
}
