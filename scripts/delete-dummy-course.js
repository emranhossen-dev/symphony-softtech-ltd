const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteDummyCourse() {
  try {
    console.log('🔍 Deleting dummy course...');
    
    const result = await prisma.course.deleteMany({
      where: {
        title: {
          contains: 'Corrupti'
        }
      }
    });

    console.log(`✅ Deleted ${result.count} dummy course(s)`);
  } catch (error) {
    console.error('❌ Error deleting dummy course:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteDummyCourse();
