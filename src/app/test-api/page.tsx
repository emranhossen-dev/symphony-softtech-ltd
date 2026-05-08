'use client'

import { useState, useEffect } from 'react'

export default function TestAPIPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/categories')
      .then(res => res.json())
      .then(result => {
        console.log('API Response:', result)
        setData(result)
        setLoading(false)
      })
      .catch(error => {
        console.error('API Error:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Results</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Raw Response:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <div className="bg-blue-100 p-4 rounded">
        <h2 className="font-bold mb-2">Categories Count:</h2>
        <p className="text-lg">
          {data?.categories?.length || 0} categories found
        </p>
      </div>

      {data?.categories?.map((cat: any, index: number) => (
        <div key={index} className="border p-4 mb-2 rounded">
          <h3 className="font-bold">{cat.name}</h3>
          <p>Slug: {cat.slug}</p>
          <p>Courses: {cat.courses?.length || 0}</p>
        </div>
      ))}
    </div>
  )
}
