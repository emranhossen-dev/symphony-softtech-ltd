const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkModules() {
  try {
    // Find digital marketing course
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { title: { contains: 'digital marketing', mode: 'insensitive' } },
          { slug: { contains: 'digital-marketing', mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: {
            modules: true,
            enrollments: true
          }
        },
        modules: {
          select: {
            id: true,
            title: true,
            order: true
          }
        }
      }
    });
    
    console.log('Digital Marketing Courses found:', courses.length);
    courses.forEach(course => {
      console.log('Course:', course.title);
      console.log('Module count:', course._count.modules);
      console.log('Modules:', course.modules.map(m => ({ id: m.id, title: m.title, order: m.order })));
      console.log('---');
    });
    
    // Also check all ONLINE courses
    const onlineCourses = await prisma.course.findMany({
      where: { category: 'ONLINE' },
      include: {
        _count: {
          select: {
            modules: true,
            enrollments: true
          }
        },
        modules: {
          select: {
            id: true,
            title: true
          }
        }
      },
      take: 5
    });
    
    console.log('\nFirst 5 ONLINE courses:');
    onlineCourses.forEach(course => {
      console.log('Course:', course.title, '| Modules:', course._count.modules);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkModules();
