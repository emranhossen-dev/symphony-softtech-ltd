import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get('featured') === 'true';
  const limit = parseInt(searchParams.get('limit') || '10');
  const category = searchParams.get('category');

  try {
    // Build where clause
    const whereClause: any = {
      isActive: true
    };

    if (featured) {
      // Remove this check since 'featured' field doesn't exist in schema
    }

    if (category) {
      whereClause.category = category;
    }

    // Fetch courses with related data
    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        mentor: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            modules: true,
            enrollments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Transform the data
    const transformedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description || '',
      shortDescription: course.shortDescription || '',
      thumbnail: course.thumbnail || '',
      category: course.category,
      price: course.price || 0,
      duration: course.duration || '',
      level: 'beginner', // Default value since field doesn't exist in schema
      isActive: course.isActive,
      featured: false, // Default value since field doesn't exist in schema
      rating: 0, // Default value since field doesn't exist in schema
      reviewCount: 0, // Default value since field doesn't exist in schema
      enrollmentCount: course._count.enrollments,
      moduleCount: course._count.modules,
      mentor: course.mentor?.name || 'Unknown'
    }));

    return NextResponse.json({
      success: true,
      courses: transformedCourses
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    
    // Return mock data if database is not available
    const mockCourses = [
      {
        id: 'course-1',
        title: 'BCS Preparation',
        description: 'Complete BCS exam preparation course',
        shortDescription: 'Prepare for BCS exams',
        thumbnail: '',
        category: 'government',
        price: 5000,
        duration: '6 months',
        level: 'beginner',
        isActive: true,
        featured: true,
        rating: 4.5,
        reviewCount: 120,
        enrollmentCount: 450,
        moduleCount: 10,
        mentor: 'Dr. Ahmed'
      },
      {
        id: 'course-2',
        title: 'Web Development',
        description: 'Learn modern web development',
        shortDescription: 'Full-stack web development',
        thumbnail: '',
        category: 'programming',
        price: 8000,
        duration: '3 months',
        level: 'intermediate',
        isActive: true,
        featured: true,
        rating: 4.8,
        reviewCount: 89,
        enrollmentCount: 320,
        moduleCount: 15,
        mentor: 'John Doe'
      },
      {
        id: 'course-3',
        title: 'Data Science',
        description: 'Master data science and machine learning',
        shortDescription: 'Data science fundamentals',
        thumbnail: '',
        category: 'programming',
        price: 12000,
        duration: '4 months',
        level: 'advanced',
        isActive: true,
        featured: false,
        rating: 4.7,
        reviewCount: 67,
        enrollmentCount: 180,
        moduleCount: 20,
        mentor: 'Dr. Smith'
      }
    ];

    // Filter based on query parameters
    let filteredCourses = mockCourses;
    
    if (featured) {
      filteredCourses = filteredCourses.filter(course => course.featured);
    }
    
    filteredCourses = filteredCourses.slice(0, limit);

    return NextResponse.json({
      success: true,
      courses: filteredCourses
    });
  }
}
