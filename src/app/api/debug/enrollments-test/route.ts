import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Testing enrollments API...');
    
    // Test basic database connection
    const totalEnrollments = await prisma.enrollment.count();
    console.log(`Debug: Total enrollments in DB: ${totalEnrollments}`);
    
    // Test offline category enrollments
    const offlineEnrollments = await prisma.enrollment.count({
      where: {
        course: {
          categoryRelation: {
            slug: 'offline-courses'
          }
        }
      }
    });
    console.log(`Debug: Offline category enrollments: ${offlineEnrollments}`);
    
    // Test with category ID
    const categories = await prisma.category.findMany({
      where: { slug: 'offline-courses' }
    });
    
    let offlineEnrollmentsById = 0;
    if (categories.length > 0) {
      offlineEnrollmentsById = await prisma.enrollment.count({
        where: { categoryId: categories[0].id }
      });
      console.log(`Debug: Offline enrollments by ID: ${offlineEnrollmentsById}`);
    }

    return NextResponse.json({
      success: true,
      debug: {
        totalEnrollments,
        offlineEnrollments,
        offlineEnrollmentsById: offlineEnrollmentsById || 0,
        categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
