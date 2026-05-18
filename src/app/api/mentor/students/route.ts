import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  return withErrorHandling(async (req) => {
    // TODO: Get mentor ID from session/auth token
    const mentorId = 'current-mentor-id';

    // Fetch students enrolled in mentor's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        enrollmentStatus: 'ADMITTED'
      }
    });

    // Group students and calculate their progress
    const studentsMap = new Map();
    
    enrollments.forEach((enrollment: any) => {
      const studentId = enrollment.id; // In real schema, this would be enrollment.studentId
      const studentName = enrollment.fullName; // In real schema, this would be from student relation
      
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          id: studentId,
          firstName: studentName.split(' ')[0],
          lastName: studentName.split(' ').slice(1).join(' '),
          email: enrollment.email,
          phoneNumber: enrollment.phoneNumber,
          enrolledCourses: [{
            id: enrollment.courseName,
            name: enrollment.courseName,
            category: enrollment.category,
            progress: 0, // TODO: Replace with actual progress from database
            enrolledAt: enrollment.createdAt.toISOString()
          }],
          totalProgress: 0, // TODO: Replace with actual progress from database
          averageRating: 0, // TODO: Replace with actual rating from database
          isActive: true
        });
      }
      
      const student = studentsMap.get(studentId);
      student.enrolledCourses.push({
        id: enrollment.courseName,
        name: enrollment.courseName,
        category: enrollment.category,
        progress: 0, // TODO: Replace with actual progress from database
        lastActive: new Date().toISOString()
      });
      
      // Calculate total progress
      student.totalProgress = Math.floor(
        student.enrolledCourses.reduce((sum: number, course: any) => sum + course.progress, 0) / student.enrolledCourses.length
      );
    });

    const students = Array.from(studentsMap.values());

    return NextResponse.json({
      success: true,
      students
    });
  }, request);
}
