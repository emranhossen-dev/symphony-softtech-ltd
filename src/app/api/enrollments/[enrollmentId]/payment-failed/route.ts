import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    const { enrollmentId } = params;
    const { transactionId, error, status } = await request.json();

    // Update enrollment payment status to failed
    const enrollment = await prisma?.enrollment.update({
      where: { id: enrollmentId },
      data: {
        paymentStatus: 'FAILED',
        enrollmentStatus: 'PAYMENT_FAILED',
        transactionId,
        metadata: {
          error,
          failedAt: new Date().toISOString(),
          failureReason: error || 'Payment failed'
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
      message: 'Payment failure recorded',
      enrollment: {
        id: enrollment.id,
        status: enrollment.enrollmentStatus,
        paymentStatus: enrollment.paymentStatus
      }
    });

  } catch (error) {
    console.error('Payment failed update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment failure' },
      { status: 500 }
    );
  }
}
