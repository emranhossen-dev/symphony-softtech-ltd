import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, handleApiError, successResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, ['MENTOR']);
    if (!auth.success) return auth.response;

    const user = auth.user;

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

    return successResponse({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: (user as any).phone || '',
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
    return handleApiError(error, 'fetch profile');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, ['MENTOR']);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { name, phone } = body;

    const updated = await (prisma as any).user.update({
      where: { id: auth.user.id },
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

    return successResponse({ profile: updated });
  } catch (error) {
    return handleApiError(error, 'update profile');
  }
}
