import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const data = await req.json()

        // Update Doctor Profile
        const doctor = await prisma.doctor.update({
            where: { id },
            data: {
                name: data.name,
                specialization: data.specialization,
                department: data.department,
                availability: data.availability
            },
            include: { user: true }
        })

        // Update User Name if it changed
        await prisma.user.update({
            where: { id: doctor.userId },
            data: { name: data.name }
        })

        const { password, ...userWithoutPassword } = doctor.user
        return NextResponse.json({ ...doctor, user: userWithoutPassword })
    } catch (error) {
        return NextResponse.json({ message: 'Error updating doctor' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        // Need to find the doctor first to get the userId
        const doctor = await prisma.doctor.findUnique({
            where: { id }
        })

        if (!doctor) {
            return NextResponse.json({ message: 'Doctor not found' }, { status: 404 })
        }

        // Delete doctor profile
        await prisma.doctor.delete({
            where: { id }
        })

        // Delete linked user
        await prisma.user.delete({
            where: { id: doctor.userId }
        })

        return NextResponse.json({ message: 'Doctor deleted successfully' })
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting doctor' }, { status: 500 })
    }
}
