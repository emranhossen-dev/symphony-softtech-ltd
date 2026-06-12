import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all pending certificate requests (students who completed all homework)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);

    if (user.role !== 'MENTOR' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

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
      where: { mentorId: user.id },
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
          // Find the latest submission date
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

    return NextResponse.json({
      success: true,
      pendingRequests,
      issuedCertificates
    });

  } catch (error) {
    console.error('Error fetching certificate requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificate requests' },
      { status: 500 }
    );
  }
}

// POST - Issue a certificate to a student
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);

    if (user.role !== 'MENTOR' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

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

    return NextResponse.json({
      success: true,
      certificate,
      message: 'Certificate issued successfully'
    });

  } catch (error) {
    console.error('Error issuing certificate:', error);
    return NextResponse.json(
      { error: 'Failed to issue certificate' },
      { status: 500 }
    );
  }
}
