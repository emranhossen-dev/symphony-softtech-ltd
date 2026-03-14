import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(request: NextRequest) {
  try {
    // Check if prisma is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch all relevant data for export
    const enrollments = await prisma.enrollment.findMany({
      where: {
        createdAt: {
          gte: startDate
        },
        enrollmentStatus: 'APPROVED'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const payments = await prisma.payment.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const users = await (prisma as any).user.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Generate CSV content
    const csvHeaders = [
      'Type',
      'Date',
      'User/Course',
      'Category',
      'Amount',
      'Status'
    ];

    const csvRows = [
      ...enrollments.map(e => [
        'Enrollment',
        e.createdAt.toISOString(),
        e.fullName,
        e.courseName,
        e.categoryId,
        '',
        e.enrollmentStatus
      ]),
      ...payments.map(p => [
        'Payment',
        p.createdAt.toISOString(),
        '',
        p.amount || 0,
        p.paymentStatus
      ]),
      ...users.map((u: any) => [
        'User',
        u.createdAt.toISOString(),
        u.fullName,
        '',
        '',
        u.isActive ? 'Active' : 'Inactive'
      ])
    ];

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    // Create CSV blob and return
    const blob = new Blob([csvContent], { type: 'text/csv' });
    
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${timeRange}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
