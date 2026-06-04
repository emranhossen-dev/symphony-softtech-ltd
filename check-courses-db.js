const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourses() {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        category: true
      }
    });

    console.log('Courses found:', courses.length);
    courses.forEach(course => {
      console.log(`- ${course.title} (ID: ${course.id}, Category: ${course.category})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourses();
