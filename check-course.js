const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCourse() {
  try {
    const course = await prisma.course.findUnique({ 
      where: { id: 'cmpc8o6me0003xgzpoh4y105f' },
      include: {
        modules: true
      }
    });
    
    console.log('Course found:', course ? course.title : 'Not found');
    if (course) {
      console.log('ID:', course.id);
      console.log('Active:', course.isActive);
      console.log('Modules count:', course.modules.length);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourse();
