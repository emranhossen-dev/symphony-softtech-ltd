import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET() {
  try {
    // In a real application, you'd get the student ID from the session/auth token
    const studentId = 'current-student-id'; // This would come from auth

    // Fetch student's homework assignments
    const homeworkAssignments = await (prisma as any).homework.findMany({
      where: {
        studentId,
        isActive: true
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        submissions: {
          where: {
            studentId
          },
          orderBy: {
            submittedAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    // Transform data to match expected format
    const formattedAssignments = homeworkAssignments.map((assignment: any) => {
      const latestSubmission = assignment.submissions[0];
      
      return {
        id: assignment.id,
        title: assignment.title,
        courseName: assignment.course.name,
        dueDate: assignment.dueDate.toISOString(),
        status: assignment.submissions.length > 0 ? 'SUBMITTED' : 'PENDING',
        grade: latestSubmission?.grade || null,
        feedback: latestSubmission?.feedback,
        requirements: {
          languages: assignment.requirements?.languages || ['HTML', 'CSS', 'JavaScript'],
          files: assignment.requirements?.files || ['index.html', 'style.css', 'script.js'],
          description: assignment.requirements?.description || 'Complete the assigned task'
        },
        course: assignment.course
      };
    });

    // Get the most recent homework (current assignment)
    const currentHomework = formattedAssignments.find((h: any) => h.status === 'PENDING') || formattedAssignments[0];

    return NextResponse.json({
      success: true,
      homework: currentHomework,
      allHomework: formattedAssignments
    });
  } catch (error) {
    console.error('Error fetching homework:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homework' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
