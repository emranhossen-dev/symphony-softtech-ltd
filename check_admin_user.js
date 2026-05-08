const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@symphony.com' }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        isActive: adminUser.isActive,
        createdAt: adminUser.createdAt
      });
      
      // Test password verification
      const isValidPassword = await bcrypt.compare('admin123', adminUser.password);
      console.log('✅ Password verification:', isValidPassword ? 'VALID' : 'INVALID');
      
    } else {
      console.log('❌ Admin user not found');
      
      // Create admin user if it doesn't exist
      console.log('🔧 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@symphony.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          isActive: true
        }
      });
      
      console.log('✅ Admin user created:', newAdmin.email);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
