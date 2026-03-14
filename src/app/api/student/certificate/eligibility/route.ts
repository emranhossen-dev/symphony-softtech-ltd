import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    
    if (user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Check if student is enrolled in this course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        user: {
          id: user.id
        },
        courseId: courseId,
        enrollmentStatus: 'APPROVED'
      }
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    });

    if (existingCertificate) {
      return NextResponse.json({
        success: true,
        eligible: true,
        certificate: {
          id: existingCertificate.id,
          certificateUrl: existingCertificate.certificateUrl,
          verificationId: existingCertificate.verificationId,
          issuedAt: existingCertificate.issuedAt
        }
      });
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check eligibility criteria
    const totalModules = course.modules.length;
    
    // 1. Check if all modules are completed
    const completedModules = await prisma.moduleProgress.count({
      where: {
        userId: user.id,
        courseId: courseId,
        completed: true
      }
    });

    const allModulesCompleted = completedModules === totalModules;

    // 2. Check if homework is approved
    const approvedHomework = await prisma.homeworkSubmission.count({
      where: {
        userId: user.id,
        courseId: courseId,
        status: 'APPROVED'
      }
    });

    const homeworkApproved = approvedHomework > 0; // At least one approved homework

    // 3. Check attendance >= 70%
    const totalSessions = await prisma.attendanceSession.count({
      where: {
        courseId: courseId,
        isActive: true
      }
    });

    let attendancePercentage = 0;
    if (totalSessions > 0) {
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          studentId: user.id,
          session: {
            courseId: courseId,
            isActive: true
          }
        }
      });

      const presentCount = attendanceRecords.filter(record => record.status === 'PRESENT').length;
      attendancePercentage = Math.round((presentCount / totalSessions) * 100);
    }

    const attendanceSufficient = attendancePercentage >= 70;

    // Overall eligibility
    const isEligible = allModulesCompleted && homeworkApproved && attendanceSufficient;

    return NextResponse.json({
      success: true,
      eligible: isEligible,
      criteria: {
        allModulesCompleted,
        completedModules,
        totalModules,
        homeworkApproved,
        attendancePercentage,
        attendanceSufficient,
        attendanceThreshold: 70
      }
    });

  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check certificate eligibility' },
      { status: 500 }
    );
  }
}
