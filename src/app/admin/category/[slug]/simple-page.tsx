"use client";

import { use } from 'react';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Category Page</h1>
      <p>Slug: {slug}</p>
    </div>
  );
}
