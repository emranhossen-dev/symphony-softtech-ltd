const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteTestCourse() {
  try {
    console.log('🔍 Looking for Government Job Preparation course...');
    
    // Find the course by title
    const course = await prisma.course.findFirst({
      where: {
        title: 'Government Job Preparation'
      }
    });

    if (!course) {
      console.log('❌ Government Job Preparation course not found');
      return;
    }

    console.log(`📋 Found course: ${course.title} (ID: ${course.id})`);

    // Delete associated modules first
    const deletedModules = await prisma.module.deleteMany({
      where: {
        courseId: course.id
      }
    });
    console.log(`🗑️  Deleted ${deletedModules.count} modules`);

    // Delete associated enrollments
    const deletedEnrollments = await prisma.enrollment.deleteMany({
      where: {
        courseId: course.id
      }
    });
    console.log(`🗑️  Deleted ${deletedEnrollments.count} enrollments`);

    // Delete the course
    const deletedCourse = await prisma.course.delete({
      where: {
        id: course.id
      }
    });

    console.log(`✅ Successfully deleted course: ${deletedCourse.title}`);
    console.log('🎉 Test course removal complete!');

  } catch (error) {
    console.error('❌ Error deleting course:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestCourse();
