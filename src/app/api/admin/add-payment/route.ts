import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { enrollmentId, transactionId, amount, paymentMethod } = await request.json();

    // Create a payment record
    const payment = await prisma?.payment.create({
      data: {
        enrollmentId,
        transactionId: transactionId || `TEST_${Date.now()}`,
        paymentStatus: 'PAID',
        amount: parseFloat(amount) || 5000,
        paymentMethod: paymentMethod || 'manual'
      }
    });

    // Update enrollment status
    const enrollment = await prisma?.enrollment.update({
      where: { id: enrollmentId },
      data: {
        enrollmentStatus: 'ADMITTED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment added successfully',
      payment,
      enrollment
    });

  } catch (error) {
    console.error('Error adding payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add payment' },
      { status: 500 }
    );
  }
}
