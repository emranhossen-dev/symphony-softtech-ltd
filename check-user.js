const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const email = 'dev.emranhossen@gmail.com';
    console.log('Checking user with email:', email);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    if (user) {
      console.log('✅ User found:');
      console.log('  - ID:', user.id);
      console.log('  - Email:', user.email);
      console.log('  - Name:', user.name);
      console.log('  - Role:', user.role);
      console.log('  - Active:', user.isActive);
      console.log('  - Created:', user.createdAt);
    } else {
      console.log('❌ User not found in database');
    }

    // List all users for reference
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log('\n📋 Recent users in database:');
    allUsers.forEach(u => {
      console.log(`  - ${u.email} (${u.role}) - Active: ${u.isActive}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
