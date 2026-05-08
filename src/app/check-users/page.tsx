'use client'

import { useState, useEffect } from 'react'

export default function CheckUsersPage() {
  const [users, setUsers] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUsers()
  }, [])

  const checkUsers = async () => {
    try {
      // Check if any users exist in database
      const response = await fetch('/api/admin/users', {
        method: 'GET'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        // If API fails, show default admin credentials
        setUsers({
          message: 'Using default admin credentials',
          defaultAdmin: {
            email: 'admin@symphony.com',
            password: 'admin123',
            role: 'ADMIN'
          }
        })
      }
    } catch (error) {
      setUsers({
        message: 'Using default admin credentials',
        defaultAdmin: {
          email: 'admin@symphony.com',
          password: 'admin123',
          role: 'ADMIN'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const createDefaultAdmin = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@symphony.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'ADMIN',
          isActive: true
        })
      })

      const result = await response.json()
      console.log('Admin created:', result)
      checkUsers() // Refresh the list
    } catch (error) {
      console.error('Error creating admin:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🔐 Admin Login Credentials</h1>
      
      <div className="bg-blue-100 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4">Default Admin Login:</h2>
        <div className="space-y-2">
          <p><strong>Email:</strong> admin@symphony.com</p>
          <p><strong>Password:</strong> admin123</p>
          <p><strong>Role:</strong> ADMIN</p>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Database Users:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(users, null, 2)}
        </pre>
      </div>

      <div className="space-x-4">
        <button 
          onClick={createDefaultAdmin}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create Default Admin
        </button>
        
        <button 
          onClick={checkUsers}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Users
        </button>
      </div>

      <div className="mt-6 bg-yellow-100 p-4 rounded">
        <h2 className="font-bold mb-2">Login Steps:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Go to: http://localhost:3000/login</li>
          <li>Use email: admin@symphony.com</li>
          <li>Use password: admin123</li>
          <li>Click login</li>
          <li>You'll be redirected to admin dashboard</li>
        </ol>
      </div>
    </div>
  )
}
