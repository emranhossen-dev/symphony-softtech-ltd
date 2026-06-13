import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, AuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET /api/student/profile — return authenticated student's profile with stats
export async function GET(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('auth-token')?.value;
    const headerToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserFromToken(token);

    // Fetch enrollments for stats
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: { course: true },
    });

    const totalCourses = enrollments.length;
    const completedCourses = 0; // We can track this via certificates or module progress

    // Fetch certificates
    const certificates = await prisma.certificate.findMany({
      where: { userId: user.id },
      include: { course: true },
    });

    // Fetch module progress for points calculation
    const moduleProgress = await prisma.moduleProgress.findMany({
      where: { userId: user.id, completed: true },
    });

    const totalPoints = moduleProgress.length * 50; // 50 points per completed module

    // Determine level
    let currentLevel = 'Beginner';
    if (totalPoints >= 2000) currentLevel = 'Expert';
    else if (totalPoints >= 1000) currentLevel = 'Advanced';
    else if (totalPoints >= 500) currentLevel = 'Intermediate';

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isActive: user.isActive,
        joinDate: user.createdAt,
        avatar: user.avatar || '',
        totalCourses,
        completedCourses: certificates.length,
        certificates: certificates.length,
        totalPoints,
        currentLevel,
        enrollments: enrollments.map((e: typeof enrollments[number]) => ({
          id: e.id,
          courseName: e.courseName,
          courseId: e.courseId,
          status: e.enrollmentStatus,
          joinedAt: e.createdAt,
        })),
        recentCertificates: certificates.slice(0, 4).map((c: typeof certificates[number]) => ({
          id: c.id,
          courseName: c.course.title,
          issuedAt: c.issuedAt,
          verificationId: c.verificationId,
          certificateUrl: c.certificateUrl,
        })),
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('Profile GET error:', err);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

// PATCH /api/student/profile — update name and phone
export async function PATCH(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get('auth-token')?.value;
    const headerToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    const body = await request.json();

    const { name, phone, avatar } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        avatar: avatar !== undefined ? avatar : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('Profile PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
