import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET() {
  try {
    // In a real application, you'd get user ID from the session/auth token
    const userId = 'current-user-id';

    // Get attendance statistics for the user
    const attendanceRecords = await (prisma as any).attendanceRecord.findMany({
      where: {
        studentId: userId // For students, get their own records
      },
      include: {
        session: {
          include: {
            course: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate statistics
    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((r: any) => r.status === 'PRESENT').length;
    const absentCount = attendanceRecords.filter((r: any) => r.status === 'ABSENT').length;
    const lateCount = attendanceRecords.filter((r: any) => r.status === 'LATE').length;
    const excusedCount = attendanceRecords.filter((r: any) => r.status === 'EXCUSED').length;
    const attendancePercentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    // Calculate monthly trend
    const monthlyData = new Map<string, { present: number; total: number }>();
    
    attendanceRecords.forEach((record: any) => {
      const month = new Date(record.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { present: 0, total: 0 });
      }
      const data = monthlyData.get(month)!;
      data.total++;
      if (record.status === 'PRESENT') {
        data.present++;
      }
    });

    const monthlyTrend = Array.from(monthlyData.entries())
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        month,
        percentage: Math.round((data.present / data.total) * 100)
      }));

    const stats = {
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendancePercentage,
      monthlyTrend
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance statistics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
