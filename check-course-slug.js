const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourseSlug() {
  try {
    const course = await prisma.course.findFirst({
      where: { title: 'Digital Marketing' },
      select: {
        id: true,
        title: true,
        slug: true
      }
    });

    if (course) {
      console.log('Course:', course.title);
      console.log('ID:', course.id);
      console.log('Slug:', course.slug);
    } else {
      console.log('Course not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourseSlug();
