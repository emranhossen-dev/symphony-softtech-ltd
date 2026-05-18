import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get counts for courses and modules
    const [courseCount, moduleCount] = await Promise.all([
      prisma.course.count({ where: { isActive: true } }),
      prisma.module.count()
    ]);

    // Get recent enrollments and payments
    const [enrollments, payments] = await Promise.all([
      prisma.enrollment.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Get user counts by role
    const [students, mentors, employees] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      prisma.user.count({ where: { role: 'MENTOR', isActive: true } }),
      prisma.user.count({ where: { role: 'EMPLOYEE', isActive: true } })
    ]);

    // Calculate stats
    const stats = {
      totalEnrollments: enrollments.length || 0,
      pendingApprovals: 0, // You may need to calculate this based on your business logic
      paymentPending: 0, // You may need to calculate this based on your business logic
      activeStudents: students || 0,
      totalRevenue: 0, // You may need to calculate this from payments
      monthlyRevenue: 0, // You may need to calculate this from payments
      revenueGrowth: 0, // You may need to calculate this
      enrollmentGrowth: 0, // You may need to calculate this
      totalCourses: courseCount || 0,
      totalModules: moduleCount || 0,
      completionRate: 0 // You may need to calculate this
    };

    // Create recent activities from enrollments and payments
    const recentActivities = [
      ...enrollments.map(enrollment => ({
        id: enrollment.id,
        type: "enrollment" as const,
        description: `New enrollment received`,
        user: enrollment.fullName || "Unknown Student",
        timestamp: enrollment.createdAt,
        amount: 0
      })),
      ...payments.map(payment => ({
        id: payment.id,
        type: "payment" as const,
        description: `Payment received`,
        user: "Unknown Student",
        timestamp: payment.createdAt,
        amount: payment.amount || 0
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    return NextResponse.json({
      success: true,
      stats,
      recentActivities
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
