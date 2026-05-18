"use client";

import { Award, Code, Headphones, ShieldCheck, TrendingUp, Users, Target, Zap, Star, CheckCircle, ArrowRight } from "lucide-react";
import { getSiteConfig, getFeaturesConfig } from '@/lib/config';

const WhyChooseUsSection = () => {
  const siteConfig = getSiteConfig();
  const featuresConfig = getFeaturesConfig();

  const features = [
    {
      icon: <Award className="h-10 w-10" />,
      title: "Expert Mentors",
      description: `Learn from industry professionals with years of real-world experience at ${siteConfig.name}.`,
      stats: "50+ Experts",
      color: "primary"
    },
    {
      icon: <Code className="h-10 w-10" />,
      title: "Practical Coding",
      description: "Hands-on training with real projects that build your portfolio and prepare you for actual job challenges.",
      stats: "100+ Projects",
      color: "secondary"
    },
    {
      icon: <Headphones className="h-10 w-10" />,
      title: "Live Support",
      description: featuresConfig.enableNotifications ? "24/7 doubt clearing and mentor support to ensure you never get stuck and keep learning smoothly." : "Expert mentor support available during business hours to help you succeed.",
      stats: featuresConfig.enableNotifications ? "24/7 Available" : "Business Hours",
      color: "primary"
    },
    {
      icon: <ShieldCheck className="h-10 w-10" />,
      title: "Certification",
      description: featuresConfig.enableCertificates ? "Industry-recognized certificates that validate your skills and boost your resume for better job opportunities." : "Course completion certificates to validate your learning achievements.",
      stats: featuresConfig.enableCertificates ? "100% Valid" : "Available",
      color: "secondary"
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 glass-button px-6 py-3 rounded-full text-blue-400 mb-8">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">WHY CHOOSE US</span>
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Why Choose
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              {siteConfig.name}
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            We provide the best learning experience with comprehensive support and expert guidance at {siteConfig.name} to ensure your success
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative"
            >
              {/* Glass Card */}
              <div className="glass-card p-8 h-full hover:scale-105 transition-all duration-500">
                {/* Hover Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  feature.color === 'primary' 
                    ? 'from-blue-500/10 to-purple-500/10' 
                    : 'from-purple-500/10 to-pink-500/10'
                } rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${
                    feature.color === 'primary' 
                      ? 'from-blue-500 to-purple-600' 
                      : 'from-purple-500 to-pink-600'
                  } p-1 shadow-2xl mb-6 mx-auto group-hover:rotate-6 transition-transform duration-300`}>
                    <div className="w-full h-full glass-button rounded-2xl flex items-center justify-center">
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-4 text-center group-hover:text-blue-400 transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-6 text-center">
                    {feature.description}
                  </p>
                  
                  {/* Stats Badge */}
                  <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold mx-auto transition-all duration-300 group-hover:scale-105 ${
                    feature.color === 'primary' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                  }`}>
                    <CheckCircle className="w-4 h-4" />
                    <span>{feature.stats}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-4 px-8 py-4 glass-button rounded-full text-blue-400 font-semibold border-2 border-blue-500/50 hover:border-blue-400 transition-all duration-300 hover:scale-105 cursor-pointer">
            <Target className="w-5 h-5" />
            <span>Start Your Journey Today</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-gray-400 mt-4">Join thousands of successful students</p>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
