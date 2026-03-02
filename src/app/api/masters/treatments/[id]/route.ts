import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const data = await req.json()
        const treatment = await prisma.treatmentType.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description || null
            }
        })
        return NextResponse.json(treatment)
    } catch (error) {
        return NextResponse.json({ message: 'Error updating treatment' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.treatmentType.delete({
            where: { id }
        })
        return NextResponse.json({ message: 'Treatment deleted successfully' })
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting treatment' }, { status: 500 })
    }
}
