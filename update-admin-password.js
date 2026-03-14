const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    // Hash the password properly
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { 
        password: hashedPassword,
        isActive: true
      }
    });
    
    console.log('Admin password updated successfully!');
    console.log('Email:', updatedUser.email);
    console.log('Name:', updatedUser.name);
    console.log('Role:', updatedUser.role);
    
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
