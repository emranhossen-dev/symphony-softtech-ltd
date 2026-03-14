"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Clock, 
  Globe,
  CheckCircle,
  Star,
  Heart,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react';

export default function AboutPage() {
  const [stats, setStats] = useState({
    students: 5000,
    courses: 150,
    instructors: 50,
    successRate: 95
  });

  const [animatedStats, setAnimatedStats] = useState({
    students: 0,
    courses: 0,
    instructors: 0,
    successRate: 0
  });

  useEffect(() => {
    // Animate stats on mount
    const duration = 2000;
    const steps = 60;
    const increment = {
      students: stats.students / steps,
      courses: stats.courses / steps,
      instructors: stats.instructors / steps,
      successRate: stats.successRate / steps
    };

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedStats({
        students: Math.min(Math.floor(increment.students * currentStep), stats.students),
        courses: Math.min(Math.floor(increment.courses * currentStep), stats.courses),
        instructors: Math.min(Math.floor(increment.instructors * currentStep), stats.instructors),
        successRate: Math.min(Math.floor(increment.successRate * currentStep), stats.successRate)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from curriculum design to student support."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Passion",
      description: "Our passion for education drives us to create impactful learning experiences."
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "We embrace innovative teaching methods and cutting-edge technology."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Integrity",
      description: "We operate with transparency and honesty in all our interactions."
    }
  ];

  const milestones = [
    {
      year: "2015",
      title: "Foundation",
      description: "Started with a small batch of 20 students and 2 courses."
    },
    {
      year: "2018",
      title: "Expansion",
      description: "Opened our second training center and expanded to 50+ courses."
    },
    {
      year: "2020",
      title: "Digital Transformation",
      description: "Launched online learning platform during the pandemic."
    },
    {
      year: "2023",
      title: "Excellence",
      description: "Reached 5000+ students with 95% success rate."
    }
  ];

  const team = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Founder & CEO",
      image: "👨‍💼",
      description: "20+ years of experience in education and technology."
    },
    {
      name: "Prof. Sunita Sharma",
      role: "Academic Director",
      image: "👩‍🏫",
      description: "Expert in curriculum design and educational psychology."
    },
    {
      name: "Amit Patel",
      role: "Operations Head",
      image: "👨‍💻",
      description: "Manages all training centers and student services."
    },
    {
      name: "Dr. Anjali Singh",
      role: "Lead Instructor",
      image: "👩‍🔬",
      description: "Specializes in data science and machine learning."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About <span className="text-yellow-300">Symphony Institute of Technology</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Empowering students with quality education and practical skills since 2015. 
              We are committed to transforming lives through innovative learning experiences.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Award className="w-5 h-5" />
                <span>ISO Certified</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Users className="w-5 h-5" />
                <span>5000+ Students</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Globe className="w-5 h-5" />
                <span>5 Centers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {animatedStats.students.toLocaleString()}+
              </div>
              <div className="text-gray-600">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {animatedStats.courses}+
              </div>
              <div className="text-gray-600">Courses</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {animatedStats.instructors}+
              </div>
              <div className="text-gray-600">Expert Instructors</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {animatedStats.successRate}%
              </div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-xl text-gray-600">
                From a small classroom to a leading education platform
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  SSL Training Centre began its journey in 2015 with a simple mission: to provide quality education 
                  that prepares students for real-world challenges. What started as a small classroom with just 
                  20 students has now grown into a comprehensive education platform serving over 5000 students 
                  across multiple cities.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Our commitment to excellence has been the driving force behind our growth. We've continuously 
                  evolved our teaching methodologies, embraced technology, and expanded our course offerings to 
                  meet the changing demands of the industry.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Today, we stand as a beacon of quality education, with a 95% success rate and thousands of 
                  success stories. Our journey is a testament to the power of dedicated education and the 
                  incredible potential of our students.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">
              Key milestones in our growth story
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
              
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center mb-8 ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8 order-1'}`}>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="text-blue-600 font-bold text-lg mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">
              The passionate people behind our success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-6xl">{member.image}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose SSL Training Centre?</h2>
              <p className="text-xl text-gray-600">
                What makes us different from others
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry-Relevant Curriculum</h3>
                  <p className="text-gray-600">Our courses are designed in collaboration with industry experts to ensure you learn the most in-demand skills.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Instructors</h3>
                  <p className="text-gray-600">Learn from industry veterans with years of real-world experience and teaching expertise.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Hands-on Training</h3>
                  <p className="text-gray-600">Get practical experience with real projects and case studies that prepare you for the workplace.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Lifetime Support</h3>
                  <p className="text-gray-600">We provide continuous support even after course completion to help you succeed in your career.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have transformed their careers with our courses
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/courses'}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Explore Courses
            </button>
            <button
              onClick={() => window.location.href = '/contact'}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
