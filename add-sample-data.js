const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSampleData() {
  try {
    console.log('Adding sample data...');

    // Create categories
    const govCategory = await prisma.category.create({
      data: {
        name: 'Government',
        slug: 'government',
        description: 'Government job preparation courses',
        icon: 'government',
        color: '#16A34A'
      }
    });

    const onlineCategory = await prisma.category.create({
      data: {
        name: 'Online',
        slug: 'online',
        description: 'Online learning courses',
        icon: 'online',
        color: '#3B82F6'
      }
    });

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'ADMIN'
      }
    });

    // Create mentor
    const mentor = await prisma.user.create({
      data: {
        email: 'mentor@example.com',
        password: 'mentor123',
        name: 'John Mentor',
        role: 'MENTOR'
      }
    });

    // Create courses
    const course1 = await prisma.course.create({
      data: {
        title: 'BCS Preparation Complete',
        slug: 'bcs-prep-complete',
        description: 'Complete BCS exam preparation course with all materials',
        shortDescription: 'BCS exam prep',
        price: 5000,
        duration: '6 months',
        category: 'GOVERNMENT',
        categoryId: govCategory.id,
        mentorId: mentor.id,
        createdBy: adminUser.id,
        isActive: true
      }
    });

    const course2 = await prisma.course.create({
      data: {
        title: 'Web Development Bootcamp',
        slug: 'web-dev-bootcamp',
        description: 'Full-stack web development course',
        shortDescription: 'Web dev bootcamp',
        price: 8000,
        duration: '3 months',
        category: 'ONLINE',
        categoryId: onlineCategory.id,
        mentorId: mentor.id,
        createdBy: adminUser.id,
        isActive: true
      }
    });

    console.log('Sample data added successfully!');
    console.log('Courses created:', course1.title, course2.title);

  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleData();
