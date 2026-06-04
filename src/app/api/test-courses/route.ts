import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { category: 'ONLINE' },
      include: {
        _count: {
          select: {
            enrollments: true,
            modules: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      courses: courses.map(course => ({
        id: course.id,
        title: course.title,
        moduleCount: course._count.modules,
        enrollmentCount: course._count.enrollments
      }))
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
