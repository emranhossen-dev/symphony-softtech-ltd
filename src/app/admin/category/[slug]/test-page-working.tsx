"use client";

import { use } from 'react';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Category Page Working!</h1>
      <p>Slug: {slug}</p>
      <p>This is a test to see if the routing works.</p>
    </div>
  );
}
