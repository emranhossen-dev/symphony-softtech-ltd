import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Fix: Updating enrollment categories...');
    
    // Get all enrollments without categoryId
    const enrollmentsWithoutCategory = await prisma.enrollment.findMany({
      where: {
        categoryId: null
      },
      include: {
        course: {
          include: {
            categoryRelation: true
          }
        }
      }
    });

    console.log(`Found ${enrollmentsWithoutCategory.length} enrollments without categoryId`);

    let updatedCount = 0;

    for (const enrollment of enrollmentsWithoutCategory) {
      let categoryId = enrollment.course?.categoryId;
      
      // If course doesn't have categoryId but has category string, try to find the category
      if (!categoryId && enrollment.course?.category) {
        const category = await prisma.category.findFirst({
          where: {
            OR: [
              { slug: enrollment.course.category.toLowerCase() },
              { name: { equals: enrollment.course.category, mode: 'insensitive' } }
            ]
          }
        });
        if (category) {
          categoryId = category.id;
        }
      }

      if (categoryId) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { categoryId }
        });
        updatedCount++;
        console.log(`Updated enrollment ${enrollment.id} with categoryId ${categoryId}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} enrollments with categoryId`,
      totalChecked: enrollmentsWithoutCategory.length,
      updatedCount
    });

  } catch (error) {
    console.error('Fix: Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
