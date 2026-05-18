import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(request: NextRequest) {
  try {
    const { filters } = await request.json();

    let where: any = {};

    if (filters?.search) {
      where.OR = [
        { enrollment: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        { enrollment: { email: { contains: filters.search, mode: 'insensitive' } } },
        { enrollment: { phoneNumber: { contains: filters.search, mode: 'insensitive' } } },
        { transactionId: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters?.status && filters.status !== 'all') {
      where.paymentStatus = filters.status;
    }

    if (filters?.method && filters.method !== 'all') {
      where.paymentMethod = filters.method;
    }

    if (filters?.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
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

    // Fetch payments with enrollment data
    const payments = await prisma.payment.findMany({
      where,
      include: {
        enrollment: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            courseName: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Generate CSV
    const csvHeaders = [
      'Payment ID',
      'Student Name',
      'Email',
      'Phone',
      'Course Name',
      'Category',
      'Amount',
      'Payment Method',
      'Transaction ID',
      'Status',
      'Created Date',
      'Verified Date',
      'Notes'
    ];

    const csvRows = payments.map(payment => [
      payment.id,
      payment.enrollment?.fullName || '',
      payment.enrollment?.email || '',
      payment.enrollment?.phoneNumber || '',
      payment.enrollment?.courseName || '',
      payment.enrollment?.category || '',
      payment.amount || 0,
      payment.paymentMethod || '',
      payment.transactionId || '',
      payment.paymentStatus || '',
      new Date(payment.createdAt).toLocaleString(),
      (payment as any).verifiedAt ? new Date((payment as any).verifiedAt).toLocaleString() : '',
      (payment as any).notes || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create response with CSV file
    const buffer = Buffer.from(csvContent, 'utf-8');
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="payments_${new Date().toISOString().split('T')[0]}.csv"`,
        'Content-Length': buffer.length.toString()
      }
    });
  } catch (error) {
    console.error('Error exporting payments:', error);
    return NextResponse.json(
      { error: 'Failed to export payments' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
