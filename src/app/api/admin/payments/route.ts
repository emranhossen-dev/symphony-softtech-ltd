import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all enrollments with payment information
    const enrollments = await prisma.enrollment.findMany({
      include: {
        course: {
          select: {
            title: true,
            price: true,
            category: true
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data into payment records
    const payments = enrollments.map(enrollment => {
      const payment = enrollment.payments[0];
      return {
        id: payment?.id || enrollment.id,
        enrollmentId: enrollment.id,
        fullName: enrollment.fullName,
        phoneNumber: enrollment.phoneNumber,
        email: enrollment.email,
        courseName: enrollment.course?.title || enrollment.courseName || 'Unknown Course',
        amount: enrollment.course?.price || 0,
        paymentMethod: payment?.paymentMethod || null,
        transactionId: payment?.transactionId || enrollment.transactionId,
        paymentStatus: payment?.paymentStatus || enrollment.paymentStatus,
        enrollmentStatus: enrollment.enrollmentStatus,
        createdAt: payment?.createdAt || enrollment.createdAt,
        updatedAt: payment?.updatedAt || enrollment.updatedAt,
        category: enrollment.course?.category || null
      };
    });

    // Calculate stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      totalRevenue: payments.reduce((sum, p) => sum + (p.paymentStatus === 'PAID' ? p.amount : 0), 0),
      paidRevenue: payments.filter(p => p.paymentStatus === 'PAID').reduce((sum, p) => sum + p.amount, 0),
      pendingRevenue: payments.filter(p => p.paymentStatus === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
      failedRevenue: payments.filter(p => p.paymentStatus === 'FAILED').reduce((sum, p) => sum + p.amount, 0),
      cancelledRevenue: payments.filter(p => p.paymentStatus === 'CANCELLED').reduce((sum, p) => sum + p.amount, 0),
      totalTransactions: payments.length,
      paidTransactions: payments.filter(p => p.paymentStatus === 'PAID').length,
      pendingTransactions: payments.filter(p => p.paymentStatus === 'PENDING').length,
      failedTransactions: payments.filter(p => p.paymentStatus === 'FAILED').length,
      cancelledTransactions: payments.filter(p => p.paymentStatus === 'CANCELLED').length,
      onlinePayments: payments.filter(p => {
        const method = p.paymentMethod?.toLowerCase() || '';
        return method.includes('online') || method.includes('bkash') || method.includes('nagad') || method.includes('card');
      }).length,
      manualPayments: payments.filter(p => {
        const method = p.paymentMethod?.toLowerCase() || '';
        return !method.includes('online') && !method.includes('bkash') && !method.includes('nagad') && !method.includes('card');
      }).length,
      todayRevenue: payments
        .filter(p => p.paymentStatus === 'PAID' && new Date(p.createdAt) >= today)
        .reduce((sum, p) => sum + p.amount, 0),
      thisWeekRevenue: payments
        .filter(p => p.paymentStatus === 'PAID' && new Date(p.createdAt) >= weekAgo)
        .reduce((sum, p) => sum + p.amount, 0),
      thisMonthRevenue: payments
        .filter(p => p.paymentStatus === 'PAID' && new Date(p.createdAt) >= monthStart)
        .reduce((sum, p) => sum + p.amount, 0)
    };

    return NextResponse.json({
      success: true,
      payments,
      stats
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
