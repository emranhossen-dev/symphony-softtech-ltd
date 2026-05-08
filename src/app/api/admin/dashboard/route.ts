import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Get counts for courses and modules
    const [courseCount, moduleCount] = await Promise.all([
      supabase.from('courses').select('*', { count: 'exact', head: true }).eq('isActive', true),
      supabase.from('modules').select('*', { count: 'exact', head: true })
    ]);

    // Get recent enrollments and payments
    const [enrollments, payments] = await Promise.all([
      supabase
        .from('enrollments')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(50), // Reduced from 100 for better performance
      supabase
        .from('payments')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(50)
    ]);

    // Get user counts by role
    const [students, mentors, employees] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT').eq('isActive', true),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'MENTOR').eq('isActive', true),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'EMPLOYEE').eq('isActive', true)
    ]);

    // Handle potential errors and provide defaults
    const courseCountData = courseCount.error ? { count: 0 } : courseCount
    const moduleCountData = moduleCount.error ? { count: 0 } : moduleCount
    const enrollmentsData = enrollments.error ? { data: [] } : enrollments
    const paymentsData = payments.error ? { data: [] } : payments
    const studentsData = students.error ? { count: 0 } : students
    const mentorsData = mentors.error ? { count: 0 } : mentors
    const employeesData = employees.error ? { count: 0 } : employees

    // Calculate stats
    const stats = {
      totalEnrollments: enrollmentsData.data?.length || 0,
      pendingApprovals: 0, // You may need to calculate this based on your business logic
      paymentPending: 0, // You may need to calculate this based on your business logic
      activeStudents: studentsData.count || 0,
      totalRevenue: 0, // You may need to calculate this from payments
      monthlyRevenue: 0, // You may need to calculate this from payments
      revenueGrowth: 0, // You may need to calculate this
      enrollmentGrowth: 0, // You may need to calculate this
      totalCourses: courseCountData.count || 0,
      totalModules: moduleCountData.count || 0,
      completionRate: 0 // You may need to calculate this
    };

    // Create recent activities from enrollments and payments
    const recentActivities = [
      ...(enrollmentsData.data || []).map(enrollment => ({
        id: enrollment.id,
        type: "enrollment" as const,
        description: `New enrollment received`,
        user: enrollment.studentName || "Unknown Student",
        timestamp: enrollment.createdAt,
        amount: enrollment.amount
      })),
      ...(paymentsData.data || []).map(payment => ({
        id: payment.id,
        type: "payment" as const,
        description: `Payment received`,
        user: payment.studentName || "Unknown Student",
        timestamp: payment.createdAt,
        amount: payment.amount
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
