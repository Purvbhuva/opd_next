import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const data = await req.json()
        const diagnosis = await prisma.diagnosisType.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description || null
            }
        })
        return NextResponse.json(diagnosis)
    } catch (error) {
        return NextResponse.json({ message: 'Error updating diagnosis' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.diagnosisType.delete({
            where: { id }
        })
        return NextResponse.json({ message: 'Diagnosis deleted successfully' })
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting diagnosis' }, { status: 500 })
    }
}
