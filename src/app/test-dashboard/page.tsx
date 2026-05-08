'use client'

import { useState, useEffect } from 'react'

export default function TestDashboardPage() {
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testDashboardAPI()
  }, [])

  const testDashboardAPI = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()
      
      console.log('🔍 Dashboard API Response:', data)
      setApiResponse(data)
      
    } catch (error) {
      console.error('❌ Dashboard API Error:', error)
      setApiResponse({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🔍 Dashboard API Test</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">API Response:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
      </div>

      <div className="bg-blue-100 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Check Properties:</h2>
        <div className="space-y-2">
          <p>✅ Success: {apiResponse?.success ? 'YES' : 'NO'}</p>
          <p>📊 Data exists: {apiResponse?.data ? 'YES' : 'NO'}</p>
          <p>👥 Total Courses: {apiResponse?.data?.totalCourses || 'MISSING'}</p>
          <p>👥 Total Students: {apiResponse?.data?.totalStudents || 'MISSING'}</p>
          <p>📝 Total Enrollments: {apiResponse?.data?.totalEnrollments || 'MISSING'}</p>
          <p>📝 Recent Enrollments: {apiResponse?.data?.recentEnrollments?.length || 'MISSING'}</p>
        </div>
      </div>

      <button 
        onClick={testDashboardAPI}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Refresh API Test
      </button>
    </div>
  )
}
