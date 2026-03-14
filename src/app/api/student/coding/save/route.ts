import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Files array is required' },
        { status: 400 }
      );
    }

    // In a real application, you'd get the student ID from the session/auth token
    const studentId = 'current-student-id'; // This would come from auth

    // Save or update student's code files
    const savedFiles = await Promise.all(
      files.map(async (file: any) => {
        return await (prisma as any).studentCodeFile.upsert({
          where: {
            studentId_name: {
              studentId,
              name: file.name
            }
          },
          update: {
            content: file.content,
            language: file.language,
            updatedAt: new Date()
          },
          create: {
            studentId,
            name: file.name,
            content: file.content,
            language: file.language,
            size: file.content.length
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      files: savedFiles.map(file => ({
        id: file.id,
        name: file.name,
        language: file.language,
        size: file.size,
        updatedAt: file.updatedAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error saving code:', error);
    return NextResponse.json(
      { error: 'Failed to save code' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
