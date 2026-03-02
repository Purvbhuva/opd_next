import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const receipts = await prisma.receipt.findMany({
            include: {
                patient: true,
                opdVisit: {
                    include: { doctor: true }
                },
                transactions: {
                    include: {
                        treatmentType: true,
                        subTreatmentType: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(receipts)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Error fetching receipts' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json()
        // data should contain { patientId, opdVisitId(optional), transactions: [{ treatmentTypeId, subTreatmentTypeId, amount }] }

        let totalAmount = 0
        // Calculate total amount from transactions
        if (data.transactions && data.transactions.length > 0) {
            totalAmount = data.transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0)
        }

        // Create the receipt and transactions in a transaction
        const receipt = await prisma.$transaction(async (tx) => {
            const newReceipt = await tx.receipt.create({
                data: {
                    patientId: data.patientId,
                    opdVisitId: data.opdVisitId || null,
                    totalAmount,
                    paymentStatus: data.paymentStatus || 'PAID', // Could be marked UNPAID first
                }
            })

            if (data.transactions && data.transactions.length > 0) {
                const transData = data.transactions.map((t: any) => ({
                    receiptId: newReceipt.id,
                    treatmentTypeId: t.treatmentTypeId,
                    subTreatmentTypeId: t.subTreatmentTypeId || null,
                    amount: Number(t.amount)
                }))

                await tx.receiptTransaction.createMany({
                    data: transData
                })
            }

            return newReceipt
        })

        return NextResponse.json(receipt, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Error creating receipt' }, { status: 500 })
    }
}
