"use client";

import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Globe, Send, Heart } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

const Footer = () => {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Successfully subscribed to newsletter!');
      setEmail("");
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    return pathname === path;
  };

  const getLinkClassName = (path: string) => {
    const baseClass = "text-gray-300 hover:text-secondary transition-default";
    const activeClass = "text-secondary font-medium";
    
    return `${baseClass} ${isActive(path) ? activeClass : ""}`;
  };
  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info with Logo */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <a href="/" className="inline-block mb-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <Image
                    src="/Logo.jpeg"
                    alt="Symphony Institute of Technology Logo"
                    width={180}
                    height={60}
                    className="h-12 w-auto object-contain filter brightness-110 contrast-125"
                  />
                </div>
              </div>
            </a>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 font-poppins">
              Symphony Institute of Technology
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Empowering professionals with industry-leading training and certification programs. 
              Build your career with our comprehensive courses and expert guidance.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-3">
              <a
                href="https://facebook.com/symphonytraining"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white/10 backdrop-blur-xl p-3 rounded-xl border border-white/20 hover:bg-purple-600/20 hover:border-purple-400/50 transition-all duration-300"
              >
                <Facebook className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://twitter.com/symphonytraining"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white/10 backdrop-blur-xl p-3 rounded-xl border border-white/20 hover:bg-purple-600/20 hover:border-purple-400/50 transition-all duration-300"
              >
                <Twitter className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://linkedin.com/company/symphonytraining"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white/10 backdrop-blur-xl p-3 rounded-xl border border-white/20 hover:bg-purple-600/20 hover:border-purple-400/50 transition-all duration-300"
              >
                <Linkedin className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://instagram.com/symphonytraining"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white/10 backdrop-blur-xl p-3 rounded-xl border border-white/20 hover:bg-purple-600/20 hover:border-purple-400/50 transition-all duration-300"
              >
                <Instagram className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white font-poppins">
                Quick Links
              </h4>
            </div>
            <ul className="space-y-3">
              <li>
                <a
                  href="/"
                  className={`flex items-center gap-2 group ${getLinkClassName("/")}`}
                >
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a
                  href="/courses"
                  className={`flex items-center gap-2 group ${getLinkClassName("/courses")}`}
                >
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>All Courses</span>
                </a>
              </li>
              <li>
                <a
                  href="/category/government"
                  className={`flex items-center gap-2 group ${getLinkClassName("/category/government")}`}
                >
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>Government Courses</span>
                </a>
              </li>
              <li>
                <a
                  href="/category/online"
                  className={`flex items-center gap-2 group ${getLinkClassName("/category/online")}`}
                >
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>Online Courses</span>
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className={`flex items-center gap-2 group ${getLinkClassName("/about")}`}
                >
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>About Us</span>
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className={`flex items-center gap-2 group ${getLinkClassName("/contact")}`}
                >
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>Contact</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white font-poppins">
                Get In Touch
              </h4>
            </div>
            <div className="space-y-4">
              <div className="group flex items-start space-x-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-purple-300 mb-1">Call Us</div>
                  <span className="text-gray-300 text-sm">01810186702</span>
                </div>
              </div>
              <div className="group flex items-start space-x-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-blue-300 mb-1">Email Us</div>
                  <span className="text-gray-300 text-sm">info@symphonyinstitute.com</span>
                </div>
              </div>
              <div className="group flex items-start space-x-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-green-300 mb-1">Visit Us</div>
                  <span className="text-gray-300 text-sm">Tridhara Tower (2nd Floor), 67 West Panthapath, Lake Circus, Kalabagan, Dhaka-1205</span>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white font-poppins">
                Newsletter
              </h4>
            </div>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              Subscribe to get the latest courses and exclusive offers delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all duration-300"
              />
              <button 
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-center lg:text-left">
              <p className="text-gray-400 text-sm mb-2">
                © 2026 Symphony Institute of Technology. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs">
                <span className="text-gray-500">Made with</span>
                <Heart className="w-3 h-3 text-red-500 fill-current" />
                <span className="text-gray-500">by</span>
                <a 
                  href="https://symphonysoftt.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300 flex items-center gap-1 group"
                >
                  <span>Symphony SoftTech Limited</span>
                  <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-300"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
