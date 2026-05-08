'use client'

import { useState } from 'react'

export default function CreateAdminPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const createAdmin = async () => {
    setLoading(true)
    
    try {
      // Hash password client-side (simple approach)
      const encoder = new TextEncoder()
      const passwordData = encoder.encode('admin123')
      const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@symphony.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          isActive: true
        })
      })

      const responseData = await response.json()
      setResult(responseData)
      
      if (response.ok) {
        console.log('Admin created successfully!')
      } else {
        console.log('Error creating admin:', responseData)
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🔐 Create Admin User</h1>
      
      <div className="bg-blue-100 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4">Admin Credentials:</h2>
        <div className="space-y-2">
          <p><strong>Email:</strong> admin@symphony.com</p>
          <p><strong>Password:</strong> admin123</p>
          <p><strong>Role:</strong> ADMIN</p>
        </div>
      </div>

      <button 
        onClick={createAdmin}
        disabled={loading}
        className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 disabled:opacity-50 mb-6"
      >
        {loading ? 'Creating Admin...' : 'Create Admin User'}
      </button>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Result:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>

      <div className="mt-6 bg-yellow-100 p-4 rounded">
        <h2 className="font-bold mb-2">Next Steps:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click "Create Admin User"</li>
          <li>Wait for success message</li>
          <li>Go to: http://localhost:3000/login</li>
          <li>Login with admin@symphony.com / admin123</li>
        </ol>
      </div>
    </div>
  )
}
