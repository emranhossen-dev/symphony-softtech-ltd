const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEnrollmentStatus() {
  try {
    const enrollments = await prisma.enrollment.findMany({
      select: {
        id: true,
        fullName: true,
        enrollmentStatus: true,
        courseName: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log('Recent enrollments:');
    console.table(enrollments);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnrollmentStatus();
