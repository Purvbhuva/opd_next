import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const doctors = await prisma.doctor.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        })

        // Remove passwords before sending to frontend
        const doctorsWithoutPasswords = doctors.map(doc => {
            const { password, ...userWithoutPassword } = doc.user
            return { ...doc, user: userWithoutPassword }
        })

        return NextResponse.json(doctorsWithoutPasswords)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching doctors' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()

        // Validate required fields
        if (!data.password) {
            return NextResponse.json({ message: 'Password is required' }, { status: 400 })
        }

        // First we need to create the User for this doctor to login
        const passwordHash = await bcrypt.hash(data.password, 10)

        const user = await prisma.user.create({
            data: {
                username: data.username,
                password: passwordHash,
                name: data.name,
                role: 'DOCTOR'
            }
        })

        // Now create the Doctor profile linked to the User
        const doctor = await prisma.doctor.create({
            data: {
                name: data.name,
                specialization: data.specialization,
                department: data.department,
                availability: data.availability,
                userId: user.id
            },
            include: { user: true }
        })

        const { password, ...userWithoutPassword } = doctor.user
        return NextResponse.json({ ...doctor, user: userWithoutPassword }, { status: 201 })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'Username already exists' }, { status: 400 })
        }
        return NextResponse.json({ message: 'Error creating doctor' }, { status: 500 })
    }
}
