const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createUser() {
  try {
    const email = 'dev.emranhossen@gmail.com';
    const password = 'TempPass123!'; // Temporary password - change after login
    const name = 'Emran Hossen';
    const role = 'STUDENT';

    console.log('Creating user account...');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Name:', name);
    console.log('Role:', role);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('User already exists. Updating password...');
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword, isActive: true }
      });
      console.log('✅ User password updated successfully');
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          isActive: true
        }
      });

      console.log('✅ User created successfully:');
      console.log('  - ID:', user.id);
      console.log('  - Email:', user.email);
      console.log('  - Name:', user.name);
      console.log('  - Role:', user.role);
      console.log('  - Active:', user.isActive);
    }

    console.log('\n🔐 Login credentials:');
    console.log('  Email:', email);
    console.log('  Password:', password);
    console.log('\n⚠️  Please change your password after logging in!');

  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
