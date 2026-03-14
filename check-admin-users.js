const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminUsers() {
  console.log('🔍 Checking for admin users...\n');
  
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Found ${adminUsers.length} admin users:`);
    adminUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
    });
    
    if (adminUsers.length === 0) {
      console.log('\n❌ No admin users found!');
      console.log('\n🔧 To create an admin user, run:');
      console.log('node create-admin-user.js');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();
