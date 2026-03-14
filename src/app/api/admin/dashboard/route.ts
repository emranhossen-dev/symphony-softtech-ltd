import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  return withErrorHandling(async (req) => {
    // Get current date and previous month for comparison
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get counts for courses and modules
    const [courseCount, moduleCount] = await Promise.all([
      prisma.course.count({ where: { isActive: true } }),
      prisma.module.count()
    ]);

    // Optimized single query with includes and reduced data
    const [enrollments, payments] = await Promise.all([
      prisma.enrollment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50, // Reduced from 100 for better performance
        select: {
          id: true,
          fullName: true,
          courseName: true,
          enrollmentStatus: true,
          categoryId: true,
          createdAt: true,
        }
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50, // Reduced from 100 for better performance
        include: {
          enrollment: true
        }
      })
    ]);

    // Optimized stats calculation
    const stats = enrollments.reduce((acc, e) => {
      acc.totalEnrollments++;
      if (e.enrollmentStatus === 'PENDING_REVIEW') acc.pendingApprovals++;
      else if (e.enrollmentStatus === 'PAYMENT_PENDING') acc.paymentPending++;
      else if (e.enrollmentStatus === 'APPROVED') acc.activeStudents++;
      return acc;
    }, { totalEnrollments: 0, pendingApprovals: 0, paymentPending: 0, activeStudents: 0 });

    // Calculate revenue
    const paidPayments = payments.filter((p) => p.paymentStatus === 'PAID');
    const totalRevenue = paidPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    const currentMonthPayments = paidPayments.filter((p) => 
      new Date(p.createdAt) >= currentMonthStart
    );
    const monthlyRevenue = currentMonthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const previousMonthPayments = paidPayments.filter((p) => 
      new Date(p.createdAt) >= previousMonthStart && new Date(p.createdAt) < previousMonthEnd
    );
    const previousMonthRevenue = previousMonthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    // Calculate growth percentages
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;

    const currentMonthEnrollments = enrollments.filter(e => 
      new Date(e.createdAt) >= currentMonthStart
    ).length;
    const previousMonthEnrollments = enrollments.filter(e => 
      new Date(e.createdAt) >= previousMonthStart && new Date(e.createdAt) < previousMonthEnd
    ).length;
    const enrollmentGrowth = previousMonthEnrollments > 0 
      ? ((currentMonthEnrollments - previousMonthEnrollments) / previousMonthEnrollments) * 100 
      : 0;

    // Generate recent activities
    const recentActivities = [
      ...enrollments.slice(0, 3).map(e => ({
        id: e.id,
        type: 'enrollment' as const,
        description: `New enrollment: ${e.fullName} - ${e.courseName}`,
        user: e.fullName,
        timestamp: e.createdAt,
        amount: undefined
      })),
      ...payments.slice(0, 2).map((p) => ({
        id: p.id,
        type: p.paymentStatus === 'PAID' ? 'payment' as const : 'payment' as const,
        description: `Payment ${p.paymentStatus === 'PAID' ? 'received' : 'pending'}: ${p.amount || 0}`,
        amount: p.amount || 0,
        user: p.enrollment?.fullName || 'Unknown',
        timestamp: p.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Generate category data
    const categoryCounts = enrollments.reduce((acc, e) => {
      const category = String(e.categoryId || 'Other');
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
      color: name === 'GOVERNMENT' ? '#10b981' :
             name === 'RECORDED' ? '#3b82f6' :
             name === 'ONLINE' ? '#8b5cf6' :
             name === 'OFFLINE' ? '#6b7280' : '#6b7280'
    }));

    // Generate monthly data for the last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthEnrollments = enrollments.filter((e: any) => 
        new Date(e.createdAt) >= monthDate && new Date(e.createdAt) < monthEnd
      ).length;
      
      const monthPayments = paidPayments.filter((p) => 
        new Date(p.createdAt) >= monthDate && new Date(p.createdAt) < monthEnd
      );
      const monthRevenue = monthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      monthlyData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        enrollments: monthEnrollments,
        revenue: monthRevenue
      });
    }

    const finalStats = {
      totalEnrollments: stats.totalEnrollments,
      pendingApprovals: stats.pendingApprovals,
      paymentPending: stats.paymentPending,
      activeStudents: stats.activeStudents,
      totalRevenue,
      monthlyRevenue,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      enrollmentGrowth: Math.round(enrollmentGrowth * 10) / 10,
      totalCourses: courseCount,
      totalModules: moduleCount,
      completionRate: 0, // TODO: Calculate actual completion rate based on module progress
    };

    return NextResponse.json({
      success: true,
      stats: finalStats,
      recentActivities,
      categoryData,
      monthlyData
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });
  }, request);
}
