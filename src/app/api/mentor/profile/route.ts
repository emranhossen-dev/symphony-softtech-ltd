import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token =
      request.headers.get('Authorization')?.replace('Bearer ', '') ||
      request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { getUserFromToken } = await import('@/lib/auth');
    const user = await getUserFromToken(token);

    if (!user || user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Mentor access required' }, { status: 403 });
    }

    // Count courses this mentor is assigned to
    const courseCount = await (prisma as any).course.count({
      where: { mentorId: user.id },
    });

    // Count unique students enrolled in mentor's courses
    const enrollments = await (prisma as any).enrollment.findMany({
      where: {
        enrollmentStatus: 'ADMITTED',
        course: { mentorId: user.id },
      },
      select: { userId: true },
    });
    const uniqueStudents = new Set(enrollments.map((e: any) => e.userId)).size;

    // Count issued certificates for mentor's courses
    const certCount = await (prisma as any).certificate.count({
      where: {
        course: { mentorId: user.id },
      },
    });

    // Count homework submissions for mentor's courses
    const homeworkCount = await (prisma as any).homeworkSubmission.count({
      where: {
        course: { mentorId: user.id },
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        joinDate: (user as any).createdAt
          ? new Date((user as any).createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : 'N/A',
        isActive: user.isActive,
      },
      stats: {
        coursesTaught: courseCount,
        studentsMentored: uniqueStudents,
        certificatesIssued: certCount,
        homeworkReviewed: homeworkCount,
      },
    });
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token =
      request.headers.get('Authorization')?.replace('Bearer ', '') ||
      request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { getUserFromToken } = await import('@/lib/auth');
    const user = await getUserFromToken(token);

    if (!user || user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Mentor access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, phone } = body;

    const updated = await (prisma as any).user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
