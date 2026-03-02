import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { signToken, setSession } from '@/lib/auth'
import { findDummyUser } from '@/lib/dummy-users'

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
        let userWithoutPassword: any = null

        const user = await prisma.user.findUnique({
            where: { username: normalizedUsername }
        })

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password)

            if (!isPasswordValid) {
                return NextResponse.json(
                    { message: 'Invalid credentials' },
                    { status: 401 }
                )
            }

            const { password: _, ...dbUserWithoutPassword } = user
            userWithoutPassword = dbUserWithoutPassword
        } else {
            const dummyUser = findDummyUser(normalizedUsername, String(password))

            if (!dummyUser) {
                return NextResponse.json(
                    { message: 'Invalid credentials' },
                    { status: 401 }
                )
            }

            const { password: _, ...dummyUserWithoutPassword } = dummyUser
            userWithoutPassword = dummyUserWithoutPassword
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
