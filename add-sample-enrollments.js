// Sample script to add government enrollments
// Run with: node add-sample-enrollments.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addSampleEnrollments() {
  try {
    // First, create a government category if it doesn't exist
    const govCategory = await prisma.category.upsert({
      where: { slug: 'government' },
      update: {},
      create: {
        name: 'Government Courses',
        slug: 'government',
        description: 'Government job preparation courses',
        icon: 'government',
        color: 'green',
        isActive: true
      }
    });

    console.log('Government category:', govCategory);

    // Add sample enrollments
    const enrollments = [
      {
        fullName: 'Rahman Mia',
        phoneNumber: '01712345678',
        email: 'rahman@example.com',
        address: 'Dhaka, Bangladesh',
        courseName: 'BCS Preparation',
        categoryId: govCategory.id,
        educationLevel: 'Graduate',
        whyJoin: 'Want to join civil service',
        enrollmentStatus: 'PENDING_REVIEW'
      },
      {
        fullName: 'Fatema Begum',
        phoneNumber: '01898765432',
        email: 'fatema@example.com',
        address: 'Chittagong, Bangladesh',
        courseName: 'BCS Preparation',
        categoryId: govCategory.id,
        educationLevel: 'Masters',
        whyJoin: 'Career in government sector',
        enrollmentStatus: 'APPROVED'
      },
      {
        fullName: 'Abdul Karim',
        phoneNumber: '01912345678',
        email: 'abdul@example.com',
        address: 'Rajshahi, Bangladesh',
        courseName: 'Bank Job Preparation',
        categoryId: govCategory.id,
        educationLevel: 'Graduate',
        whyJoin: 'Secure banking career',
        enrollmentStatus: 'PAYMENT_PENDING'
      }
    ];

    for (const enrollment of enrollments) {
      const result = await prisma.enrollment.create({
        data: enrollment
      });
      console.log('Created enrollment:', result.fullName);
    }

    console.log('Sample enrollments added successfully!');
  } catch (error) {
    console.error('Error adding enrollments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleEnrollments();
