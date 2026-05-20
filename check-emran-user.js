const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmranUser() {
  try {
    const email = 'emran40989@gmail.com';
    
    // Check user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    console.log('=== USER CHECK ===');
    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      });
    } else {
      console.log('❌ User not found with email:', email);
    }
    
    // Check enrollments
    console.log('\n=== ENROLLMENT CHECK ===');
    const enrollments = await prisma.enrollment.findMany({
      where: { 
        email: email 
      },
      include: {
        course: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    });
    
    if (enrollments.length > 0) {
      console.log(`✅ Found ${enrollments.length} enrollment(s):`);
      enrollments.forEach((enrollment, index) => {
        console.log(`${index + 1}. Course: ${enrollment.course.title}`);
        console.log(`   Status: ${enrollment.status}`);
        console.log(`   Enrolled: ${enrollment.enrolledAt}`);
        console.log(`   Progress: ${enrollment.progress || 0}%`);
      });
    } else {
      console.log('❌ No enrollments found for this email');
    }
    
    // Check if there are any applications
    console.log('\n=== APPLICATIONS CHECK ===');
    const applications = await prisma.application.findMany({
      where: { email }
    });
    
    if (applications.length > 0) {
      console.log(`✅ Found ${applications.length} application(s):`);
      applications.forEach((app, index) => {
        console.log(`${index + 1}. Course: ${app.courseTitle}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Applied: ${app.createdAt}`);
      });
    } else {
      console.log('❌ No applications found');
    }
    
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmranUser();
