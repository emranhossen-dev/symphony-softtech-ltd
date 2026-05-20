import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Map slugs to category strings
const slugToCategory: Record<string, string> = {
  'government': 'GOVERNMENT',
  'online': 'ONLINE',
  'offline': 'OFFLINE',
  'recorded': 'RECORDED'
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // Check if database is available
    if (!prisma) {
      // Return empty data with zeros if database is not available
      const emptyCategory = {
        id: slug,
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug,
        description: `${slug.charAt(0).toUpperCase() + slug.slice(1)} training programs`,
        color: slug === 'government' ? 'green' : slug === 'online' ? 'blue' : slug === 'offline' ? 'purple' : 'orange',
        icon: slug === 'government' ? '🏛️' : slug === 'online' ? '💻' : slug === 'offline' ? '📚' : '🎥',
        isActive: true
      };

      const emptyStats = {
        applied: 0,
        waiting: 0,
        admitted: 0,
        nextBatch: 0,
        rejected: 0,
        totalRevenue: 0,
        activeMentors: 0,
        completionRate: 0,
        monthlyGrowth: 0,
        totalCourses: 0,
        activeStudents: 0,
        averageRating: 0
      };

      return NextResponse.json({
        success: true,
        category: emptyCategory,
        students: [],
        stats: emptyStats
      });
    }

    // Map slug to category string
    const categoryString = slugToCategory[slug];
    if (!categoryString) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 404 }
      );
    }

    // First, find the category by slug to get its ID
    const categoryRecord = await prisma.category.findUnique({
      where: { slug: categoryString.toLowerCase() }
    });

    console.log(`Category record for ${categoryString}:`, categoryRecord);

    // Create category object for response
    const category = categoryRecord || {
      id: slug,
      name: slug === 'offline' ? 'Offline Courses' : slug.charAt(0).toUpperCase() + slug.slice(1),
      slug,
      description: slug === 'offline' ? 'Offline Courses training programs' : `${slug.charAt(0).toUpperCase() + slug.slice(1)} training programs`,
      color: slug === 'government' ? 'green' : slug === 'online' ? 'blue' : slug === 'offline' ? 'purple' : 'orange',
      icon: slug === 'government' ? '🏛️' : slug === 'online' ? '💻' : slug === 'offline' ? '📚' : '🎥',
      isActive: true
    };

    console.log(`Fetching enrollments for category: ${categoryString}, categoryId: ${categoryRecord?.id}`);

    // Fetch enrollments for this category - simpler query
    // Check multiple ways: categoryId, category relation, and course category string
    const enrollments = await prisma.enrollment.findMany({
      where: {
        OR: [
          { categoryId: categoryRecord?.id },
          { category: { slug: categoryString.toLowerCase() } },
          { course: { categoryRelation: { slug: categoryString.toLowerCase() } } },
          { course: { category: categoryString } }
        ]
      },
      include: {
        payments: true,
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            mentor: {
              select: {
                name: true
              }
            },
            categoryRelation: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${enrollments.length} enrollments for ${categoryString}`);

    // Calculate stats
    const approvedEnrollments = enrollments.filter(e => e.enrollmentStatus === 'ADMITTED' as any).length;
    const totalEnrollments = enrollments.length;
    const completionRate = totalEnrollments > 0 ? Math.round((approvedEnrollments / totalEnrollments) * 100) : 0;

    // Get monthly enrollments count
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEnrollments = enrollments.filter(e => {
      const enrollmentDate = new Date(e.createdAt);
      return enrollmentDate.getMonth() === currentMonth && enrollmentDate.getFullYear() === currentYear;
    }).length;

    const stats = {
      applied: enrollments.filter(e => e.enrollmentStatus === 'APPLIED' as any).length,
      waiting: enrollments.filter(e => e.enrollmentStatus === 'WAITING' as any).length,
      admitted: approvedEnrollments,
      nextBatch: enrollments.filter(e => e.enrollmentStatus === 'NEXT_BATCH' as any).length,
      rejected: enrollments.filter(e => e.enrollmentStatus === 'REJECTED').length,
      totalRevenue: enrollments
        .filter(e => e.enrollmentStatus === 'ADMITTED' as any)
        .reduce((sum: number, e: any) => {
          const payment = e.payments && e.payments.length > 0 ? e.payments[0] : null;
          return sum + (payment?.amount || 0);
        }, 0),
      activeMentors: await prisma.course.groupBy({
        by: ['mentorId'],
        where: {
          categoryId: categoryRecord?.id,
          mentorId: {
            not: null
          }
        }
      }).then(groups => groups.length),
      completionRate,
      monthlyGrowth: monthlyEnrollments,
      totalCourses: await prisma.course.count({
        where: { categoryId: categoryRecord?.id }
      }),
      activeStudents: approvedEnrollments,
      averageRating: 0 // Not in current schema
    };

    // Transform enrollments data to match expected format
    const transformedStudents = enrollments.map(enrollment => {
      console.log(`Enrollment ${enrollment.id} payments:`, enrollment.payments);
      const categoryValue = enrollment.course?.category || enrollment.course?.categoryRelation?.slug || enrollment.category?.slug || categoryString;
      return {
        id: enrollment.id,
        name: enrollment.fullName,
        phone: enrollment.phoneNumber,
        email: enrollment.email,
        status: enrollment.enrollmentStatus as any,
        paymentStatus: enrollment.payments && enrollment.payments.length > 0
          ? enrollment.payments[0].paymentStatus
          : 'NOT_REQUIRED',
        courseName: enrollment.courseName || enrollment.course?.title || 'Unknown Course',
        amount: enrollment.payments && enrollment.payments.length > 0
          ? enrollment.payments[0].amount
          : 0,
        assignedMentor: enrollment.course?.mentor?.name,
        appliedDate: enrollment.createdAt.toISOString(),
        avatar: enrollment.fullName.charAt(0).toUpperCase(),
        categoryId: slug,
        category: categoryValue
      };
    });

    return NextResponse.json({
      success: true,
      category,
      students: transformedStudents,
      stats
    });

  } catch (error) {
    console.error('Error fetching category admissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admissions data' },
      { status: 500 }
    );
  }
}
