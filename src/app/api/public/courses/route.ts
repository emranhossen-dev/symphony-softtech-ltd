import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get('featured') === 'true';
  const limit = parseInt(searchParams.get('limit') || '10');
  const category = searchParams.get('category');

  try {
    // Build where clause
    const where: any = {
      isActive: true
    };

    if (category) {
      where.category = category;
    }

    // Fetch courses with mentor and category info
    const courses = await prisma.course.findMany({
      where,
      include: {
        mentor: {
          select: {
            name: true
          }
        },
        categoryRelation: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match expected interface
    const transformedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      thumbnail: course.thumbnail || '',
      price: course.price || 0,
      duration: course.duration || '',
      mentor: course.mentor?.name || 'Unknown',
      category: course.categoryRelation?.name || 'Uncategorized',
      categorySlug: course.categoryRelation?.slug || 'uncategorized',
      isActive: course.isActive,
      moduleCount: 0, // Will be calculated later
      enrollmentCount: 0 // Will be calculated later
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
        slug: 'bcs-preparation',
        description: 'Complete BCS exam preparation course',
        thumbnail: '',
        price: 5000,
        duration: '6 months',
        mentor: 'Dr. Ahmed',
        category: 'Government Courses',
        categorySlug: 'government',
        isActive: true,
        moduleCount: 10,
        enrollmentCount: 150
      },
      {
        id: 'course-2',
        title: 'Web Development',
        slug: 'web-development',
        description: 'Learn modern web development',
        thumbnail: '',
        price: 8000,
        duration: '3 months',
        mentor: 'John Doe',
        category: 'Programming',
        categorySlug: 'programming',
        isActive: true,
        moduleCount: 15,
        enrollmentCount: 75
      }
    ];

    return NextResponse.json({
      success: true,
      courses: mockCourses
    });
  }
}
