const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOriginalEnrollments() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'dev.emranhossen@gmail.com' }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        user: {
          id: user.id
        }
      },
      select: {
        id: true,
        courseName: true,
        courseId: true,
        enrollmentStatus: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Enrollments for Emran Hossen:');
    enrollments.forEach((e, index) => {
      console.log(`\n${index + 1}. courseName: ${e.courseName}`);
      console.log(`   courseId: ${e.courseId}`);
      console.log(`   Status: ${e.enrollmentStatus}`);
      console.log(`   Created: ${e.createdAt}`);
    });

    // Check all available courses
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        category: true
      }
    });

    console.log('\n\nAvailable courses in database:');
    courses.forEach(c => {
      console.log(`- ${c.title} (ID: ${c.id}, Category: ${c.category})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOriginalEnrollments();
