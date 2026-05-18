const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeTestOfflineCourses() {
  try {
    console.log('🔍 Looking for test offline courses to remove...');
    
    // Find the test courses I just added
    const testCourses = await prisma.course.findMany({
      where: {
        category: 'OFFLINE',
        title: {
          contains: 'Classroom'
        }
      }
    });

    if (testCourses.length === 0) {
      console.log('❌ No test offline courses found');
      return;
    }

    console.log(`📋 Found ${testCourses.length} test offline courses to remove:`);

    for (const course of testCourses) {
      console.log(`   - ${course.title} (ID: ${course.id})`);

      // Delete associated modules first
      await prisma.module.deleteMany({
        where: {
          courseId: course.id
        }
      });

      // Delete the course
      await prisma.course.delete({
        where: {
          id: course.id
        }
      });

      console.log(`   ✅ Deleted ${course.title}`);
    }

    console.log('🎉 All test offline courses removed successfully!');

  } catch (error) {
    console.error('❌ Error removing test courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeTestOfflineCourses();
