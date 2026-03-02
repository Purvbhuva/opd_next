import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Create Users
    const passwordHash = await bcrypt.hash('password123', 10)

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: passwordHash,
            name: 'System Administrator',
            role: 'ADMIN',
        },
    })

    const frontDesk = await prisma.user.upsert({
        where: { username: 'reception' },
        update: {},
        create: {
            username: 'reception',
            password: passwordHash,
            name: 'Front Desk User',
            role: 'FRONT_DESK',
        },
    })

    const billingUser = await prisma.user.upsert({
        where: { username: 'billing' },
        update: {},
        create: {
            username: 'billing',
            password: passwordHash,
            name: 'Billing Department',
            role: 'BILLING',
        },
    })

    const doctorUser = await prisma.user.upsert({
        where: { username: 'drsmith' },
        update: {},
        create: {
            username: 'drsmith',
            password: passwordHash,
            name: 'Dr. John Smith',
            role: 'DOCTOR',
        },
    })

    // Create Hospital
    const hospital = await prisma.hospital.create({
        data: {
            name: 'City General Hospital',
            address: '123 Medical Way, Health City',
            contactInfo: 'contact@cityhospital.com | +1 234 567 8900',
            branch: 'Main Branch'
        }
    })

    // Create Doctor Profile
    await prisma.doctor.upsert({
        where: { userId: doctorUser.id },
        update: {},
        create: {
            userId: doctorUser.id,
            name: 'Dr. John Smith',
            specialization: 'General Physician',
            department: 'General Medicine',
            availability: 'Mon-Fri 09:00 AM - 05:00 PM',
        }
    })

    console.log('Database seeded successfully!')
    console.log('Users created:')
    console.log('- admin / password123 (ADMIN)')
    console.log('- reception / password123 (FRONT_DESK)')
    console.log('- drsmith / password123 (DOCTOR)')
    console.log('- billing / password123 (BILLING)')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
