import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthError, verifyToken, hasRole } from '@/lib/auth';

// GET all enrollments with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Try both Authorization header and cookie
    const rawAuthHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
    const authHeader = rawAuthHeader && rawAuthHeader !== 'null' && rawAuthHeader !== 'undefined' ? rawAuthHeader : null;
    const cookieToken = request.cookies.get('auth-token')?.value;
    
    const token = authHeader || cookieToken;
    
    if (!token) {
      console.log('No token found in header or cookies');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      console.log('Insufficient permissions for role:', payload.role);
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== 'all') {
      where.enrollmentStatus = status;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { courseName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [enrollments, totalCount] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          course: {
            select: {
              id: true,
              title: true,
              category: true
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              paymentStatus: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.enrollment.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Calculate comprehensive stats from enrollments
    const totalRevenue = enrollments.reduce((sum, e) => {
      const paidAmount = e.payments
        .filter(p => p.paymentStatus === 'PAID')
        .reduce((paymentSum, p) => paymentSum + (p.amount || 0), 0);
      return sum + paidAmount;
    }, 0);

    const pendingRevenue = enrollments.reduce((sum, e) => {
      const pendingAmount = e.payments
        .filter(p => p.paymentStatus === 'PENDING')
        .reduce((paymentSum, p) => paymentSum + (p.amount || 0), 0);
      return sum + pendingAmount;
    }, 0);

    const completedEnrollments = enrollments.filter(e => e.enrollmentStatus === 'ADMITTED').length;
    const totalEnrollmentsForRate = enrollments.length;
    const completionRate = totalEnrollmentsForRate > 0 ? Math.round((completedEnrollments / totalEnrollmentsForRate) * 100) : 0;

    // Get monthly enrollments count
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEnrollments = enrollments.filter(e => {
      const enrollmentDate = new Date(e.createdAt);
      return enrollmentDate.getMonth() === currentMonth && enrollmentDate.getFullYear() === currentYear;
    }).length;

    const stats = {
      totalEnrollments: totalCount,
      pendingEnrollments: enrollments.filter(e => e.enrollmentStatus === 'APPLIED').length,
      approvedEnrollments: enrollments.filter(e => e.enrollmentStatus === 'ADMITTED').length,
      rejectedEnrollments: enrollments.filter(e => e.enrollmentStatus === 'REJECTED').length,
      paymentPendingEnrollments: enrollments.filter(e => e.enrollmentStatus === 'WAITING').length,
      
      completedEnrollments,
      totalRevenue,
      pendingRevenue,
      monthlyEnrollments,
      completionRate
    };

    return NextResponse.json({
      success: true,
      enrollments,
      stats,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/enrollments - Update enrollment status
export async function PATCH(request: NextRequest) {
  try {
    console.log('PATCH request received');
    
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      throw new AuthError('Authentication required', 401);
    }

    console.log('Token found, verifying...');
    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      console.log('Invalid role:', payload.role);
      throw new AuthError('Insufficient permissions', 403);
    }

    console.log('Authentication successful, parsing body...');
    const body = await request.json();
    const { enrollmentId, status } = body;

    console.log('Parsed body:', { enrollmentId, status });

    if (!enrollmentId || !status) {
      console.log('Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Enrollment ID and status are required' },
        { status: 400 }
      );
    }

    console.log('Checking Prisma client...');
    if (!prisma) {
      console.log('Prisma client not available');
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    console.log('Updating enrollment:', { enrollmentId, status });
    
    // Update enrollment status
    const enrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { enrollmentStatus: status },
      include: {
        payments: true,
        course: {
          include: {
            mentor: {
              select: {
                name: true
              }
            }
          }
        },
        category: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    console.log('Update successful:', enrollment);

    // If admitted, send email notification
    if (status === 'ADMITTED') {
      // TODO: Send email with password setup link
      console.log(`Enrollment ${enrollmentId} admitted. Email should be sent to ${enrollment.email}`);
    }

    return NextResponse.json({
      success: true,
      enrollment,
      message: `Enrollment ${status.toLowerCase()} successfully`
    });

  } catch (error: any) {
    console.error('Error updating enrollment:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update enrollment' },
      { status: 500 }
    );
  }
}

