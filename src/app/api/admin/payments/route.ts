import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const dateRange = searchParams.get('dateRange');

    let where: any = {};

    if (search) {
      where.OR = [
        { enrollment: { fullName: { contains: search, mode: 'insensitive' } } },
        { enrollment: { email: { contains: search, mode: 'insensitive' } } },
        { enrollment: { phoneNumber: { contains: search, mode: 'insensitive' } } },
        { transactionId: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status && status !== 'all') {
      where.paymentStatus = status;
    }

    if (method && method !== 'all') {
      where.paymentMethod = method;
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      where.createdAt = { gte: startDate };
    }

    // Fetch payments without enrollment relation
    const payments = await (prisma as any).payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Fetch enrollments separately to join data
    const enrollments = await prisma.enrollment.findMany({
      where: payments.length > 0 ? {
        id: {
          in: payments.map((p: any) => p.enrollmentId).filter(Boolean)
        }
      } : undefined,
      take: 100
    });

    // Join payment data with enrollment data
    const paymentsWithEnrollment = payments.map((payment: any) => {
      const enrollment = enrollments.find((e: any) => e.id === payment.enrollmentId);
      return {
        ...payment,
        enrollment: enrollment ? {
          id: enrollment.id,
          fullName: enrollment.fullName,
          email: enrollment.email,
          phoneNumber: enrollment.phoneNumber,
          courseName: enrollment.courseName,
          category: enrollment.categoryId
        } : null
      };
    });

    // Calculate stats
    const totalRevenue = payments
      .filter((p: any) => p.paymentStatus === 'PAID')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    const pendingAmount = payments
      .filter((p: any) => p.paymentStatus === 'PENDING')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const failedAmount = payments
      .filter((p: any) => p.paymentStatus === 'FAILED')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const totalTransactions = payments.length;
    const pendingCount = payments.filter((p: any) => p.paymentStatus === 'PENDING').length;
    const paidCount = payments.filter((p: any) => p.paymentStatus === 'PAID').length;
    const failedCount = payments.filter((p: any) => p.paymentStatus === 'FAILED').length;

    // Calculate monthly revenue and growth
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentMonthRevenue = payments
      .filter((p: any) => p.paymentStatus === 'PAID' && new Date(p.createdAt) >= currentMonthStart)
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const previousMonthRevenue = payments
      .filter((p: any) => p.paymentStatus === 'PAID' && 
        new Date(p.createdAt) >= previousMonthStart && 
        new Date(p.createdAt) < currentMonthStart)
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const monthlyRevenue = currentMonthRevenue;
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      payments: paymentsWithEnrollment,
      stats: {
        totalRevenue,
        pendingAmount,
        paidAmount: totalRevenue,
        failedAmount,
        totalTransactions,
        pendingCount,
        paidCount,
        failedCount,
        monthlyRevenue,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
