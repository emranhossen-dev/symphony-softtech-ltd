const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    
    console.log('Admin users found:', adminUsers.length);
    
    if (adminUsers.length === 0) {
      console.log('Creating admin user...');
      
      // Hash the password properly
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          isActive: true
        }
      });
      
      console.log('Admin user created:', adminUser.email);
    } else {
      console.log('Admin users:');
      adminUsers.forEach(user => {
        console.log(`- ${user.email} (${user.isActive ? 'Active' : 'Inactive'})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
