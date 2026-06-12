"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, DollarSign, Building, User, Mail, Phone, Calendar, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

interface EnrollmentFormProps {
  course: {
    id: string;
    title: string;
    price: number;
    category: string;
    slug: string;
  };
  onClose?: () => void;
}

const EnrollmentForm = ({ course, onClose }: EnrollmentFormProps) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    education: '',
    paymentMethod: '',
    agreeTerms: false
  });

  // Add custom styles for animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100px) rotate(360deg); opacity: 0; }
      }
      .animation-delay-200 { animation-delay: 200ms; }
      .animation-delay-400 { animation-delay: 400ms; }
      .animation-delay-600 { animation-delay: 600ms; }
      .animation-delay-800 { animation-delay: 800ms; }
      .animate-confetti {
        animation: confetti-fall 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const playSuccessSound = () => {
    try {
      // Create a simple success sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Play success sound when step changes to 3 (success)
  React.useEffect(() => {
    if (step === 3) {
      playSuccessSound();
    }
  }, [step]);

  // Determine payment options based on category
  const getPaymentOptions = () => {
    const categorySlug = course.slug.toLowerCase();
    
    // Government courses - no payment
    if (categorySlug === 'government' || categorySlug.includes('government')) {
      return {
        showPayment: false,
        title: 'Free Enrollment',
        description: 'This course is completely free. Just fill in your details to enroll.',
        options: []
      };
    }
    
    // Recorded courses - online payment only
    if (categorySlug === 'recorded' || categorySlug.includes('recorded')) {
      return {
        showPayment: true,
        title: 'Secure Payment',
        description: 'This course requires online payment only.',
        options: [
          {
            id: 'online',
            name: 'Online Payment',
            description: `Pay ${course.price ? `BDT ${course.price.toLocaleString()}` : 'course fee'} securely with SSLCommerz`,
            icon: CreditCard,
            color: 'blue'
          }
        ]
      };
    }
    
    // Live and Online courses - both options
    return {
      showPayment: true,
      title: 'Choose Payment Method',
      description: 'Select your preferred payment method',
      options: [
        {
          id: 'online',
          name: 'Online Payment',
          description: `Pay ${course.price ? `BDT ${course.price.toLocaleString()}` : 'course fee'} securely with SSLCommerz`,
          icon: CreditCard,
          color: 'blue'
        },
        {
          id: 'cash',
          name: 'Cash Payment',
          description: 'Pay at our center',
          icon: DollarSign,
          color: 'green'
        }
      ]
    };
  };

  const paymentConfig = getPaymentOptions();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    
    try {
      // Debug: Log the data being sent
      const submissionData = {
        courseId: course.id,
        ...formData
      };
      console.log('Submitting enrollment data:', submissionData);
      
      // Check if user might already be enrolled (frontend validation)
      if (formData.email) {
        console.log('Checking for existing enrollment...');
      }
      
      // Submit enrollment
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        console.log('Enrollment successful:', data);
        // Handle different payment methods
        if (formData.paymentMethod === 'online') {
          // Redirect to SSLCommerz payment
          if (data.paymentUrl) {
            window.location.href = data.paymentUrl;
          } else {
            setStep(3);
          }
        } else if (formData.paymentMethod === 'cash') {
          // Show cash payment confirmation
          setStep(3);
        } else {
          // Free enrollment - direct success
          setStep(3);
        }
      } else {
        console.error('Enrollment failed:', data);
        // Don't show success page if enrollment failed
        if (data.error && data.error.includes('already enrolled')) {
          // If already enrolled, offer to go to dashboard
          if (confirm('You are already enrolled in this course. Would you like to go to your dashboard to view your enrollment?')) {
            router.push('/student/dashboard');
            return;
          }
        } else {
          alert(`Enrollment failed: ${data.error || 'Unknown error. Please try again.'}`);
        }
        return; // Stop execution here
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
          <User className="w-6 h-6 text-emerald-400" />
          Personal Information
        </h3>
        
        <div className="rounded-2xl p-6 shadow-lg" style={{background: '#112354', border: '1px solid rgba(30,58,138,0.3)'}}> 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-300 mb-2">Full Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                id="fullName"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400 bg-gray-700 transition-all duration-300"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">Email <span className="text-red-400">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400 bg-gray-700 transition-all duration-300"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-300 mb-2">Phone Number <span className="text-red-400">*</span></label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400 bg-gray-700 transition-all duration-300"
                placeholder="01XXXXXXXXX"
              />
            </div>
            
            <div>
              <label htmlFor="dob" className="block text-sm font-semibold text-gray-300 mb-2">Date of Birth</label>
              <div className="relative">
                <input
                  type="date"
                  id="dob"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white bg-gray-700 transition-all duration-300"
                />
                <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-gray-300 mb-2">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400 bg-gray-700 transition-all duration-300"
              placeholder="Your full address"
            />
          </div>
          
          <div>
            <label htmlFor="education" className="block text-sm font-semibold text-gray-300 mb-2">Education</label>
            <select
              id="education"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white bg-gray-700 transition-all duration-300"
            >
              <option value="">Select Education Level</option>
              <option value="ssc">SSC</option>
              <option value="hsc">HSC</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentOptions = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
          <CreditCard className="w-6 h-6 text-blue-400" />
          {paymentConfig.title}
        </h3>
        <p className="text-gray-400 mb-6">{paymentConfig.description}</p>
        
        {paymentConfig.showPayment && (
          <div className="space-y-4">
            {paymentConfig.options.map((option) => {
              const IconComponent = option.icon;
              return (
                <label
                  key={option.id}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    formData.paymentMethod === option.id
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.id}
                      checked={formData.paymentMethod === option.id}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      option.color === 'blue' ? 'bg-blue-900/30' : option.color === 'green' ? 'bg-green-900/30' : 'bg-gray-800'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${
                        option.color === 'blue' ? 'text-blue-400' : option.color === 'green' ? 'text-green-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{option.name}</h4>
                      <p className="text-sm text-gray-400">{option.description}</p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
        
        {!paymentConfig.showPayment && (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h4 className="font-semibold text-green-300">Free Course</h4>
            </div>
            <p className="text-green-300">
              This government course is completely free of charge. You will get access to all materials and support at no cost.
            </p>
          </div>
        )}
      </div>
      <div className="mt-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleInputChange}
            required
            className="w-4 h-4 mt-1"
          />
          <span className="text-sm text-gray-400">
            I agree to the terms and conditions and understand that my information will be used for enrollment purposes.
          </span>
        </label>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-8">
      {/* Success Animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
          <CheckCircle className="w-12 h-12 text-white animate-bounce" />
        </div>
        {/* Confetti Effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-40 h-40 relative">
            <div className="absolute top-0 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-confetti animation-delay-200"></div>
            <div className="absolute top-1/4 right-0 w-3 h-3 bg-red-400 rounded-full animate-confetti animation-delay-400"></div>
            <div className="absolute bottom-0 left-1/3 w-3 h-3 bg-blue-400 rounded-full animate-confetti animation-delay-600"></div>
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-confetti animation-delay-800"></div>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-confetti"></div>
            <div className="absolute top-0 right-1/3 w-2 h-2 bg-pink-400 rounded-full animate-confetti animation-delay-300"></div>
            <div className="absolute bottom-1/4 left-0 w-2 h-2 bg-indigo-400 rounded-full animate-confetti animation-delay-500"></div>
          </div>
        </div>
      </div>
      
      {/* Success Message */}
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-3">
          ভর্তি সফলভাবে সম্পন্ন হয়েছে! 🎉
        </h3>
        <p className="text-lg text-gray-400">
          আপনার কোর্সে ভর্তির আবেদন গৃহীত হয়েছে
        </p>
      </div>
      
      {/* Verification Required Card */}
      <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-700 rounded-2xl p-8 mb-8 shadow-lg transform transition-all duration-300 hover:scale-105">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <h4 className="text-xl font-bold text-blue-300">যাচাইকরণ প্রয়োজন</h4>
        </div>
        <p className="text-blue-300 mb-6 text-lg leading-relaxed">
          আপনার ভর্তি সফলভাবে জমা হয়েছে! তবে আপনার ড্যাশবোর্ড অ্যাক্সেস করার জন্য অ্যাডমিনের অনুমোদন প্রয়োজন।
        </p>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h5 className="font-bold text-white mb-4 text-lg">পরবর্তী ধাপসমূহ:</h5>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-400 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-white">অ্যাডমিন পর্যালোচনা করবেন</p>
                <p className="text-sm text-gray-400">আপনার ভর্তির আবেদন পর্যালোচনা করা হবে</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-400 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-white">ইমেল নোটিফিকেশন পাবেন</p>
                <p className="text-sm text-gray-400">অনুমোদনের পর ইমেল পাবেন</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-400 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-white">পাসওয়ার্ড সেট করুন</p>
                <p className="text-sm text-gray-400">ইমেল লিংক থেকে পাসওয়ার্ড সেট করুন</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-400 font-bold text-sm">4</span>
              </div>
              <div>
                <p className="font-medium text-white">ড্যাশবোর্ড অ্যাক্সেস করুন</p>
                <p className="text-sm text-gray-400">সম্পূর্ণ ড্যাশবোর্ড ব্যবহার করুন</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Information */}
      {formData.paymentMethod === 'cash' && (
        <div className="relative overflow-hidden rounded-2xl mb-8">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6 text-white">
            <div className="flex items-center justify-center mb-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h4 className="text-2xl font-bold">পেমেন্ট প্রয়োজন</h4>
                <p className="text-amber-100">যাচাইকরণ এগিয়ে যেতে পেমেন্ট সম্পন্ন করুন</p>
              </div>
            </div>
          </div>
          
          {/* Content with modern card design */}
          <div className="bg-gray-800 p-8 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Amount Card */}
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-700 text-center transform transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-sm text-gray-400 mb-2">পরিমাণ</p>
                <p className="text-3xl font-bold text-white">BDT {course.price.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">সম্পূর্ণ পেমেন্ট</p>
              </div>
              
              {/* Location Card */}
              <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl p-6 border border-blue-700 text-center transform transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <p className="text-sm text-gray-400 mb-2">অবস্থান</p>
                <p className="text-lg font-bold text-white">Symphony Institute of Technology</p>
                <p className="text-sm text-gray-400">মিরপুর রোড, ঢাকা</p>
              </div>
              
              {/* Time Card */}
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-700 text-center transform transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-sm text-gray-400 mb-2">সময়</p>
                <p className="text-xl font-bold text-white">সকাল ৯টা - সন্ধ্যা ৬টা</p>
                <p className="text-xs text-gray-500 mt-1">সোমবার - শুক্রবার</p>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
              <h5 className="font-bold text-white mb-4 text-lg">পেমেন্ট পদ্ধতি:</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600 hover:shadow-md transition-shadow">
                  <div className="w-12 h-8 bg-pink-600 rounded flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs">bKash</span>
                  </div>
                  <p className="text-xs font-medium text-gray-300">bKash</p>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600 hover:shadow-md transition-shadow">
                  <div className="w-12 h-8 bg-purple-800 rounded flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs">Rocket</span>
                  </div>
                  <p className="text-xs font-medium text-gray-300">Rocket</p>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600 hover:shadow-md transition-shadow">
                  <div className="w-12 h-8 bg-orange-500 rounded flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs">Nagad</span>
                  </div>
                  <p className="text-xs font-medium text-gray-300">Nagad</p>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600 hover:shadow-md transition-shadow">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs">Visa</span>
                  </div>
                  <p className="text-xs font-medium text-gray-300">Visa</p>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600 hover:shadow-md transition-shadow">
                  <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs">MC</span>
                  </div>
                  <p className="text-xs font-medium text-gray-300">MasterCard</p>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600 hover:shadow-md transition-shadow">
                  <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs">Amex</span>
                  </div>
                  <p className="text-xs font-medium text-gray-300">American Express</p>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600 hover:shadow-md transition-shadow">
                  <div className="w-12 h-8 bg-indigo-600 rounded flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs">SSL</span>
                  </div>
                  <p className="text-xs font-medium text-gray-300">SSLCommerz</p>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600 hover:shadow-md transition-shadow">
                  <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs">Cash</span>
                  </div>
                  <p className="text-xs font-medium text-gray-300">Cash</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {formData.paymentMethod === 'online' && (
        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-700 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center animate-pulse">
              <CreditCard className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="text-xl font-bold text-blue-300">পেমেন্ট প্রক্রিয়াধান</h4>
          </div>
          <p className="text-blue-300 text-lg">
            আপনার পেমেন্ট প্রক্রিয়া চলছে। পেমেন্ট এবং অ্যাডমিন অনুমোদন উভয় সম্পন্ন হলে আপনি নিশ্চিতকরণ পাবেন।
          </p>
        </div>
      )}
      
      {!paymentConfig.showPayment && (
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-800 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h4 className="text-xl font-bold text-green-300">বিনামূল্য কোর্স</h4>
          </div>
          <p className="text-green-300 text-lg">
            আপনার বিনামূল্য কোর্সের ভর্তি এখন পর্যালোচনাধীন। ড্যাশবোর্ড অ্যাক্সেসের জন্য অ্যাডমিন অনুমোদন প্রয়োজন।
          </p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => window.location.href = '/'}
          className="group relative px-8 py-4 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-800 hover:via-gray-900 hover:to-black transition-all duration-300 transform hover:scale-105 shadow-xl font-medium text-lg overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center">
            <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            🏠 হোম পেজে ফিরে যান
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        
        {onClose && (
          <button
            onClick={onClose}
            className="group relative px-8 py-4 bg-gray-700 border-2 border-gray-600 text-gray-300 rounded-xl hover:border-gray-500 hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium text-lg overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              বন্ধ করুন
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="solid-modal-bg rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{background: '#0d1b3e', border: '1px solid rgba(30,58,138,0.5)'}}> 
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Enroll in {course.title}</h2>
            <p className="text-emerald-100">{course.category} Course • {course.price ? `BDT ${course.price.toLocaleString()}` : 'Free'}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-700'
            }`}>
              1
            </div>
            <span className="text-sm font-medium text-gray-300">Personal Info</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-700'}`}></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-700'
            }`}>
              2
            </div>
            <span className="text-sm font-medium text-gray-300">Payment</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-emerald-600' : 'bg-gray-700'}`}></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-emerald-600 text-white' : 'bg-gray-700'
            }`}>
              3
            </div>
            <span className="text-sm font-medium text-gray-300">Success</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6">
        {step === 1 && renderPersonalInfo()}
        {step === 2 && renderPaymentOptions()}
        {step === 3 && renderSuccess()}

        {/* Navigation Buttons */}
        {step < 3 && (
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {step === 1 ? 'Continue' : 'Complete Enrollment'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );

};

export default EnrollmentForm;

