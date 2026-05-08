const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

// Prisma client for local data
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function pushExistingData() {
  console.log('🚀 Pushing existing data to Supabase...')
  
  try {
    // Get local data
    console.log('📥 Fetching local data...')
    
    const localCategories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        courses: {
          include: {
            mentor: true
          }
        }
      }
    })
    
    const localUsers = await prisma.user.findMany({
      where: { isActive: true }
    })
    
    const localCourses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        mentor: true,
        category: true
      }
    })
    
    console.log(`📁 Found ${localCategories.length} categories`)
    console.log(`👥 Found ${localUsers.length} users`)
    console.log(`📚 Found ${localCourses.length} courses`)
    
    // Push to Supabase
    console.log('📤 Pushing to Supabase...')
    
    // Categories
    if (localCategories.length > 0) {
      const { error: catError } = await supabase
        .from('categories')
        .upsert(localCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          color: cat.color,
          isActive: cat.isActive
        })))
        .select()
      
      if (catError) {
        console.error('❌ Categories push error:', catError)
      } else {
        console.log('✅ Categories pushed successfully')
      }
    }
    
    // Users
    if (localUsers.length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .upsert(localUsers.map(user => ({
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive
        })))
        .select()
      
      if (userError) {
        console.error('❌ Users push error:', userError)
      } else {
        console.log('✅ Users pushed successfully')
      }
    }
    
    // Courses
    if (localCourses.length > 0) {
      const { error: courseError } = await supabase
        .from('courses')
        .upsert(localCourses.map(course => ({
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          shortDescription: course.shortDescription,
          thumbnail: course.thumbnail,
          price: course.price,
          duration: course.duration,
          isActive: course.isActive,
          mentorId: course.mentorId,
          createdBy: course.createdBy,
          categoryId: course.categoryId,
          category: course.category
        })))
        .select()
      
      if (courseError) {
        console.error('❌ Courses push error:', courseError)
      } else {
        console.log('✅ Courses pushed successfully')
      }
    }
    
    console.log('\n🎉 Data migration completed!')
    console.log('🌐 Visit: http://localhost:3000/admin')
    console.log('🔐 Login with existing credentials')
    
  } catch (error) {
    console.error('❌ Migration error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

pushExistingData()
