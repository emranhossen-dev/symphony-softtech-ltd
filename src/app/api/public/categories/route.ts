import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch all active categories with their active courses
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        courses: {
          some: {
            isActive: true
          }
        }
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
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Transform data to match expected format
    const categoriesWithActiveCourses = categories.map(category => ({
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
        moduleCount: (course as any)._count?.modules || 0,
        price: course.price || 0,
        isActive: course.isActive
      }))
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesWithActiveCourses
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    console.error('Error details:', (error as Error).message);
    
    // Return empty array instead of mock data
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch categories',
      categories: []
    }, { status: 500 });
  }
}
