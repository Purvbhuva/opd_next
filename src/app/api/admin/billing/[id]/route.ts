import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { getSession } from '@/lib/auth'

const prisma = new PrismaClient()

function unauthorizedResponse() {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}

function forbiddenResponse() {
    return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session: any = await getSession()

        if (!session) {
            return unauthorizedResponse()
        }

        if (session.role !== 'ADMIN') {
            return forbiddenResponse()
        }

        const { id } = await params

        const existingUser = await prisma.user.findUnique({
            where: { id },
            select: { id: true, role: true },
        })

        if (!existingUser || existingUser.role !== 'BILLING') {
            return NextResponse.json({ message: 'Billing user not found' }, { status: 404 })
        }

        const data = await req.json()
        const updateData: any = {}

        if (typeof data.name === 'string' && data.name.trim()) {
            updateData.name = data.name.trim()
        }

        if (typeof data.username === 'string' && data.username.trim()) {
            updateData.username = data.username.trim()
        }

        if (typeof data.password === 'string' && data.password) {
            updateData.password = await bcrypt.hash(data.password, 10)
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 })
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return NextResponse.json(user)
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'Username already exists' }, { status: 400 })
        }

        return NextResponse.json({ message: 'Error updating billing user' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session: any = await getSession()

        if (!session) {
            return unauthorizedResponse()
        }

        if (session.role !== 'ADMIN') {
            return forbiddenResponse()
        }

        const { id } = await params

        const existingUser = await prisma.user.findUnique({
            where: { id },
            select: { id: true, role: true },
        })

        if (!existingUser || existingUser.role !== 'BILLING') {
            return NextResponse.json({ message: 'Billing user not found' }, { status: 404 })
        }

        await prisma.user.delete({ where: { id } })

        return NextResponse.json({ message: 'Billing user deleted successfully' })
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting billing user' }, { status: 500 })
    }
}
