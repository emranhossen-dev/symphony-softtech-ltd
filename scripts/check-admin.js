const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('🔍 Checking for admin users...\n');
    
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    console.log(`Found ${adminUsers.length} admin user(s):\n`);
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in database!');
      console.log('\n📝 Creating a default admin user...\n');
      
      // Create default admin
      const defaultPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@sit.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('\n📋 Login Credentials:');
      console.log('   Email: admin@sit.com');
      console.log('   Password: admin123');
      console.log('\n⚠️  Please change this password after first login!\n');
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`Admin #${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log(`  Created: ${user.createdAt}\n`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('DATABASE_URL')) {
      console.error('\n⚠️  DATABASE_URL environment variable is not set!');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
