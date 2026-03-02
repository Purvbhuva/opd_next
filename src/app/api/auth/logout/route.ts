import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/auth'

export async function POST() {
    try {
        await clearSession()
        return NextResponse.json({ message: 'Logged out successfully' })
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
