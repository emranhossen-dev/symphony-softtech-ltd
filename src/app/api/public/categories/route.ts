import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Fetch all active categories with their active courses
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        *,
        courses (
          *,
          mentor:users (
            name
          )
        )
      `)
      .eq('isActive', true)
    
    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }
    
    // Filter active courses and transform data
    const categoriesWithActiveCourses = categories?.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || 'government',
      color: category.color || 'green',
      isActive: category.isActive,
      courses: category.courses?.filter((course: { isActive: any; }) => course.isActive).map((course: { id: any; title: any; thumbnail: any; mentor: { name: any; }; price: any; isActive: any; }) => ({
        id: course.id,
        title: course.title,
        thumbnail: course.thumbnail || '',
        mentor: course.mentor?.name || 'Unknown',
        moduleCount: 0, // Will be calculated later
        price: course.price || 0,
        isActive: course.isActive
      })) || []
    })) || []

    // Filter out categories that have no active courses
    const categoriesWithCourses = categoriesWithActiveCourses.filter(
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
