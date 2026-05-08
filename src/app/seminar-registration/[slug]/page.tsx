"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  ArrowLeft,
  Send,
  User,
  Mail,
  Phone,
  BookOpen,
  Award,
  Sparkles,
  Star,
  TrendingUp,
  Target,
  Zap,
  Gift,
  Trophy,
  Flame,
  Heart,
  Diamond,
  Rocket,
  Crown,
  Shield,
  Brain,
  Lightbulb,
  Compass,
  Flag
} from "lucide-react";

interface Seminar {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  currentRegistrations: number;
  imageUrl?: string;
  status: string;
}

export default function SeminarRegistrationPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [seminar, setSeminar] = useState<Seminar | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    education: "",
    whyJoin: "",
    experience: ""
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formProgress, setFormProgress] = useState(0);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    fetchSeminar();
  }, [slug]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fields: (keyof typeof formData)[] = ['fullName', 'email', 'phone', 'education', 'whyJoin'];
    const filledFields = fields.filter(field => formData[field].trim() !== '');
    setFormProgress((filledFields.length / fields.length) * 100);
    
    // Check if form is valid
    const isValid = filledFields.length === fields.length && 
      formData.email.includes('@') && 
      formData.phone.length >= 11;
    setIsFormValid(isValid);
  }, [formData]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (!seminar) return;

    const calculateTimeLeft = () => {
      // Try different date parsing methods
      let seminarDateTime;
      try {
        // Method 1: Standard ISO format
        seminarDateTime = new Date(`${seminar.date}T${seminar.time}`);
        if (isNaN(seminarDateTime.getTime())) {
          // Method 2: Try parsing date separately
          const dateObj = new Date(seminar.date);
          const [hours, minutes] = seminar.time.split(':');
          dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          seminarDateTime = dateObj;
        }
      } catch (error) {
        seminarDateTime = new Date();
      }
      
      const now = new Date();
      const difference = seminarDateTime.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [seminar]);

  const fetchSeminar = async () => {
    try {
      const response = await fetch(`/api/public/seminars/${slug}`);
      const data = await response.json();

      if (data.success) {
        setSeminar(data.data);
      } else {
        setError(data.error || "Seminar not found");
      }
    } catch (error) {
      setError("Failed to load seminar details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/seminars/${seminar?.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || "Failed to register");
      }
    } catch (error) {
      setError("Failed to submit registration");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl animate-pulse opacity-20"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl animate-pulse opacity-20 delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200 rounded-full blur-3xl animate-pulse opacity-20 delay-500"></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
              <Sparkles className="w-10 h-10 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl animate-ping opacity-20"></div>
          </div>
          <div className="mt-8 space-y-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
              Loading Amazing Experience...
            </div>
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-0"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center border border-green-100">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Thank you for registering for "{seminar?.title}". We'll send you a confirmation email soon.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => window.location.href = `/seminar-registration/${slug}`}
              variant="outline"
              className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-4 rounded-xl transition-all duration-300"
            >
              View Registration
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!seminar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div className="text-xl font-semibold text-gray-700">Seminar not found</div>
        </div>
      </div>
    );
  }

  const isFull = seminar.currentRegistrations >= seminar.maxParticipants;
  const registrationPercentage = (seminar.currentRegistrations / seminar.maxParticipants) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Advanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        
        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-twinkle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Mouse Follower */}
        <div 
          className="absolute w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-twinkle pointer-events-none z-50"
          style={{ 
            left: `${(mousePosition.x / window.innerWidth) * 100}%`, 
            top: `${(mousePosition.y / window.innerHeight) * 100}%`,
            transition: 'all 0.1s ease-out',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
      
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        {/* Header */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <Button
                onClick={() => window.location.href = '/'}
                variant="ghost"
                className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/10 px-3 sm:px-4 border border-white/20 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <h1 className="text-lg sm:text-xl font-semibold text-white">Seminar Registration</h1>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/30 shadow-2xl group hover:scale-105 transition-all duration-300">
              <Crown className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="text-sm font-bold text-white">Limited Seats Available - {seminar.maxParticipants - seminar.currentRegistrations} spots left!</span>
              <Flame className="w-5 h-5 text-orange-300 animate-bounce" />
            </div>
            <div className="relative mb-8">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-200 to-white animate-gradient bg-300">
                {seminar.title}
              </h2>
              <div className="absolute inset-0 text-4xl sm:text-5xl lg:text-6xl font-bold text-white/20 blur-xl animate-pulse">
                {seminar.title}
              </div>
            </div>
            <p className="text-xl sm:text-2xl text-white/95 max-w-4xl mx-auto mb-10 leading-relaxed font-medium">
              {seminar.description}
            </p>
            
            {/* Enhanced Event Details Cards */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="group relative overflow-hidden bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30 shadow-xl hover:scale-110 transition-all duration-300 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-blue-200 font-semibold">DATE</div>
                    <div className="text-sm font-bold text-white">{new Date(seminar.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30 shadow-xl hover:scale-110 transition-all duration-300 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-purple-200 font-semibold">TIME</div>
                    <div className="text-sm font-bold text-white">{seminar.time}</div>
                  </div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30 shadow-xl hover:scale-110 transition-all duration-300 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-pink-200 font-semibold">LOCATION</div>
                    <div className="text-sm font-bold text-white">{seminar.location}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Countdown Timer */}
            <div className="flex justify-center mb-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-3xl blur-2xl animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Rocket className="w-6 h-6 text-yellow-300 animate-bounce" />
                      <span className="text-xl font-bold text-yellow-300">Seminar Starts In</span>
                      <Flame className="w-6 h-6 text-orange-300 animate-pulse" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center group/card">
                      <div className="bg-gradient-to-br from-white/30 to-white/10 rounded-2xl p-4 min-w-[70px] sm:min-w-[90px] transform hover:scale-110 hover:rotate-3 transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/20">
                        <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums animate-pulse">
                          {String(timeLeft.days).padStart(2, '0')}
                        </div>
                        <div className="text-sm sm:text-base text-white/90 mt-2 font-bold uppercase tracking-wider">Days</div>
                      </div>
                    </div>
                    <div className="text-center group/card">
                      <div className="bg-gradient-to-br from-white/30 to-white/10 rounded-2xl p-4 min-w-[70px] sm:min-w-[90px] transform hover:scale-110 hover:rotate-3 transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/20">
                        <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums animate-pulse delay-75">
                          {String(timeLeft.hours).padStart(2, '0')}
                        </div>
                        <div className="text-sm sm:text-base text-white/90 mt-2 font-bold uppercase tracking-wider">Hours</div>
                      </div>
                    </div>
                    <div className="text-center group/card">
                      <div className="bg-gradient-to-br from-white/30 to-white/10 rounded-2xl p-4 min-w-[70px] sm:min-w-[90px] transform hover:scale-110 hover:rotate-3 transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/20">
                        <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums animate-pulse delay-150">
                          {String(timeLeft.minutes).padStart(2, '0')}
                        </div>
                        <div className="text-sm sm:text-base text-white/90 mt-2 font-bold uppercase tracking-wider">Minutes</div>
                      </div>
                    </div>
                    <div className="text-center group/card">
                      <div className="bg-gradient-to-br from-white/30 to-white/10 rounded-2xl p-4 min-w-[70px] sm:min-w-[90px] transform hover:scale-110 hover:rotate-3 transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/20">
                        <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums animate-pulse delay-300">
                          {String(timeLeft.seconds).padStart(2, '0')}
                        </div>
                        <div className="text-sm sm:text-base text-white/90 mt-2 font-bold uppercase tracking-wider">Seconds</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 sm:h-20 animate-wave" viewBox="0 0 1440 120" fill="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="url(#gradient)" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="50%" stopColor="#f0f9ff" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Seminar Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-blue-200" />
                  <TrendingUp className="w-4 h-4 text-blue-200" />
                </div>
                <div className="text-2xl font-bold">{seminar.currentRegistrations}</div>
                <div className="text-blue-100 text-sm">Already Registered</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-purple-200" />
                  <Star className="w-4 h-4 text-purple-200" />
                </div>
                <div className="text-2xl font-bold">{seminar.maxParticipants}</div>
                <div className="text-purple-100 text-sm">Total Capacity</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 text-green-200" />
                  <Sparkles className="w-4 h-4 text-green-200" />
                </div>
                <div className="text-2xl font-bold">{seminar.maxParticipants - seminar.currentRegistrations}</div>
                <div className="text-green-100 text-sm">Spots Left</div>
              </div>
            </div>
            
            <Card className="shadow-2xl border-0 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <CardHeader className="pb-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {seminar.imageUrl && (
                    <div className="relative group">
                      <img 
                        src={seminar.imageUrl} 
                        alt={seminar.title}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover flex-shrink-0 transform group-hover:scale-105 transition-transform duration-200 shadow-lg"
                      />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                      {seminar.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md transform hover:scale-105 transition-transform duration-200 ${
                        seminar.status === 'upcoming' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                        seminar.status === 'ongoing' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
                        seminar.status === 'completed' ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white' :
                        'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      }`}>
                        {seminar.status}
                      </span>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {seminar.currentRegistrations} / {seminar.maxParticipants}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-base line-clamp-3">{seminar.description}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative z-10">
                      <Calendar className="w-8 h-8 text-blue-600 mb-3" />
                      <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">Date</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(seminar.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative z-10">
                      <Clock className="w-8 h-8 text-purple-600 mb-3" />
                      <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-1">Time</p>
                      <p className="text-lg font-bold text-gray-900">{seminar.time}</p>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-orange-100 p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-200 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative z-10">
                      <MapPin className="w-8 h-8 text-red-600 mb-3" />
                      <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-1">Location</p>
                      <p className="text-lg font-bold text-gray-900">{seminar.location}</p>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className="relative z-10">
                      <Users className="w-8 h-8 text-green-600 mb-3" />
                      <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-1">Capacity</p>
                      <p className="text-lg font-bold text-gray-900">{seminar.maxParticipants} participants</p>
                    </div>
                  </div>
                </div>

                {/* Registration Progress */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-inner">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      <span className="text-lg font-bold text-gray-900">Registration Progress</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">{Math.round(registrationPercentage)}% full</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className={`h-4 rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                          isFull ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                          registrationPercentage > 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(registrationPercentage, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">
                      <span className="text-green-600 font-bold">{seminar.currentRegistrations}</span> registered
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      <span className="text-orange-600 font-bold">{seminar.maxParticipants - seminar.currentRegistrations}</span> spots available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="shadow-2xl border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500">
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient bg-300"></div>
                <CardHeader className="bg-gradient-to-br from-gray-50 to-white pb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10 text-center">
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <Diamond className="w-10 h-10 text-white animate-pulse" />
                      </div>
                      <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl animate-ping opacity-20"></div>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent mb-3">
                      Register Now
                    </CardTitle>
                    <p className="text-gray-600 font-medium">Secure your spot today!</p>
                    
                    {/* Form Progress Indicator */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Profile Completion</span>
                        <span className="text-sm font-bold text-purple-600">{Math.round(formProgress)}%</span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${formProgress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              
                <CardContent className="p-6 relative">
                  {isFull ? (
                    <div className="text-center py-12">
                      <div className="relative inline-flex items-center justify-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
                          <Users className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl animate-ping opacity-20"></div>
                      </div>
                      <h3 className="text-3xl font-bold text-red-600 mb-4">Registration Full</h3>
                      <p className="text-gray-600 mb-6 text-lg">This seminar is fully booked. Check back for future events!</p>
                      <Button 
                        onClick={() => window.location.href = '/'}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Browse Other Events
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-bold text-gray-700 group-hover:text-purple-600 transition-colors duration-200">
                          <User className="w-4 h-4 text-indigo-600 group-hover:animate-pulse" />
                          Full Name *
                        </Label>
                        <div className="relative group">
                          <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('fullName')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Enter your full name"
                            required
                            className={`border-2 ${focusedField === 'fullName' ? 'border-purple-500 ring-4 ring-purple-200/50 scale-105' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 rounded-2xl px-4 py-4 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md`}
                          />
                          {focusedField === 'fullName' && (
                            <div className="absolute -top-8 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-lg animate-fade-in">
                              Enter your complete name
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-bold text-gray-700 group-hover:text-purple-600 transition-colors duration-200">
                          <Mail className="w-4 h-4 text-indigo-600 group-hover:animate-pulse" />
                          Email *
                        </Label>
                        <div className="relative group">
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Enter your email"
                            required
                            className={`border-2 ${focusedField === 'email' ? 'border-purple-500 ring-4 ring-purple-200/50 scale-105' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 rounded-2xl px-4 py-4 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md`}
                          />
                          {focusedField === 'email' && (
                            <div className="absolute -top-8 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-lg animate-fade-in">
                              We'll send confirmation here
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-bold text-gray-700 group-hover:text-purple-600 transition-colors duration-200">
                          <Phone className="w-4 h-4 text-indigo-600 group-hover:animate-pulse" />
                          Phone *
                        </Label>
                        <div className="relative group">
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Enter your phone number"
                            required
                            className={`border-2 ${focusedField === 'phone' ? 'border-purple-500 ring-4 ring-purple-200/50 scale-105' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 rounded-2xl px-4 py-4 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md`}
                          />
                          {focusedField === 'phone' && (
                            <div className="absolute -top-8 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-lg animate-fade-in">
                              For important updates
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="education" className="flex items-center gap-2 text-sm font-bold text-gray-700 group-hover:text-purple-600 transition-colors duration-200">
                          <BookOpen className="w-4 h-4 text-indigo-600 group-hover:animate-pulse" />
                          Education *
                        </Label>
                        <div className="relative group">
                          <Input
                            id="education"
                            name="education"
                            value={formData.education}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('education')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Your educational background"
                            required
                            className={`border-2 ${focusedField === 'education' ? 'border-purple-500 ring-4 ring-purple-200/50 scale-105' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 rounded-2xl px-4 py-4 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md`}
                          />
                          {focusedField === 'education' && (
                            <div className="absolute -top-8 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-lg animate-fade-in">
                              Tell us about your studies
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whyJoin" className="flex items-center gap-2 text-sm font-bold text-gray-700 group-hover:text-purple-600 transition-colors duration-200">
                          <Award className="w-4 h-4 text-indigo-600 group-hover:animate-pulse" />
                          Why Join? *
                        </Label>
                        <div className="relative group">
                          <Textarea
                            id="whyJoin"
                            name="whyJoin"
                            value={formData.whyJoin}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('whyJoin')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Tell us why you want to join this seminar"
                            rows={3}
                            required
                            className={`border-2 ${focusedField === 'whyJoin' ? 'border-purple-500 ring-4 ring-purple-200/50 scale-105' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 rounded-2xl px-4 py-4 transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md`}
                          />
                          {focusedField === 'whyJoin' && (
                            <div className="absolute -top-8 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-lg animate-fade-in">
                              What motivates you to join?
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experience" className="flex items-center gap-2 text-sm font-bold text-gray-700 group-hover:text-purple-600 transition-colors duration-200">
                          <Users className="w-4 h-4 text-indigo-600 group-hover:animate-pulse" />
                          Experience
                        </Label>
                        <div className="relative group">
                          <Textarea
                            id="experience"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('experience')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Any relevant experience (optional)"
                            rows={2}
                            className={`border-2 ${focusedField === 'experience' ? 'border-purple-500 ring-4 ring-purple-200/50 scale-105' : 'border-gray-200'} focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 rounded-2xl px-4 py-4 transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md`}
                          />
                          {focusedField === 'experience' && (
                            <div className="absolute -top-8 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-lg animate-fade-in">
                              Share your background (optional)
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting || !isFormValid}
                        className={`w-full font-bold py-5 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg relative overflow-hidden group ${
                          isFormValid 
                            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center gap-3">
                          {submitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Registering...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                              <span>{isFormValid ? 'Register Now' : 'Please fill all fields'}</span>
                              <Zap className={`w-5 h-5 ${isFormValid ? 'group-hover:animate-pulse' : 'text-gray-400'}`} />
                            </>
                          )}
                        </div>
                      </Button>
                      
                      <div className="text-center pt-4">
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                          <Shield className="w-3 h-3" />
                          By registering, you agree to our terms and conditions
                        </p>
                      </div>
                    </form>
                  )}
                </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
