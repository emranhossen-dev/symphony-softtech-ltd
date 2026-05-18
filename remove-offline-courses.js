const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeOfflineCourses() {
  try {
    console.log('🔍 Looking for offline courses to remove...');
    
    // Find all offline courses
    const offlineCourses = await prisma.course.findMany({
      where: {
        category: 'OFFLINE'
      }
    });

    if (offlineCourses.length === 0) {
      console.log('❌ No offline courses found');
      return;
    }

    console.log(`📋 Found ${offlineCourses.length} offline courses to remove:`);

    for (const course of offlineCourses) {
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

    console.log('🎉 All offline courses removed successfully!');

  } catch (error) {
    console.error('❌ Error removing offline courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeOfflineCourses();
