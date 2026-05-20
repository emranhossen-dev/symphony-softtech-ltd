const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createEmranUser() {
  try {
    const email = 'emran40989@gmail.com';
    const password = 'emran40989'; // Default password based on email
    const name = 'Emran Hossen';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.email);
      console.log('Login credentials:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create the student user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });
    
    console.log('✅ Student user created successfully:');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.isActive}`);
    console.log(`Password: ${password} (keep this secure)`);
    
    // Link existing enrollments to this user
    console.log('\n🔗 Linking existing enrollments...');
    const enrollments = await prisma.enrollment.findMany({
      where: { email }
    });
    
    for (const enrollment of enrollments) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { 
          userId: user.id,
          enrollmentStatus: 'ADMITTED' // Update status to admitted
        }
      });
      console.log(`✅ Linked enrollment for course: ${enrollment.courseName}`);
    }
    
    console.log('\n🎉 User setup complete! You can now login with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error('Error creating student user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createEmranUser();
