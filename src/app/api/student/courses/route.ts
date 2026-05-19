import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(request: NextRequest) {
  try {
    // Get user from auth token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from token
    const { getUserFromToken } = await import('@/lib/auth');
    const user = await getUserFromToken(token);

    // Fetch all enrollments (both approved and pending)
    const enrollments = await (prisma as any).enrollment.findMany({
      where: {
        userId: user.id
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            description: true,
            thumbnail: true,
            duration: true,
            price: true,
            slug: true,
            mentor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        payments: {
          select: {
            paymentStatus: true,
            paymentMethod: true,
            amount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match expected format with real progress
    const transformedCourses = await Promise.all(
      enrollments.map(async (enrollment: any) => {
        let completedModules = 0;
        let totalModules = 0;
        let progress = 0;
        let timeSpent = 0;
        
        // Get real module progress for admitted courses
        if (enrollment.enrollmentStatus === 'ADMITTED') {
          try {
            // Get module count
            const moduleCount = await (prisma as any).module.count({
              where: {
                courseId: enrollment.courseId
              }
            });
            totalModules = moduleCount;
            
            // Get completed modules
            const completedModuleData = await (prisma as any).moduleProgress.findMany({
              where: {
                userId: user.id,
                courseId: enrollment.courseId,
                completed: true
              }
            });
            completedModules = completedModuleData.length;
            
            // Calculate progress
            progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
            
            // Calculate time spent (assuming 30 min per completed module)
            timeSpent = Math.round(completedModules * 0.5);
            
          } catch (error) {
            console.error('Error fetching module progress:', error);
          }
        }
        
        return {
          id: enrollment.courseId || enrollment.id,
          title: enrollment.course.title,
          slug: enrollment.course.slug || `course-${enrollment.id}`,
          category: enrollment.course.category || 'General',
          instructor: enrollment.course.mentor?.name || 'Assigned Mentor',
          thumbnail: enrollment.course.thumbnail,
          description: enrollment.course.description,
          duration: enrollment.course.duration || 'Not specified',
          enrolledAt: enrollment.createdAt.toISOString(),
          lastAccessed: enrollment.updatedAt.toISOString(),
          enrollmentStatus: enrollment.enrollmentStatus,
          progress: {
            completedModules,
            totalModules,
            percentage: progress,
            lastAccessed: enrollment.updatedAt.toISOString(),
            timeSpent
          },
          upcomingClasses: [], // Would be populated from attendance sessions
          materials: [] // Would be populated from course materials
        };
      })
    );

    return NextResponse.json({
      success: true,
      courses: transformedCourses
    });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
