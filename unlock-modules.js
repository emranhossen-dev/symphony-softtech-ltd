const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function unlockFirstModules() {
  try {
    console.log('Unlocking first few modules for testing...');
    
    // Get all courses with modules
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          orderBy: { order: 'asc' }
        }
      }
    });

    for (const course of courses) {
      console.log(`\nProcessing course: ${course.title}`);
      
      // Unlock first 3 modules for testing
      const modulesToUpdate = course.modules.slice(0, 3);
      
      for (const module of modulesToUpdate) {
        await prisma.module.update({
          where: { id: module.id },
          data: { isLocked: false }
        });
        
        console.log(`  Unlocked: ${module.title} (Order: ${module.order})`);
      }
    }

    console.log('\nFirst 3 modules unlocked for all courses!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

unlockModules();
