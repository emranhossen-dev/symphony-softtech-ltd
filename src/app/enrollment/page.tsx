"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Users, Clock, DollarSign, Award, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatBDT } from '@/lib/currency';

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

export default function EnrollmentPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollForm, setShowEnrollForm] = useState(false);

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

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedCategory, selectedLevel, priceRange]);

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
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

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

    setFilteredCourses(filtered);
  };


  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setShowEnrollForm(true);
  };

  const handleEnrollmentSuccess = (enrollmentData: any) => {
    toast.success('Enrollment submitted successfully!');
    setShowEnrollForm(false);
    setSelectedCourse(null);
    // Refresh courses to update enrollment count
    fetchCourses();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section */}
      <section className="relative py-24 bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full text-blue-300 mb-8 border border-blue-400/30">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="font-bold">START YOUR JOURNEY</span>
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Enroll in Our
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Courses
              </span>
            </h1>
            
            <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed mb-12">
              Choose from our comprehensive range of courses and take the first step towards your dream career
            </p>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="enhanced-stat-card">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-3">
                  5000+
                </div>
                <div className="text-white/70 font-medium">Students Enrolled</div>
                <div className="mt-2 text-blue-400 text-sm">✓ Growing Community</div>
              </div>
              <div className="enhanced-stat-card">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
                  95%
                </div>
                <div className="text-white/70 font-medium">Success Rate</div>
                <div className="mt-2 text-purple-400 text-sm">✓ Proven Results</div>
              </div>
              <div className="enhanced-stat-card">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-3">
                  50+
                </div>
                <div className="text-white/70 font-medium">Expert Mentors</div>
                <div className="mt-2 text-green-400 text-sm">✓ Industry Leaders</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Find Your Course</h2>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ${priceRange.min} - ${priceRange.max}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setSelectedLevel('ALL');
                  setPriceRange({ min: 0, max: 1000 });
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="flex-1">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                    {/* Course Image */}
                    <div className="h-48 relative overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-center">
                            <Award className="w-12 h-12 text-primary mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Course Image</p>
                          </div>
                        )}
                        {course.featured && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-white text-xs rounded-full">
                            Featured
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {course.category}
                        </span>
                        <span className="text-sm text-gray-500">{course.level}</span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {course.shortDescription || course.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.enrollmentCount} students</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(course.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </div>
                          ))}
                          <span className="text-sm text-gray-600 ml-1">({course.rating})</span>
                        </div>
                        <span className="text-sm text-gray-500">({course.reviewCount} reviews)</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-primary">
                            {formatBDT(course.price)}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleCourseSelect(course)}
                          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors group"
                        >
                          Enroll Now
                          <CheckCircle className="inline-block ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
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

      {/* Enrollment Form Modal */}
      {showEnrollForm && selectedCourse && (
        <EnrollmentFormModal
          course={selectedCourse}
          onClose={() => {
            setShowEnrollForm(false);
            setSelectedCourse(null);
          }}
          onSuccess={handleEnrollmentSuccess}
        />
      )}
    </div>
  );
}

// Enrollment Form Modal Component
interface EnrollmentFormModalProps {
  course: Course;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

function EnrollmentFormModal({ course, onClose, onSuccess }: EnrollmentFormModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    educationLevel: '',
    whyJoin: '',
        paymentMethod: 'ONLINE_BATCH',
    transactionId: '',
    amount: course.price
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check course category and handle accordingly
      if (course.category === 'GOVERNMENT') {
        // Government courses - Free registration
        const registrationData = {
          ...formData,
          courseName: course.title,
          category: course.category,
          courseId: course.id,
          paymentMethod: 'FREE_REGISTRATION',
          amount: 0,
          tran_id: `GOV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'confirmed'
        };

        const response = await fetch('/api/enrollment/government-register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });

        const data = await response.json();

        if (data.success) {
          // Send confirmation email
          await fetch('/api/email/send-government-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              fullName: formData.fullName,
              courseName: course.title,
              subject: formData.whyJoin || 'Interested in this course',
            }),
          });

          // Redirect to success page
          window.location.href = `/enrollment/government-success?tran_id=${registrationData.tran_id}`;
        } else {
          throw new Error(data.error || 'Registration failed');
        }
      } else {
        // Online and Recorded courses - Payment required
        if (course.category !== 'ONLINE' && course.category !== 'RECORDED') {
          throw new Error('Invalid course category for payment');
        }

        // Create SSL Commerce payment session
        const paymentData = {
          ...formData,
          courseName: course.title,
          category: course.category,
          courseId: course.id,
          currency: 'BDT',
          tran_id: `SSL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          success_url: `${window.location.origin}/enrollment/success`,
          fail_url: `${window.location.origin}/enrollment/failed`,
          cancel_url: `${window.location.origin}/enrollment/cancel`
        };

        // Initiate SSL Commerce payment
        const sslResponse = await fetch('/api/payment/ssl-initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        });

        const sslData = await sslResponse.json();

        if (sslData.success && sslData.gateway_url) {
          // Store enrollment data temporarily
          await fetch('/api/enrollment/temp-store', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...paymentData,
              temp_id: sslData.tran_id,
              status: 'pending'
            }),
          });

          // Redirect to SSL Commerce payment gateway
          window.location.href = sslData.gateway_url;
        } else {
          throw new Error(sslData.error || 'Payment initiation failed');
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert(error instanceof Error ? error.message : 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Enroll in {course.title}</h2>
              <p className="text-gray-600 mt-1">Complete the form below to start your journey</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full address"
                  rows={3}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({...formData, educationLevel: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Education Level</option>
                  <option value="High School">High School</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor's">Bachelor's</option>
                  <option value="Master's">Master's</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to join this course?</label>
                <textarea
                  value={formData.whyJoin}
                  onChange={(e) => setFormData({...formData, whyJoin: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Tell us your motivation"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Payment Information - Only for paid courses */}
          {course.category !== 'GOVERNMENT' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="ONLINE_BATCH"
                        checked={formData.paymentMethod === 'ONLINE_BATCH'}
                        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Online Live Batch</div>
                        <div className="text-sm text-gray-500">Live interactive classes with mentors</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="RECORDED"
                        checked={formData.paymentMethod === 'RECORDED'}
                        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Recorded Course</div>
                        <div className="text-sm text-gray-500">Self-paced learning with lifetime access</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (if paid)</label>
                  <input
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter transaction ID"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Course Fee:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatBDT(course.price)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Government Course Information */}
          {course.category === 'GOVERNMENT' && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <h3 className="font-semibold text-green-900">Free Registration</h3>
              </div>
              <p className="text-green-700 text-sm">
                This is a government-sponsored course. No payment required. Simply submit your interest and we'll contact you with further details.
              </p>
            </div>
          )}

          {/* Terms and Submit */}
          <div className="mt-6">
            <div className="mb-4">
              <label className="flex items-center">
                <input type="checkbox" required className="mr-2" />
                <span className="text-sm text-gray-600">
                  I agree to the terms and conditions and privacy policy
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Enrollment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
