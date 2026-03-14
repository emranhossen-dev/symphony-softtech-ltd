const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database...');
    
    // Check total courses count
    const totalCourses = await prisma.course.count();
    console.log('Total courses in database:', totalCourses);
    
    // Get all courses
    const allCourses = await prisma.course.findMany({
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('All courses:', allCourses.map(c => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      mentorId: c.mentorId,
      mentorName: c.mentor?.name || 'No mentor',
      enrollmentCount: c._count?.enrollments || 0,
      isActive: c.isActive,
      createdAt: c.createdAt
    })));
    
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
