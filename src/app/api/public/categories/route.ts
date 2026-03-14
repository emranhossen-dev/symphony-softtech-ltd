import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check if database is available
    if (!prisma) {
      throw new Error('Database not available');
    }
    
    // Fetch all active categories with their active courses
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      include: {
        courses: {
          where: {
            isActive: true
          },
          include: {
            mentor: {
              select: {
                name: true
              }
            },
            _count: {
              select: {
                modules: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to match the expected interface
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || 'government',
      color: category.color || 'green',
      isActive: category.isActive,
      courses: category.courses.map(course => ({
        id: course.id,
        title: course.title,
        thumbnail: course.thumbnail || '',
        mentor: course.mentor?.name || 'Unknown',
        moduleCount: course._count.modules,
        price: course.price || 0,
        isActive: course.isActive
      }))
    }));

    // Filter out categories that have no active courses
    const categoriesWithCourses = transformedCategories.filter(
      category => category.courses.length > 0
    );

    return NextResponse.json({
      success: true,
      categories: categoriesWithCourses
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Return mock data if database is not available
    const mockCategories = [
      {
        id: 'cat-1',
        name: 'Government Courses',
        slug: 'government',
        description: 'Government job preparation courses',
        icon: 'government',
        color: 'blue',
        isActive: true,
        courses: [
          {
            id: 'course-1',
            title: 'BCS Preparation',
            thumbnail: '',
            mentor: 'Dr. Ahmed',
            moduleCount: 10,
            price: 5000,
            isActive: true
          }
        ]
      },
      {
        id: 'cat-2',
        name: 'Programming',
        slug: 'programming',
        description: 'Learn programming from scratch',
        icon: 'code',
        color: 'green',
        isActive: true,
        courses: [
          {
            id: 'course-2',
            title: 'Web Development',
            thumbnail: '',
            mentor: 'John Doe',
            moduleCount: 15,
            price: 8000,
            isActive: true
          }
        ]
      }
    ];

    return NextResponse.json({
      success: true,
      categories: mockCategories
    });
  }
}
