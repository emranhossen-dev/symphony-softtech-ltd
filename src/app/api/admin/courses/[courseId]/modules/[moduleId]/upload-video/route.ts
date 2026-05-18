import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthError, verifyToken, hasRole } from '@/lib/auth';

// POST /api/admin/courses/[courseId]/modules/[moduleId]/upload-video - Upload video for module
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new AuthError('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      throw new AuthError('Insufficient permissions', 403);
    }

    const formData = await request.formData();
    const video = formData.get('video') as File;
    const moduleIdFromForm = formData.get('moduleId') as string;

    if (!video) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Video file is required'
        },
        { status: 400 }
      );
    }

    if (moduleIdFromForm !== moduleId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Module ID mismatch'
        },
        { status: 400 }
      );
    }

    // Verify module exists and belongs to this course
    const module = await prisma?.module.findFirst({
      where: { 
        id: moduleId,
        courseId 
      }
    });

    if (!module) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Module not found or does not belong to this course'
        },
        { status: 404 }
      );
    }

    // For now, just return a mock video URL
    // In production, you would upload to a cloud storage service
    const videoUrl = `https://example-videos.com/${moduleId}/${video.name}`;
    
    // Update module with video URL
    const updatedModule = await prisma?.module.update({
      where: { id: moduleId },
      data: { videoUrl }
    });

    return NextResponse.json({
      success: true,
      module: updatedModule,
      videoUrl,
      message: 'Video uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload video'
      },
      { status: 500 }
    );
  }
}
