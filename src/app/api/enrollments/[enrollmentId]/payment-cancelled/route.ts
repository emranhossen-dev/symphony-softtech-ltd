import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    const { enrollmentId } = params;
    const { transactionId, status } = await request.json();

    // Update enrollment payment status to cancelled
    const enrollment = await prisma?.enrollment.update({
      where: { id: enrollmentId },
      data: {
        paymentStatus: 'CANCELLED',
        enrollmentStatus: 'PAYMENT_CANCELLED',
        transactionId,
        metadata: {
          cancelledAt: new Date().toISOString(),
          cancellationReason: 'User cancelled payment'
        }
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
      message: 'Payment cancellation recorded',
      enrollment: {
        id: enrollment.id,
        status: enrollment.enrollmentStatus,
        paymentStatus: enrollment.paymentStatus
      }
    });

  } catch (error) {
    console.error('Payment cancelled update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment cancellation' },
      { status: 500 }
    );
  }
}
