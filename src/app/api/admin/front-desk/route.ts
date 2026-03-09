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

export async function GET() {
    try {
        const session: any = await getSession()

        if (!session) {
            return unauthorizedResponse()
        }

        if (session.role !== 'ADMIN') {
            return forbiddenResponse()
        }

        const users = await prisma.user.findMany({
            where: { role: 'FRONT_DESK' },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return NextResponse.json(users)
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching front desk users' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session: any = await getSession()

        if (!session) {
            return unauthorizedResponse()
        }

        if (session.role !== 'ADMIN') {
            return forbiddenResponse()
        }

        const data = await req.json()

        const username = String(data.username || '').trim()
        const name = String(data.name || '').trim()
        const password = String(data.password || '')

        if (!username || !name || !password) {
            return NextResponse.json(
                { message: 'Name, username, and password are required' },
                { status: 400 }
            )
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                username,
                password: passwordHash,
                name,
                role: 'FRONT_DESK',
            },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'Username already exists' }, { status: 400 })
        }

        return NextResponse.json({ message: 'Error creating front desk user' }, { status: 500 })
    }
}
