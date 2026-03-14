import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    const { enrollmentId } = params;
    const { transactionId, amount, paymentMethod, cardType, cardBrand, bankTransactionId } = await request.json();

    // First check if payment record exists
    const existingPayment = await prisma?.payment.findFirst({
      where: {
        enrollmentId,
        transactionId
      }
    });

    // Create or update the payment record
    const payment = await prisma?.payment.upsert({
      where: {
        id: existingPayment?.id || ''
      },
      update: {
        paymentStatus: 'PAID',
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'sslcommerz',
        updatedAt: new Date()
      },
      create: {
        enrollmentId,
        transactionId,
        paymentStatus: 'PAID',
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'sslcommerz'
      }
    });

    // Then update enrollment status to APPROVED if payment is successful
    const enrollment = await prisma?.enrollment.update({
      where: { id: enrollmentId },
      data: {
        enrollmentStatus: 'APPROVED'
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully',
      enrollment: {
        id: enrollment.id,
        status: enrollment.enrollmentStatus,
        paymentStatus: payment?.paymentStatus,
        transactionId
      }
    });

  } catch (error) {
    console.error('Payment success update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}
