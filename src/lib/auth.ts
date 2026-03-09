import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'super_secret_key_change_me_in_production'
)

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(SECRET_KEY)
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY)
        return payload
    } catch (error) {
        return null
    }
}

export async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null
    return await verifyToken(token)
}

export async function setSession(token: string) {
    //cookieStore is an object used to manage cookies.
    const cookieStore = await cookies()
    // auth_token cookie name
    cookieStore.set('auth_token', token, {
        httpOnly: true,
        // Cookie works only over HTTPS.
        // In production → true
        // In development → false
        secure: process.env.NODE_ENV === 'production',
        // Controls cross-site requests.
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
    })
}

export async function clearSession() {
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')
}
