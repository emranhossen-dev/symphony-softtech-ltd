const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTablesDirectly() {
  console.log('🚀 Creating tables directly...')
  
  try {
    // Create users table first
    const { error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError && usersError.code === 'PGRST116') {
      // Table doesn't exist, we need to create it via SQL
      console.log('❌ Tables not found. You need to run SQL manually in Supabase Dashboard.')
      console.log('\n📋 Instructions:')
      console.log('1. Go to: https://wusxjstcqdkmxkoummzn.supabase.co')
      console.log('2. Click on "SQL Editor" in the left sidebar')
      console.log('3. Copy the entire content from supabase-migration.sql')
      console.log('4. Paste it in the SQL Editor')
      console.log('5. Click "Run" button')
      console.log('6. Wait for all tables to be created')
      console.log('\n🔗 After migration, visit: http://localhost:3000/verify-migration')
      
      return false
    } else if (!usersError) {
      console.log('✅ Tables already exist!')
      
      // Check other tables
      const tables = ['users', 'categories', 'courses', 'modules', 'enrollments']
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: OK`)
        }
      }
      
      return true
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

createTablesDirectly().then(success => {
  if (success) {
    console.log('\n🎉 Database is ready!')
    console.log('🌐 Visit: http://localhost:3000/verify-migration')
  } else {
    console.log('\n👆 Please follow the manual migration steps above')
  }
})
