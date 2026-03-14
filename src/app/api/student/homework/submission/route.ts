import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const moduleId = formData.get('moduleId') as string;
    const courseId = formData.get('courseId') as string;
    const code = formData.get('code') as string;
    const file = formData.get('file') as File;

    if (!moduleId || !courseId) {
      return NextResponse.json({ error: 'Module ID and Course ID are required' }, { status: 400 });
    }

    if (!code && !file) {
      return NextResponse.json({ error: 'Code or file is required' }, { status: 400 });
    }

    // Check if user is enrolled in this course
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

    // Handle file upload if present
    let fileUrl = null;
    if (file && file.size > 0) {
      // For now, we'll just store the file name
      // In a real implementation, you'd upload to cloud storage
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      fileUrl = `/uploads/homework/${fileName}`;
      
      // Here you would typically upload the file to your storage service
      // For now, we'll just simulate the upload
      console.log('File upload simulated:', fileName);
    }

    // Create or update homework submission
    const submission = await prisma.homeworkSubmission.upsert({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: moduleId
        }
      },
      update: {
        code: code || null,
        fileUrl: fileUrl,
        status: 'PENDING',
        feedback: null,
        mentorId: null,
        reviewedAt: null,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        moduleId: moduleId,
        courseId: courseId,
        code: code || null,
        fileUrl: fileUrl,
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        submittedAt: submission.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting homework:', error);
    return NextResponse.json(
      { error: 'Failed to submit homework' },
      { status: 500 }
    );
  }
}
