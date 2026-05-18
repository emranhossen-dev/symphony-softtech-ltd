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
    
    // Get search parameters for mock data filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '12');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Return mock data when database is not available
    const mockCourses = [
      {
        id: 'course-1',
        title: 'BCS Preparation',
        slug: 'bcs-preparation',
        description: 'Complete BCS exam preparation with all subjects and mock tests',
        shortDescription: 'Complete BCS exam preparation',
        price: 5000,
        duration: '6 months',
        thumbnail: '',
        category: 'GOVERNMENT',
        mentorId: 'user-2',
        createdBy: 'user-1',
        isActive: true,
        featured: true,
        rating: 4.5,
        reviewCount: 125,
        enrollmentCount: 450,
        level: 'Beginner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
          id: 'user-1',
          name: 'Admin User'
        },
        mentor: {
          id: 'user-2',
          name: 'Dr. Ahmed'
        },
        _count: {
          enrollments: 450
        }
      },
      {
        id: 'course-2',
        title: 'Web Development Bootcamp',
        slug: 'web-development-bootcamp',
        description: 'Learn HTML, CSS, JavaScript, React from scratch to advanced',
        shortDescription: 'Complete web development course',
        price: 8000,
        duration: '3 months',
        thumbnail: '',
        category: 'ONLINE',
        mentorId: 'user-2',
        createdBy: 'user-1',
        isActive: true,
        featured: true,
        rating: 4.8,
        reviewCount: 200,
        enrollmentCount: 320,
        level: 'Beginner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
          id: 'user-1',
          name: 'Admin User'
        },
        mentor: {
          id: 'user-2',
          name: 'John Doe'
        },
        _count: {
          enrollments: 320
        }
      },
      {
        id: 'course-3',
        title: 'React Advanced Patterns',
        slug: 'react-advanced',
        description: 'Advanced React patterns, performance optimization, and best practices',
        shortDescription: 'Advanced React development',
        price: 6000,
        duration: '2 months',
        thumbnail: '',
        category: 'ONLINE',
        mentorId: 'user-2',
        createdBy: 'user-1',
        isActive: true,
        featured: false,
        rating: 4.7,
        reviewCount: 85,
        enrollmentCount: 150,
        level: 'Advanced',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
          id: 'user-1',
          name: 'Admin User'
        },
        mentor: {
          id: 'user-2',
          name: 'Dr. Smith'
        },
        _count: {
          enrollments: 150
        }
      },
      {
        id: 'course-4',
        title: 'Government Job Preparation',
        slug: 'govt-job-prep',
        description: 'Complete preparation for all government job exams with expert guidance',
        shortDescription: 'Government job exam prep',
        price: 3000,
        duration: '4 months',
        thumbnail: '',
        category: 'GOVERNMENT',
        mentorId: 'user-2',
        createdBy: 'user-1',
        isActive: true,
        featured: true,
        rating: 4.6,
        reviewCount: 180,
        enrollmentCount: 520,
        level: 'Intermediate',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
          id: 'user-1',
          name: 'Admin User'
        },
        mentor: {
          id: 'user-2',
          name: 'Dr. Ahmed'
        },
        _count: {
          enrollments: 520
        }
      }
    ];

    // Filter by category if specified
    let filteredCourses = mockCourses;
    if (category) {
      filteredCourses = mockCourses.filter(course => course.category === category);
    }

    // Filter by search if specified
    if (search) {
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase()) ||
        course.shortDescription?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply pagination
    const totalCount = filteredCourses.length;
    const totalPages = Math.ceil(totalCount / limit);
    const paginatedCourses = filteredCourses.slice(skip, skip + limit);

    const categories = [
      { value: 'GOVERNMENT', label: 'Government Exams', count: mockCourses.filter(c => c.category === 'GOVERNMENT').length },
      { value: 'RECORDED', label: 'Recorded Courses', count: mockCourses.filter(c => c.category === 'RECORDED').length },
      { value: 'ONLINE', label: 'Online Live', count: mockCourses.filter(c => c.category === 'ONLINE').length },
      { value: 'OFFLINE', label: 'Offline Classes', count: mockCourses.filter(c => c.category === 'OFFLINE').length }
    ];

    return NextResponse.json({
      success: true,
      courses: paginatedCourses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      categories
    });
  }
}
