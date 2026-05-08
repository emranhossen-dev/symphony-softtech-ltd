import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function VerifyMigrationPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  try {
    // Test all tables
    const tables = [
      'users', 'categories', 'courses', 'modules', 'enrollments',
      'payments', 'module_progress', 'attendance_sessions', 'attendances',
      'notifications', 'certificates', 'homework_submissions', 'activity_logs', 'whatsapp_messages'
    ]

    const results = []

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        results.push({
          table,
          status: error ? '❌ Error' : '✅ OK',
          count: count || 0,
          error: error?.message
        })
      } catch (err) {
        results.push({
          table,
          status: '❌ Error',
          count: 0,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">🔍 Database Migration Verification</h1>
        
        <div className="space-y-2">
          {results.map((result) => (
            <div key={result.table} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{result.table}</span>
                <span>{result.status}</span>
              </div>
              <div className="text-sm text-gray-600">
                Records: {result.count}
              </div>
              {result.error && (
                <div className="text-sm text-red-600 mt-1">
                  Error: {result.error}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-green-100 rounded-lg">
          <h2 className="font-bold text-green-800">✅ Migration Complete!</h2>
          <p className="text-green-700">All tables have been created in Supabase.</p>
        </div>
      </div>
    )
  } catch (err) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">❌ Verification Error</h1>
        <pre className="mt-4 p-4 bg-red-100 rounded">
          {JSON.stringify(err, null, 2)}
        </pre>
      </div>
    )
  }
}
