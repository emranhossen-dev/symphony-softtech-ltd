import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(request: NextRequest) {
  try {
    const { paymentId, reason } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Update payment status to FAILED
    const updatedPayment = await (prisma as any).payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: 'FAILED',
        notes: reason || 'Payment rejected by admin'
      }
    });

    // Update enrollment status back to PENDING_REVIEW
    if (updatedPayment.enrollmentId) {
      await prisma.enrollment.update({
        where: { id: updatedPayment.enrollmentId },
      data: { enrollmentStatus: 'PENDING_REVIEW' }
    });
    }

    return NextResponse.json({
      success: true,
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    return NextResponse.json(
      { error: 'Failed to reject payment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
