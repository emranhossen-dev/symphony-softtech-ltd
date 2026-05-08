const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@symphony.com' },
    update: {},
    create: {
      email: 'admin@symphony.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true
    }
  })

  console.log('✅ Admin user created:', admin.email)
  
  // Create sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'government' },
      update: {},
      create: {
        name: 'Government Courses',
        slug: 'government',
        description: 'Government job preparation courses',
        icon: 'government',
        color: 'blue',
        isActive: true
      }
    }),
    prisma.category.upsert({
      where: { slug: 'programming' },
      update: {},
      create: {
        name: 'Programming',
        slug: 'programming',
        description: 'Learn programming from scratch',
        icon: 'code',
        color: 'green',
        isActive: true
      }
    })
  ])

  console.log('✅ Categories created:', categories.length)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
