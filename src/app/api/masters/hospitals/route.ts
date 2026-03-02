import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const hospitals = await prisma.hospital.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(hospitals)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching hospitals' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const hospital = await prisma.hospital.create({
            data: {
                name: data.name,
                address: data.address,
                contactInfo: data.contactInfo,
                branch: data.branch || null
            }
        })
        return NextResponse.json(hospital, { status: 201 })
    } catch (error) {
        return NextResponse.json({ message: 'Error creating hospital' }, { status: 500 })
    }
}
