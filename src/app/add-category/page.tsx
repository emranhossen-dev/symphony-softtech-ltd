'use client'

import { useState } from 'react'

export default function AddCategoryPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const addCategory = async () => {
    setLoading(true)
    
    const categoryData = {
      name: 'Government Courses',
      slug: 'government',
      description: 'Government job preparation courses',
      color: 'blue',
      icon: 'government',
      isActive: true
    }

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      })

      const data = await response.json()
      setResult(data)
      console.log('Category added:', data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      const data = await response.json()
      setResult(data)
      console.log('Categories:', data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Admin Categories</h1>
      
      <div className="space-x-4 mb-6">
        <button 
          onClick={addCategory}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Sample Category'}
        </button>
        
        <button 
          onClick={fetchCategories}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Fetch Categories
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Result:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>

      <div className="mt-6 bg-blue-100 p-4 rounded">
        <h2 className="font-bold mb-2">Next Steps:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click "Add Sample Category"</li>
          <li>Then click "Fetch Categories" to verify</li>
          <li>Visit Admin Panel to see real data</li>
        </ol>
      </div>
    </div>
  )
}
