const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function addSampleData() {
  console.log('🚀 Adding sample data to Supabase...')
  
  try {
    // Add Categories
    console.log('📁 Adding categories...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .upsert([
        {
          id: 'cat-1',
          name: 'Government Courses',
          slug: 'government',
          description: 'Government job preparation courses',
          icon: 'government',
          color: 'blue',
          isActive: true
        },
        {
          id: 'cat-2', 
          name: 'Programming',
          slug: 'programming',
          description: 'Learn programming from scratch',
          icon: 'code',
          color: 'green',
          isActive: true
        },
        {
          id: 'cat-3',
          name: 'Web Development',
          slug: 'web-development',
          description: 'Modern web development courses',
          icon: 'web',
          color: 'purple',
          isActive: true
        }
      ])
      .select()

    if (catError) {
      console.error('❌ Categories error:', catError)
      return
    }
    console.log(`✅ Added ${categories?.length || 0} categories`)

    // Add Users
    console.log('👥 Adding users...')
    const { data: users, error: userError } = await supabase
      .from('users')
      .upsert([
        {
          id: 'user-1',
          email: 'admin@symphony.com',
          password: '$2b$12$hashed_password',
          name: 'Admin User',
          role: 'ADMIN',
          isActive: true
        },
        {
          id: 'user-2',
          email: 'mentor@symphony.com',
          password: '$2b$12$hashed_password',
          name: 'Dr. Ahmed',
          role: 'MENTOR',
          isActive: true
        },
        {
          id: 'user-3',
          email: 'student@symphony.com',
          password: '$2b$12$hashed_password',
          name: 'John Student',
          role: 'STUDENT',
          isActive: true
        }
      ])
      .select()

    if (userError) {
      console.error('❌ Users error:', userError)
      return
    }
    console.log(`✅ Added ${users?.length || 0} users`)

    // Add Courses
    console.log('📚 Adding courses...')
    const { data: courses, error: courseError } = await supabase
      .from('courses')
      .upsert([
        {
          id: 'course-1',
          title: 'BCS Preparation',
          slug: 'bcs-preparation',
          description: 'Complete BCS exam preparation with all subjects',
          price: 5000,
          duration: '6 months',
          categoryId: 'cat-1',
          category: 'Government Courses',
          mentorId: 'user-2',
          createdBy: 'user-1',
          isActive: true
        },
        {
          id: 'course-2',
          title: 'Web Development',
          slug: 'web-development',
          description: 'Learn HTML, CSS, JavaScript, React',
          price: 8000,
          duration: '3 months',
          categoryId: 'cat-2',
          category: 'Programming',
          mentorId: 'user-2',
          createdBy: 'user-1',
          isActive: true
        },
        {
          id: 'course-3',
          title: 'React Advanced',
          slug: 'react-advanced',
          description: 'Advanced React patterns and best practices',
          price: 6000,
          duration: '2 months',
          categoryId: 'cat-3',
          category: 'Web Development',
          mentorId: 'user-2',
          createdBy: 'user-1',
          isActive: true
        }
      ])
      .select()

    if (courseError) {
      console.error('❌ Courses error:', courseError)
      return
    }
    console.log(`✅ Added ${courses?.length || 0} courses`)

    console.log('\n🎉 Sample data added successfully!')
    console.log('🌐 Visit: http://localhost:3000/test-api')
    console.log('🔐 Visit: http://localhost:3000/login')
    console.log('👨‍💼 Visit: http://localhost:3000/admin')
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error)
  }
}

addSampleData()
