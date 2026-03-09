import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { signToken, setSession } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json()

        if (!username || !password) {
            return NextResponse.json(
                { message: 'Username and password are required' },
                { status: 400 }
            )
        }

        const normalizedUsername = String(username).trim()
        const normalizedUsernameLower = normalizedUsername.toLowerCase()
        const normalizedPassword = String(password)

        let user = await prisma.user.findUnique({
            where: { username: normalizedUsername }
        })

        if (!user) {
            const users = await prisma.user.findMany()
            user = users.find(
                (candidateUser) =>
                    candidateUser.username.toLowerCase() === normalizedUsernameLower
            ) || null
        }

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            )
        }

        let isPasswordValid = false

        try {
            isPasswordValid = await bcrypt.compare(normalizedPassword, user.password)
        } catch {
            isPasswordValid = false
        }

        if (!isPasswordValid && !user.password.startsWith('$2')) {
            isPasswordValid = normalizedPassword === user.password
        }

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            )
        }

        const userWithoutPassword = {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }

        // Generate JWT token
        const token = await signToken(userWithoutPassword)

        // Set cookie
        await setSession(token)

        return NextResponse.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}
