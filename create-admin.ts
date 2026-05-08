import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env' })

// Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createAdminUser() {
  console.log('🚀 Creating admin user...')
  
  try {
    // Hash password (simple hash for now)
    const hashedPassword = createHash('sha256').update('admin123').digest('hex')
    
    const adminData = {
      id: 'admin-001',
      email: 'admin@symphony.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true
    }
    
    const { data, error } = await supabase
      .from('users')
      .insert([adminData])
      .select()
    
    if (error) {
      console.error('❌ Error creating admin:', error)
      return
    }
    
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@symphony.com')
    console.log('🔑 Password: admin123')
    console.log('👤 Role: ADMIN')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createAdminUser()
