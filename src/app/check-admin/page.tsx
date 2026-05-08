'use client'

import { useState, useEffect } from 'react'

export default function CheckAdminPage() {
  const [adminUser, setAdminUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminUser()
  }, [])

  const checkAdminUser = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      console.log('Users data:', data)
      
      // Check if admin@symphony.com exists
      const admin = data.data?.find((user: any) => user.email === 'admin@symphony.com')
      
      if (admin) {
        setAdminUser({
          exists: true,
          user: admin,
          message: 'Admin user found in database'
        })
      } else {
        setAdminUser({
          exists: false,
          message: 'Admin user NOT found in database'
        })
      }
      
    } catch (error) {
      setAdminUser({
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Error checking admin user'
      })
    } finally {
      setLoading(false)
    }
  }

  const testPassword = async () => {
    try {
      // Test login directly
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@symphony.com',
          password: 'admin123'
        })
      })

      const data = await response.json()
      
      setAdminUser({
        ...adminUser,
        loginTest: {
          status: response.status,
          data: data
        }
      })
      
    } catch (error) {
      setAdminUser({
        ...adminUser,
        loginTest: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🔍 Admin User Check</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Admin Status:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(adminUser, null, 2)}
        </pre>
      </div>

      <div className="space-x-4 mb-6">
        <button 
          onClick={checkAdminUser}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Admin Check
        </button>
        
        <button 
          onClick={testPassword}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Login
        </button>
      </div>

      <div className="bg-yellow-100 p-4 rounded">
        <h2 className="font-bold mb-2">Debug Steps:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Check if admin user exists in database</li>
          <li>Test login credentials</li>
          <li>Check password hashing match</li>
          <li>Verify authentication flow</li>
        </ol>
      </div>

      <div className="mt-6 bg-red-100 p-4 rounded">
        <h2 className="font-bold mb-2">If Admin Not Found:</h2>
        <p>Visit: http://localhost:3000/create-admin</p>
        <p>Click "Create Admin User" button</p>
      </div>
    </div>
  )
}
