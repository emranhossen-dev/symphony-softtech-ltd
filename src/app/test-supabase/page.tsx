import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function TestSupabasePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  try {
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').single()

    if (error) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">❌ Supabase Connection Error</h1>
          <pre className="mt-4 p-4 bg-red-100 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-green-600">✅ Supabase Connection Successful!</h1>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p>Connected to Supabase successfully</p>
          <p>Users count: {data?.count || 0}</p>
        </div>
      </div>
    )
  } catch (err) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">❌ Error</h1>
        <pre className="mt-4 p-4 bg-red-100 rounded">
          {JSON.stringify(err, null, 2)}
        </pre>
      </div>
    )
  }
}
