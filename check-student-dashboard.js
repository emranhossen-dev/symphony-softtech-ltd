const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudentDashboard() {
  try {
    // Get Emran's user
    const user = await prisma.user.findUnique({
      where: { email: 'dev.emranhossen@gmail.com' }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User:', user.name, user.email);

    // Get enrollments like the API does
    const enrollments = await prisma.enrollment.findMany({
      where: {
        user: {
          id: user.id
        }
      },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order: 'asc' }
            }
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\nEnrollments found:', enrollments.length);

    enrollments.forEach((enrollment, index) => {
      console.log(`\n${index + 1}. Course: ${enrollment.course?.title || enrollment.courseName}`);
      console.log(`   Status: ${enrollment.enrollmentStatus}`);
      console.log(`   Course ID: ${enrollment.courseId}`);
      console.log(`   Has course object: ${!!enrollment.course}`);
      console.log(`   Modules: ${enrollment.course?.modules?.length || 0}`);
      console.log(`   Created: ${enrollment.createdAt}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudentDashboard();
