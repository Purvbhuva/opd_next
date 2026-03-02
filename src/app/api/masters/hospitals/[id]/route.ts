import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const data = await req.json()
        const hospital = await prisma.hospital.update({
            where: { id },
            data: {
                name: data.name,
                address: data.address,
                contactInfo: data.contactInfo,
                branch: data.branch || null
            }
        })
        return NextResponse.json(hospital)
    } catch (error) {
        return NextResponse.json({ message: 'Error updating hospital' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.hospital.delete({
            where: { id }
        })
        return NextResponse.json({ message: 'Hospital deleted successfully' })
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting hospital' }, { status: 500 })
    }
}
