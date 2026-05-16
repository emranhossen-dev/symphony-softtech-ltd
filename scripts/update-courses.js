const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCourses() {
  try {
    console.log('Updating courses with proper data...');

    const courses = await prisma.course.findMany();
    
    for (const course of courses) {
      const updates = {};
      
      // Set proper prices based on course type
      if (course.price === 0) {
        if (course.category === 'GOVERNMENT') {
          updates.price = 5000; // Government courses
        } else if (course.category === 'ONLINE') {
          updates.price = 8000; // Online courses
        } else if (course.category === 'OFFLINE') {
          updates.price = 12000; // Offline courses
        } else {
          updates.price = 6000; // Default
        }
      }
      
      // Add thumbnail if missing
      if (!course.thumbnail) {
        const defaultImages = [
          '/uploads/1778882142159-pnzr7jhz2xc.jpeg',
          '/uploads/1778924925145-vgu802zibpo.jpeg',
          '/uploads/1772919955333-5o87wcro8bp.jpeg',
          '/uploads/1772934234835-iy2amj4s69c.jpeg'
        ];
        updates.thumbnail = defaultImages[Math.floor(Math.random() * defaultImages.length)];
      }
      
      // Add duration if missing
      if (!course.duration) {
        updates.duration = '3 months';
      }
      
      // Apply updates
      if (Object.keys(updates).length > 0) {
        await prisma.course.update({
          where: { id: course.id },
          data: updates
        });
        console.log(`Updated: ${course.title}`);
        console.log(`  Price: ${updates.price || course.price}`);
        console.log(`  Thumbnail: ${updates.thumbnail || course.thumbnail}`);
        console.log(`  Duration: ${updates.duration || course.duration}`);
        console.log('');
      }
    }
    
    console.log('Course updates completed!');
    
  } catch (error) {
    console.error('Error updating courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCourses();
