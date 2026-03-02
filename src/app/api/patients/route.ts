import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Generate a unique patient ID e.g. PAT-20231015-001
function generatePatientId() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `PAT-${dateStr}-${randomNum}`
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url)
        const search = url.searchParams.get('search')

        // If search param exists, filter by name, mobile, or uniqueId
        const where = search ? {
            OR: [
                { name: { contains: search } },
                { mobile: { contains: search } },
                { uniqueId: { contains: search } },
            ]
        } : {}

        const patients = await prisma.patient.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(patients)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching patients' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const uniqueId = generatePatientId()

        const patient = await prisma.patient.create({
            data: {
                uniqueId,
                name: data.name,
                age: parseInt(data.age),
                gender: data.gender,
                mobile: data.mobile,
                address: data.address || null
            }
        })
        return NextResponse.json(patient, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: 'Error creating patient' }, { status: 500 })
    }
}
