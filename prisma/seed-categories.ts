import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: 'Recorded Courses',
      slug: 'recorded',
      description: 'Learn at your own pace with HD video lessons available 24/7',
      color: '#A855F7',
      icon: 'clock',
      isActive: true
    },
    {
      name: 'Online Batch',
      slug: 'online',
      description: 'Interactive live sessions with real-time mentor support',
      color: '#3B82F6',
      icon: 'users',
      isActive: true
    },
    {
      name: 'Offline Batch',
      slug: 'offline',
      description: 'In-person training with hands-on practical experience',
      color: '#10B981',
      icon: 'map',
      isActive: true
    },
    {
      name: 'Government Batch',
      slug: 'government',
      description: 'Official certified programs with job placement support',
      color: '#F97316',
      icon: 'calendar',
      isActive: true
    }
  ];

  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug }
    });

    if (!existing) {
      await prisma.category.create({
        data: category
      });
      console.log(`✅ Created category: ${category.name}`);
    } else {
      console.log(`⏭️  Category already exists: ${category.name}`);
    }
  }

  console.log('\n✨ Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
