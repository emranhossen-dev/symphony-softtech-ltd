const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUserEnrollment() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'dev.emranhossen@gmail.com' }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    // Get Digital Marketing course
    const digitalMarketingCourse = await prisma.course.findFirst({
      where: { title: 'Digital Marketing' }
    });

    if (!digitalMarketingCourse) {
      console.log('Digital Marketing course not found');
      return;
    }

    console.log('Found Digital Marketing course:', digitalMarketingCourse.id);

    // Update the most recent enrollment to point to Digital Marketing
    const enrollments = await prisma.enrollment.findMany({
      where: {
        user: { id: user.id }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\nFound ${enrollments.length} enrollments`);

    // Update the most recent enrollment (Web Development) to Digital Marketing
    if (enrollments.length > 0) {
      const updated = await prisma.enrollment.update({
        where: { id: enrollments[0].id },
        data: {
          courseId: digitalMarketingCourse.id,
          courseName: digitalMarketingCourse.title,
          categoryId: digitalMarketingCourse.categoryId
        }
      });

      console.log(`\nUpdated enrollment ${updated.id} to Digital Marketing`);
      console.log(`Old course: ${enrollments[0].courseName}`);
      console.log(`New course: ${updated.courseName}`);
    }

    // Delete the other enrollment (duplicate)
    if (enrollments.length > 1) {
      await prisma.enrollment.delete({
        where: { id: enrollments[1].id }
      });
      console.log(`\nDeleted duplicate enrollment ${enrollments[1].id}`);
    }

    console.log('\n✓ Enrollment fixed successfully');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserEnrollment();
