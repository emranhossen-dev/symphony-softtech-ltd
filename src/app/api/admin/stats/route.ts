import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to return zero stats
function getZeroStatsResponse() {
  const zeroStats = {
    quickStats: {
      totalStudents: 0,
      totalRevenue: 0,
      activeCourses: 0,
      pendingApplications: 0,
      totalEnrollments: 0,
      totalMentors: 0,
      recentEnrollments: 0,
      monthlyRevenue: 0
    },
    categoryStats: [
      {
        name: 'Government',
        slug: 'government',
        _count: {
          courses: 0,
          enrollments: 0
        }
      },
      {
        name: 'Online',
        slug: 'online',
        _count: {
          courses: 0,
          enrollments: 0
        }
      },
      {
        name: 'Offline',
        slug: 'offline',
        _count: {
          courses: 0,
          enrollments: 0
        }
      },
      {
        name: 'Recorded',
        slug: 'recorded',
        _count: {
          courses: 0,
          enrollments: 0
        }
      }
    ],
    courseStats: [],
    recentActivities: []
  };

  return NextResponse.json({
    success: true,
    stats: zeroStats
  });
}

// GET /api/admin/stats - Get dynamic admin stats
export async function GET(request: NextRequest) {
  console.log('Stats API called');
  
  try {
    // Check if database is available
    if (!prisma) {
      console.log('Database not available, returning zero stats');
      return getZeroStatsResponse();
    }

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (connectionError) {
      console.error('Database connection test failed:', connectionError);
      return getZeroStatsResponse();
    }
    // Get real-time stats from database
    const [
      totalStudents,
      totalRevenue,
      activeCourses,
      pendingApplications,
      totalEnrollments,
      totalMentors,
      recentEnrollments,
      monthlyRevenue
    ] = await Promise.all([
      // Total unique students
      prisma.enrollment.groupBy({
        by: ['email'],
        _count: true
      }).then(result => result.length),
      
      // Total revenue from paid enrollments
      prisma.payment.aggregate({
        where: {
          paymentStatus: 'PAID'
        },
        _sum: {
          amount: true
        }
      }),
      
      // Active courses
      prisma.course.count({
        where: {
          isActive: true
        }
      }),
      
      // Pending applications
      prisma.enrollment.count({
        where: {
          enrollmentStatus: 'PENDING_REVIEW'
        }
      }),
      
      // Total enrollments
      prisma.enrollment.count(),
      
      // Total mentors
      prisma.user.count({
        where: {
          role: 'MENTOR'
        }
      }),
      
      // Recent enrollments (last 7 days)
      prisma.enrollment.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Monthly revenue (last 30 days)
      prisma.payment.aggregate({
        where: {
          paymentStatus: 'PAID',
          enrollment: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        _sum: {
          amount: true
        }
      })
    ]);

    // Get category-wise stats
    const categoryStats = await prisma.category.findMany({
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            courses: true,
            enrollments: true
          }
        }
      }
    });

    // Get course-wise stats
    const courseStats = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        price: true,
        isActive: true,
        _count: {
          select: {
            enrollments: true,
            modules: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Get recent activities
    const recentActivities = await prisma.enrollment.findMany({
      select: {
        id: true,
        fullName: true,
        courseName: true,
        enrollmentStatus: true,
        createdAt: true,
        course: {
          select: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    const stats = {
      quickStats: {
        totalStudents,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeCourses,
        pendingApplications,
        totalEnrollments,
        totalMentors,
        recentEnrollments,
        monthlyRevenue: monthlyRevenue._sum.amount || 0
      },
      categoryStats,
      courseStats,
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        title: `${activity.fullName} enrolled in ${activity.courseName}`,
        description: `Status: ${activity.enrollmentStatus} • Category: ${activity.course?.category || 'N/A'}`,
        timestamp: activity.createdAt,
        type: 'enrollment'
      }))
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    console.log('Database error, returning zero stats');
    
    // Always return zero stats when there's any error
    return getZeroStatsResponse();
  }
}
