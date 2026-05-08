const fs = require('fs')
const path = require('path')

console.log('🚀 Running Database Migration...')
console.log('📋 Instructions:')
console.log('1. Open: https://wusxjstcqdkmxkoummzn.supabase.co')
console.log('2. Go to SQL Editor')
console.log('3. Copy the SQL below:')
console.log('4. Paste and Run in Supabase')
console.log('\n' + '='.repeat(60))

// Read and display SQL
const sqlFile = path.join(__dirname, 'supabase-migration.sql')
const sql = fs.readFileSync(sqlFile, 'utf8')

console.log('📝 SQL TO COPY:')
console.log(sql)

console.log('\n' + '='.repeat(60))
console.log('✅ After running SQL, visit: http://localhost:3000/verify-migration')
console.log('🎯 This will create all 13 tables in your Supabase database!')
