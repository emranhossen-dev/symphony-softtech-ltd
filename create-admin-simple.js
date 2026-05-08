const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

async function createAdmin() {
  console.log('🚀 Creating admin user with bcrypt...')
  
  try {
    // Hash password with bcrypt (same as auth system)
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    console.log('🔑 Hashed password:', hashedPassword)
    
    const adminData = {
      id: 'admin-001',
      email: 'admin@symphony.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    console.log('📤 Inserting admin data...')
    
    const { data, error } = await supabase
      .from('users')
      .insert([adminData])
      .select()
    
    if (error) {
      console.error('❌ Error:', error)
      
      // Try with service role key if RLS blocks
      console.log('🔄 Trying with service role...')
      const serviceSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
      )
      
      const { data: serviceData, error: serviceError } = await serviceSupabase
        .from('users')
        .insert([adminData])
        .select()
      
      if (serviceError) {
        console.error('❌ Service role error:', serviceError)
        return
      }
      
      console.log('✅ Admin created with service role!')
      console.log('📧 Email: admin@symphony.com')
      console.log('🔑 Password: admin123')
      return
    }
    
    console.log('✅ Admin created successfully!')
    console.log('📧 Email: admin@symphony.com')
    console.log('🔑 Password: admin123')
    console.log('👤 User data:', data)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createAdmin()
