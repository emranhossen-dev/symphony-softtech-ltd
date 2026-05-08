import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/courses/[courseId] - Get single course for students
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  let courseId: string = '';
  try {
    const { courseId: id } = await params;
    courseId = id;

    const course = await prisma?.course.findUnique({
      where: { id: courseId },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        modules: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Course not found'
        },
        { status: 404 }
      );
    }

    // Only return active courses to students
    if (!course.isActive) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Course is not available'
        },
        { status: 403 }
      );
    }

    // Get related courses from same category
    const relatedCourses = await prisma?.course.findMany({
      where: {
        id: { not: courseId },
        category: course.category,
        isActive: true
      },
      take: 3,
      select: {
        id: true,
        title: true,
        shortDescription: true,
        thumbnail: true,
        category: true,
        price: true,
        duration: true
      }
    });

    return NextResponse.json({
      success: true,
      course,
      relatedCourses: relatedCourses || []
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    
    // Return mock data for specific course IDs
    const mockCourses: Record<string, any> = {
      'course-1': {
        id: 'course-1',
        title: 'BCS Preparation',
        slug: 'bcs-preparation',
        description: 'Complete BCS exam preparation with all subjects and mock tests. This comprehensive course covers everything you need to prepare for Bangladesh Civil Service (BCS) examinations including preliminary test, written test, and viva voce.',
        shortDescription: 'Complete BCS exam preparation',
        price: 5000,
        duration: '6 months',
        thumbnail: '',
        category: 'GOVERNMENT',
        categoryId: 'cat-1',
        isActive: true,
        featured: true,
        rating: 4.5,
        reviewCount: 125,
        enrollmentCount: 450,
        level: 'Beginner',
        createdAt: new Date().toISOString(),
        mentor: {
          id: 'user-2',
          name: 'Dr. Ahmed',
          email: 'ahmed@example.com'
        },
        modules: [
          {
            id: 'module-1',
            courseId: 'course-1',
            title: '🏛️ BCS Preparation - Government Job Preparation',
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            homework: "📋 **Government Job Preparation Module**\n\n**Course:** BCS Preparation\n\n**Topics Covered:**\n1. Exam pattern and syllabus\n2. Previous year questions analysis\n3. Study materials and resources\n4. Time management strategies\n5. Interview preparation tips\n\n**Assignment:**\n- Complete practice set 1 (Pages 15-25)\n- Watch all video lectures\n- Join weekly doubt clearing session\n- Submit mock test by Friday\n\n**Important Dates:**\n- Next Mock Test: Every Saturday\n- Result Announcement: Every Monday\n\n📞 Helpline: +880 1234-567890\n\nBest wishes for your government career! 🇧🇩",
            order: 1,
            isLocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      },
      'course-2': {
        id: 'course-2',
        title: 'Web Development Bootcamp',
        slug: 'web-development-bootcamp',
        description: 'Learn HTML, CSS, JavaScript, React from scratch to advanced. This comprehensive bootcamp covers everything from basic web development to advanced React patterns and deployment strategies.',
        shortDescription: 'Complete web development course',
        price: 8000,
        duration: '3 months',
        thumbnail: '',
        category: 'ONLINE',
        categoryId: 'cat-2',
        isActive: true,
        featured: true,
        rating: 4.8,
        reviewCount: 200,
        enrollmentCount: 320,
        level: 'Beginner',
        createdAt: new Date().toISOString(),
        mentor: {
          id: 'user-2',
          name: 'John Doe',
          email: 'john@example.com'
        },
        modules: [
          {
            id: 'module-2',
            courseId: 'course-2',
            title: '💻 Web Development Bootcamp - Online Learning Introduction',
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            homework: "🌐 **Online Learning Module**\n\n**Course:** Web Development Bootcamp\n\n**Getting Started:**\n1. Platform navigation tutorial\n2. Download mobile app (optional)\n3. Set up your profile\n4. Join community forum\n5. Access study materials\n\n**Weekly Schedule:**\n- Live Sessions: Tue & Thu, 8:00 PM\n- Q&A Sessions: Wed, 7:00 PM\n- Practice Tests: Every Sunday\n\n**This Week's Tasks:**\n✅ Complete orientation video\n✅ Introduce yourself in forum\n✅ Submit first assignment\n✅ Attend live session\n\n💡 **Pro Tip:** Set daily reminders for consistent learning!\n\nNeed help? 📧 support@platform.com",
            order: 1,
            isLocked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      }
    };

    const mockCourse = mockCourses[courseId];
    
    if (mockCourse) {
      console.log('Returning mock course:', courseId);
      try {
        return NextResponse.json({
          success: true,
          course: mockCourse,
          relatedCourses: []
        });
      } catch (jsonError) {
        console.error('JSON serialization error:', jsonError);
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to serialize course data'
          },
          { status: 500 }
        );
      }
    }

    console.log('Course not found:', courseId);
    return NextResponse.json(
      { 
        success: false,
        error: 'Course not found'
      },
      { status: 404 }
    );
  }
}
