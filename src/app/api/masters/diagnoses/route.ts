import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const diagnoses = await prisma.diagnosisType.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(diagnoses)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching diagnoses' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const diagnosis = await prisma.diagnosisType.create({
            data: {
                name: data.name,
                description: data.description || null
            }
        })
        return NextResponse.json(diagnosis, { status: 201 })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'Diagnosis name already exists' }, { status: 400 })
        }
        return NextResponse.json({ message: 'Error creating diagnosis' }, { status: 500 })
    }
}
