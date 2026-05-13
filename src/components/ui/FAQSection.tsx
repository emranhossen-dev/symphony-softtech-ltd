"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, Phone, Mail, Sparkles, Star, Zap, Shield, Users, BookOpen, Award } from "lucide-react";
import { getSiteConfig, getFeaturesConfig, getContactInfo } from '@/lib/config';

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const siteConfig = getSiteConfig();
  const featuresConfig = getFeaturesConfig();
  const contactInfo = getContactInfo();

  const faqs = [
    {
      question: "What are the admission requirements for your courses?",
      answer: `Our courses at ${siteConfig.name} are designed for learners of all levels. For beginner courses, no prior experience is needed. For advanced courses, we recommend basic programming knowledge. You can check specific requirements on each course page.`,
      icon: <BookOpen className="h-5 w-5" />,
      category: "Admissions",
      color: "from-blue-500 to-cyan-500"
    },
    {
      question: "Do you provide job placement assistance?",
      answer: `Yes! We offer comprehensive career support including resume building, interview preparation, portfolio development, and job placement assistance. We have partnerships with leading tech companies to help ${siteConfig.name} graduates succeed.`,
      icon: <Award className="h-5 w-5" />,
      category: "Career Support",
      color: "from-purple-500 to-pink-500"
    },
    {
      question: "Can I switch between different batch types?",
      answer: `Absolutely! We understand that circumstances change. You can request a batch transfer within the first week of your course at ${siteConfig.name}, subject to availability. Our team will help you find the best fit for your schedule.`,
      icon: <Users className="h-5 w-5" />,
      category: "Flexibility",
      color: "from-green-500 to-emerald-500"
    },
    {
      question: "What payment options are available?",
      answer: featuresConfig.enablePayments ? `We offer flexible payment options including one-time payment, EMI plans, and scholarship opportunities for deserving candidates at ${siteConfig.name}. We also provide early bird discounts for early enrollments.` : `Please contact our admissions team at ${contactInfo.email} or call ${contactInfo.phone} for payment information.`,
      icon: <Shield className="h-5 w-5" />,
      category: "Payments",
      color: "from-orange-500 to-red-500"
    },
    {
      question: "How long do I have access to course materials?",
      answer: featuresConfig.enableRecordedCourses ? `For recorded courses at ${siteConfig.name}, you get lifetime access to all materials. For live batches, you have access for 6 months after course completion. We also provide regular content updates.` : `For live batches at ${siteConfig.name}, you have access for 6 months after course completion. We also provide regular content updates.`,
      icon: <Sparkles className="h-5 w-5" />,
      category: "Access",
      color: "from-indigo-500 to-purple-500"
    },
    {
      question: "Do you offer certificates upon completion?",
      answer: featuresConfig.enableCertificates ? `Yes, all our courses at ${siteConfig.name} come with industry-recognized certificates that are valued by employers and can be shared on LinkedIn and other professional platforms.` : `Course completion certificates are available for all courses at ${siteConfig.name}.`,
      icon: <Star className="h-5 w-5" />,
      category: "Certificates",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
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
            <HelpCircle className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">FAQ</span>
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Frequently Asked
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Questions
            </span>
          </h2>
          
          <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
            Got questions? We've got answers. Find everything you need to know about our training programs.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-enhanced ${
                  activeIndex === index ? 'faq-enhanced-active' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="faq-button-enhanced"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Enhanced Icon with gradient background */}
                    <div className={`icon-enhanced ${
                      activeIndex === index 
                        ? 'icon-enhanced-active' 
                        : ''
                    }`} style={{
                      background: activeIndex === index 
                        ? `linear-gradient(135deg, ${faq.color})`
                        : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
                    }}>
                      <div className={`${
                        activeIndex === index ? 'text-white' : 'text-blue-300'
                      }`}>
                        {faq.icon}
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    <div className="hidden md:block">
                      <span className="text-xs font-bold text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full border border-blue-400/30">
                        {faq.category}
                      </span>
                    </div>
                    
                    {/* Question */}
                    <h3 className="text-lg md:text-xl font-semibold text-white font-poppins pr-4 leading-tight">
                      {faq.question}
                    </h3>
                  </div>
                  
                  {/* Enhanced Toggle button */}
                  <div className={`faq-chevron-enhanced ${
                    activeIndex === index ? 'faq-chevron-active' : ''
                  }`}>
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>
                
                {/* Enhanced Answer with animation */}
                <div
                  className={`overflow-hidden transition-all duration-700 ease-in-out ${
                    activeIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-8 pb-6">
                    <div className="pl-16">
                      <p className="text-white/80 leading-relaxed text-lg">
                        {faq.answer}
                      </p>
                      
                      {/* Enhanced help links */}
                      {activeIndex === index && (
                        <div className="mt-6 flex items-center gap-4">
                          <button className="enhanced-help-btn">
                            <Sparkles className="inline-block mr-2 h-4 w-4" />
                            Learn more
                          </button>
                          <button className="enhanced-help-btn">
                            <MessageCircle className="inline-block mr-2 h-4 w-4" />
                            Contact support
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Help Section */}
          <div className="mt-20">
            <div className="enhanced-help-card">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 enhanced-icon-glow">
                  <HelpCircle className="h-12 w-12 text-white" />
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Still have
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    questions?
                  </span>
                </h3>
                <p className="text-xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed">
                  Our support team is here to help you with any queries you might have about our programs, admission process, or career guidance.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
                  <button className="enhanced-primary-btn">
                    <MessageCircle className="inline-block mr-3 h-5 w-5" />
                    Live Chat Support
                  </button>
                  <button className="enhanced-secondary-btn">
                    <Phone className="inline-block mr-3 h-5 w-5" />
                    Call Us Now
                  </button>
                </div>

                {/* Enhanced Contact info */}
                <div className="flex flex-wrap justify-center gap-10 text-white/60">
                  <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-blue-400 font-semibold">Email</div>
                      <div className="font-medium text-white">support@symphonyinstitute.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-blue-400 font-semibold">Phone</div>
                      <div className="font-medium text-white">+1 (555) 123-4567</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-blue-400 font-semibold">Availability</div>
                      <div className="font-medium text-white">24/7 Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
