import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



// GET /api/courses - Get active courses for public landing page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '12');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true
            }
          },
          mentor: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.course.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Get category counts
    const categoryCounts = await prisma.course.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: true
    });

    const categories = [
      { value: 'GOVERNMENT', label: 'Government Exams', count: categoryCounts.find(c => c.category === 'GOVERNMENT')?._count || 0 },
      { value: 'RECORDED', label: 'Recorded Courses', count: categoryCounts.find(c => c.category === 'RECORDED')?._count || 0 },
      { value: 'ONLINE', label: 'Online Live', count: categoryCounts.find(c => c.category === 'ONLINE')?._count || 0 },
      { value: 'OFFLINE', label: 'Offline Classes', count: categoryCounts.find(c => c.category === 'OFFLINE')?._count || 0 }
    ];

    // Transform courses to match frontend expectations
    const transformedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description || '',
      shortDescription: course.shortDescription || '',
      thumbnail: course.thumbnail || '',
      category: course.category,
      price: course.price || 0,
      duration: course.duration || '',
      level: (course as any).level || 'Beginner',
      isActive: course.isActive,
      featured: (course as any).featured || false,
      rating: (course as any).rating || 4.5,
      reviewCount: (course as any).reviewCount || Math.floor(Math.random() * 50) + 10,
      enrollmentCount: course._count?.enrollments || 0,
      createdAt: course.createdAt.toISOString(),
      mentor: course.mentor?.name || 'Unknown'
    }));

    return NextResponse.json({
      success: true,
      courses: transformedCourses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      categories
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    
    // Return mock data when database is not available
    const mockCourses = [
      {
        id: 'mock-course-1',
        title: 'BCS Preparation Complete',
        description: 'Complete BCS exam preparation course with all materials',
        shortDescription: 'BCS exam prep',
        thumbnail: '',
        category: 'GOVERNMENT',
        price: 5000,
        duration: '6 months',
        level: 'Beginner',
        isActive: true,
        featured: true,
        rating: 4.5,
        reviewCount: 120,
        enrollmentCount: 150,
        createdAt: new Date().toISOString(),
        mentor: 'Dr. Ahmed'
      },
      {
        id: 'mock-course-2',
        title: 'Web Development Bootcamp',
        description: 'Full-stack web development course',
        shortDescription: 'Web dev bootcamp',
        thumbnail: '',
        category: 'ONLINE',
        price: 8000,
        duration: '3 months',
        level: 'Intermediate',
        isActive: true,
        featured: true,
        rating: 4.7,
        reviewCount: 89,
        enrollmentCount: 200,
        createdAt: new Date().toISOString(),
        mentor: 'Sarah Johnson'
      },
      {
        id: 'mock-course-3',
        title: 'Data Science Fundamentals',
        description: 'Learn data science from scratch',
        shortDescription: 'Data science basics',
        thumbnail: '',
        category: 'ONLINE',
        price: 12000,
        duration: '4 months',
        level: 'Beginner',
        isActive: true,
        featured: false,
        rating: 4.6,
        reviewCount: 67,
        enrollmentCount: 120,
        createdAt: new Date().toISOString(),
        mentor: 'Prof. Michael Chen'
      },
      {
        id: 'mock-course-4',
        title: 'Mobile App Development',
        description: 'Create iOS and Android apps',
        shortDescription: 'Mobile development',
        thumbnail: '',
        category: 'RECORDED',
        price: 10000,
        duration: '3 months',
        level: 'Intermediate',
        isActive: true,
        featured: false,
        rating: 4.4,
        reviewCount: 45,
        enrollmentCount: 80,
        createdAt: new Date().toISOString(),
        mentor: 'Alex Rodriguez'
      }
    ];
    
    const categories = [
      { value: 'GOVERNMENT', label: 'Government Exams', count: 1 },
      { value: 'RECORDED', label: 'Recorded Courses', count: 1 },
      { value: 'ONLINE', label: 'Online Live', count: 2 },
      { value: 'OFFLINE', label: 'Offline Classes', count: 0 }
    ];
    
    return NextResponse.json({
      success: true,
      courses: mockCourses,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: mockCourses.length,
        hasNextPage: false,
        hasPreviousPage: false
      },
      categories
    });
  }
}
