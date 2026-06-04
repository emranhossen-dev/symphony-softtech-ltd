import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

async function populateCourseSlugs() {
  try {
    console.log('Fetching all courses...');
    
    const courses = await prisma.course.findMany();

    console.log(`Found ${courses.length} courses`);

    for (const course of courses) {
      const slug = generateSlug(course.title);
      
      // If course already has a slug, skip it
      if (course.slug && course.slug.length > 0) {
        console.log(`Skipping "${course.title}" - already has slug: ${course.slug}`);
        continue;
      }
      
      // Check if slug already exists
      const existing = await prisma.course.findFirst({
        where: { slug }
      });

      if (existing) {
        // If slug exists, append ID to make it unique
        const uniqueSlug = `${slug}-${course.id.slice(0, 8)}`;
        await prisma.course.update({
          where: { id: course.id },
          data: { slug: uniqueSlug }
        });
        console.log(`Updated course "${course.title}" with slug: ${uniqueSlug}`);
      } else {
        await prisma.course.update({
          where: { id: course.id },
          data: { slug }
        });
        console.log(`Updated course "${course.title}" with slug: ${slug}`);
      }
    }

    console.log('Successfully populated all course slugs');
  } catch (error) {
    console.error('Error populating course slugs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateCourseSlugs();
