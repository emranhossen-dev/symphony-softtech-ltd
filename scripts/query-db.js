const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      thumbnail: true
    }
  });
  console.log(courses);
}

main().catch(console.error).finally(() => prisma.$disconnect());
