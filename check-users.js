const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    console.log('Students found:', users.length);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user.id}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
