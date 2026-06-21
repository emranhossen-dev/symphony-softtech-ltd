import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequestLight, handleApiError, successResponse } from '@/lib/api-utils';

// GET - Fetch all pending certificate requests (students who completed all homework)
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequestLight(request, ['MENTOR', 'ADMIN']);
    if (!auth.success) return auth.response;

    // Fetch already issued certificates
    const issuedCertificates = await prisma.certificate.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, slug: true, duration: true } }
      },
      orderBy: { issuedAt: 'desc' }
    });

    // Find all courses this mentor is assigned to
    const mentorCourses = await prisma.course.findMany({
      where: { mentorId: auth.payload.id },
      include: {
        modules: true,
        enrollments: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        homeworkSubmissions: true
      }
    });

    const issuedSet = new Set(issuedCertificates.map(c => `${c.userId}-${c.courseId}`));
    const pendingRequests: {
      studentId: string;
      studentName: string;
      studentEmail: string;
      courseId: string;
      courseName: string;
      submittedAt: string;
    }[] = [];

    for (const course of mentorCourses) {
      const homeworkModules = course.modules.filter(m => m.homework && m.homework.trim() !== '');
      if (homeworkModules.length === 0) continue;

      // Group submissions by student
      const submissionsByStudent: Record<string, Set<string>> = {};
      for (const submission of course.homeworkSubmissions) {
        if (!submissionsByStudent[submission.userId]) {
          submissionsByStudent[submission.userId] = new Set();
        }
        submissionsByStudent[submission.userId].add(submission.moduleId);
      }

      // Check each enrolled student
      for (const enrollment of course.enrollments) {
        if (!enrollment.user) continue;
        const studentId = enrollment.user.id;
        const key = `${studentId}-${course.id}`;
        if (issuedSet.has(key)) continue;

        const studentSubmissions = submissionsByStudent[studentId] || new Set();
        const allSubmitted = homeworkModules.every(m => studentSubmissions.has(m.id));

        if (allSubmitted) {
          const studentSubs = course.homeworkSubmissions
            .filter(s => s.userId === studentId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          pendingRequests.push({
            studentId,
            studentName: enrollment.user.name,
            studentEmail: enrollment.user.email,
            courseId: course.id,
            courseName: course.title,
            submittedAt: studentSubs[0]?.createdAt?.toISOString() || new Date().toISOString()
          });
        }
      }
    }

    return successResponse({ pendingRequests, issuedCertificates });
  } catch (error) {
    return handleApiError(error, 'fetch certificate requests');
  }
}

// POST - Issue a certificate to a student
export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequestLight(request, ['MENTOR', 'ADMIN']);
    if (!auth.success) return auth.response;

    const { studentId, courseId } = await request.json();

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'Student ID and Course ID are required' },
        { status: 400 }
      );
    }

    // Check if already issued
    const existing = await prisma.certificate.findFirst({
      where: { userId: studentId, courseId }
    });

    if (existing) {
      return NextResponse.json({ error: 'Certificate already issued' }, { status: 409 });
    }

    // Generate verification ID
    const verificationId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const certificate = await prisma.certificate.create({
      data: {
        userId: studentId,
        courseId,
        certificateUrl: `/certificates/verify/${verificationId}`,
        verificationId
      }
    });

    // Notify the student
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'CERTIFICATE_AVAILABLE',
        title: 'Certificate Issued!',
        message: 'Congratulations! Your certificate has been issued. Visit the Certificates page to download it.'
      }
    });

    return successResponse({
      certificate,
      message: 'Certificate issued successfully'
    });
  } catch (error) {
    return handleApiError(error, 'issue certificate');
  }
}
