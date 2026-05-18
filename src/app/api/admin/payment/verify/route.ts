import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Update payment status to PAID
    const updatedPayment = await (prisma as any).payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: 'PAID',
        verifiedAt: new Date()
      }
    });

    // Update enrollment status to ADMITTED if payment is verified
    if (updatedPayment.enrollmentId) {
      await prisma.enrollment.update({
        where: { id: updatedPayment.enrollmentId },
      data: { enrollmentStatus: 'ADMITTED' }
    });
    }

    return NextResponse.json({
      success: true,
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
