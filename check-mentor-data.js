require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMentorData() {
  try {
    console.log('=== Checking Database ===\n');

    // Check courses
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        mentorId: true
      }
    });
    console.log(`Total Courses: ${courses.length}`);
    courses.forEach(course => {
      console.log(`- ${course.title} (ID: ${course.id}, MentorID: ${course.mentorId || 'None'})`);
    });

    // Check mentors
    const mentors = await prisma.user.findMany({
      where: {
        role: 'MENTOR'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    console.log(`\nTotal Mentors: ${mentors.length}`);
    mentors.forEach(mentor => {
      console.log(`- ${mentor.name} (${mentor.email}, ID: ${mentor.id})`);
    });

    // Check homework submissions
    const homework = await prisma.homeworkSubmission.findMany({
      select: {
        id: true,
        status: true,
        courseId: true,
        mentorId: true
      }
    });
    console.log(`\nTotal Homework Submissions: ${homework.length}`);
    homework.forEach(sub => {
      console.log(`- ID: ${sub.id}, Status: ${sub.status}, CourseID: ${sub.courseId}, MentorID: ${sub.mentorId || 'None'}`);
    });

    // Check enrollments
    const enrollments = await prisma.enrollment.findMany({
      select: {
        id: true,
        status: true,
        courseId: true,
        userId: true
      },
      take: 10
    });
    console.log(`\nTotal Enrollments (showing first 10): ${enrollments.length}`);
    enrollments.forEach(enrollment => {
      console.log(`- ID: ${enrollment.id}, Status: ${enrollment.status}, CourseID: ${enrollment.courseId}, UserID: ${enrollment.userId}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMentorData();
