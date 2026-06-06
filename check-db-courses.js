const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const courses = await prisma.course.findMany({ take: 10 });
    console.log('Courses in DB:', courses.length);
    courses.forEach(c => console.log(' -', c.title, '|', c.category, '|', c.isActive));
  } catch (e) {
    console.error('DB Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
