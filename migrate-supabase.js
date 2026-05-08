const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Starting Supabase migration...')
  
  // Read SQL file
  const fs = require('fs')
  const sql = fs.readFileSync('./supabase-migration.sql', 'utf8')
  
  try {
    // Split SQL into individual statements
    const statements = sql.split(';').filter(s => s.trim().length > 0)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`)
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
          if (error) {
            console.log(`⚠️  Statement ${i + 1} failed:`, error.message)
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (err) {
          console.log(`❌ Statement ${i + 1} error:`, err.message)
        }
      }
    }
    
    console.log('🎉 Migration completed!')
    
    // Verify tables
    console.log('\n🔍 Verifying tables...')
    const tables = ['users', 'categories', 'courses', 'modules', 'enrollments']
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: ${count} records`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

runMigration()
