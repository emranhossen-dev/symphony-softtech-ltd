const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCourses() {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        categoryId: true
      }
    });

    console.log('Available courses:');
    courses.forEach(course => {
      console.log(`ID: ${course.id}, Title: ${course.title}, Slug: ${course.slug}, Category: ${course.category}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourses();
