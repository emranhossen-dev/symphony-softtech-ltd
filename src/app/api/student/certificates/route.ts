import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get student certificates and eligible courses
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);

    if (user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch existing certificates
    const certificates = await prisma.certificate.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
            thumbnail: true,
            duration: true,
            mentor: { select: { name: true } }
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });

    // Determine eligible courses
    const enrolledCourses = await prisma.course.findMany({
      where: {
        enrollments: {
          some: { userId: user.id }
        }
      },
      include: {
        modules: true,
        homeworkSubmissions: {
          where: { userId: user.id }
        }
      }
    });

    const existingCertCourseIds = new Set(certificates.map(c => c.courseId));
    const eligibleCourses = [];

    for (const course of enrolledCourses) {
      if (existingCertCourseIds.has(course.id)) continue;

      const homeworkModules = course.modules.filter(m => m.homework && m.homework.trim() !== '');
      if (homeworkModules.length > 0) {
        const submittedModuleIds = new Set(course.homeworkSubmissions.map(s => s.moduleId));
        
        // Check if student submitted homework for EVERY homework module
        const allSubmitted = homeworkModules.every(m => submittedModuleIds.has(m.id));
        if (allSubmitted) {
          eligibleCourses.push({
            id: course.id,
            title: course.title,
            slug: course.slug,
            thumbnail: course.thumbnail,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      certificates,
      eligibleCourses
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}

// Request new certificate
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);

    if (user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // In a real app, this might create a 'Certificate Request' notification for admins
    // For now, we will just create a notification as a placeholder.
    await prisma.notification.create({
      data: {
        userId: user.id, // Usually this would go to an admin, but tying it to student for simple logging
        type: 'CERTIFICATE_AVAILABLE',
        title: 'Certificate Request',
        message: `Requested certificate for course ID: ${courseId}`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Certificate request submitted successfully'
    });
  } catch (error) {
    console.error('Error requesting certificate:', error);
    return NextResponse.json(
      { error: 'Failed to request certificate' },
      { status: 500 }
    );
  }
}
