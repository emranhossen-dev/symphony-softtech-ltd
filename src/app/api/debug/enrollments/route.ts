import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Fetching enrollments...');
    
    // Get all enrollments with their category info
    const enrollments = await prisma.enrollment.findMany({
      include: {
        course: {
          include: {
            categoryRelation: true
          }
        }
      }
    });

    console.log(`Debug: Found ${enrollments.length} enrollments`);

    // Group by category
    const byCategory = {};
    enrollments.forEach(enrollment => {
      const category = enrollment.course?.categoryRelation;
      const categoryName = category?.name || 'Unknown';
      
      if (!byCategory[categoryName]) {
        byCategory[categoryName] = [];
      }
      byCategory[categoryName].push({
        id: enrollment.id,
        name: enrollment.fullName,
        email: enrollment.email,
        phone: enrollment.phoneNumber,
        status: enrollment.enrollmentStatus,
        courseName: enrollment.courseName,
        categoryId: enrollment.categoryId
      });
    });

    console.log('Debug: Grouped by category:', Object.keys(byCategory));

    return NextResponse.json({
      success: true,
      totalEnrollments: enrollments.length,
      byCategory
    });

  } catch (error) {
    console.error('Debug: Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
