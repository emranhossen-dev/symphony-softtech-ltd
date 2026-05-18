"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Star, Users, Clock, DollarSign, BookOpen, Grid, List } from 'lucide-react';
import { formatBDT } from '@/lib/currency';
import Counter from "@/components/Counter";

interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  category: string;
  price: number;
  duration: string;
  level: string;
  isActive: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  createdAt: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Read category from URL query param on mount
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat.toUpperCase());
    }
  }, [searchParams]);

  const categories = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'GOVERNMENT', label: 'Government' },
    { value: 'ONLINE', label: 'Online Live' },
    { value: 'OFFLINE', label: 'Offline' },
    { value: 'RECORDED', label: 'Recorded' }
  ];

  const levels = [
    { value: 'ALL', label: 'All Levels' },
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchTerm, selectedCategory, selectedLevel, priceRange, sortBy]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCourses = () => {
    let filtered = [...courses || []];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Filter by level
    if (selectedLevel !== 'ALL') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Filter by price range
    filtered = filtered.filter(course => 
      course.price >= priceRange.min && course.price <= priceRange.max
    );

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
          return b.enrollmentCount - a.enrollmentCount;
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  };


  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-600"
            }`}
          />
        ))}
        <span className="text-sm text-gray-400 ml-1">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="glass-card overflow-hidden">
                  <div className="h-48 bg-gray-800"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-800 rounded w-full"></div>
                    <div className="h-3 bg-gray-800 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-button border-b border-blue-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">All Courses</h1>
              <p className="text-gray-300">Discover <Counter end={filteredCourses.length} /> courses to advance your career</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'glass-button text-blue-400 border border-blue-500/50' : 'glass-button text-gray-400'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'glass-button text-blue-400 border border-blue-500/50' : 'glass-button text-gray-400'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="glass-card p-6 sticky top-0">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Filters</h2>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full pl-10 pr-4 py-2 glass-button rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 glass-button rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-blue-900/50"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value} className="bg-blue-900">{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-2 glass-button rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-blue-900/50"
                >
                  {levels.map(level => (
                    <option key={level.value} value={level.value} className="bg-blue-900">{level.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price Range: ৳{priceRange.min} - ৳{priceRange.max}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 glass-button rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-blue-900/50"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-blue-900">{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setSelectedLevel('ALL');
                  setPriceRange({ min: 0, max: 50000 });
                  setSortBy('newest');
                }}
                className="w-full px-4 py-2 glass-button text-gray-300 rounded-lg hover:bg-blue-900/30 border border-blue-500/30 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Courses Grid/List */}
          <div className="flex-1">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
                <p className="text-gray-300">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredCourses.map((course) => (
                  <div 
                    key={course.id} 
                    className="glass-card overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
                    style={{
                      background: 'rgba(26, 31, 76, 0.9)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '20px',
                      minHeight: '500px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onClick={() => router.push(`/course/${course.id}`)}
                  >
                    {/* Course Image */}
                    <div className="h-64 flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center relative">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-fill"
                          />
                        ) : (
                          <div className="text-center">
                            <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Course Image</p>
                          </div>
                        )}
                        {course.featured && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs rounded-full">
                            Featured
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-blue-400 glass-button px-3 py-1 rounded-full border border-blue-500/30">
                          {course.category}
                        </span>
                        <span className="text-sm text-gray-300">{course.level}</span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3">{course.title}</h3>
                      
                      <p className="text-gray-300 mb-4 line-clamp-2">
                        {course.shortDescription || course.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span>{course.enrollmentCount} students</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        {renderStars(course.rating)}
                        <span className="text-sm text-gray-400">({course.reviewCount} reviews)</span>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-2xl font-bold text-blue-400">
                            {formatBDT(course.price)}
                          </span>
                        </div>
                        <button className="glass-button px-4 py-2 rounded-lg text-blue-400 border border-blue-500/50 hover:border-blue-400 transition-colors">
                          View Course
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
