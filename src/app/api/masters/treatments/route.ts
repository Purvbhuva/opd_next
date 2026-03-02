import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const treatments = await prisma.treatmentType.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(treatments)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching treatments' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const treatment = await prisma.treatmentType.create({
            data: {
                name: data.name,
                description: data.description || null
            }
        })
        return NextResponse.json(treatment, { status: 201 })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'Treatment name already exists' }, { status: 400 })
        }
        return NextResponse.json({ message: 'Error creating treatment' }, { status: 500 })
    }
}
