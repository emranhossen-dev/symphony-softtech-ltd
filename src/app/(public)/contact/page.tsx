"use client";

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Building, Users, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    courseInterest: 'general'
  });
  const [loading, setLoading] = useState(false);

  const courses = [
    'General Inquiry',
    'Government Courses',
    'Online Live Courses',
    'Offline Classes',
    'Recorded Courses',
    'Live Classes Support',
    'Payment Issues',
    'Technical Support'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        courseInterest: 'general'
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-blue-100">
              Get in touch with us for any questions, support, or course information
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                      <p className="text-gray-600">01810186702</p>
                      <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">info@symphonyinstitute.com</p>
                      <p className="text-sm text-gray-500">24/7 Support</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Office Address</h3>
                      <p className="text-gray-600">
                        Tridhara Tower (2nd Floor)<br />
                        67 West Panthapath, Lake Circus<br />
                        Kalabagan, Dhaka-1205<br />
                        Bangladesh
                      </p>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Office Hours</h3>
                      <p className="text-gray-600">
                        Monday - Friday: 9AM - 6PM<br />
                        Saturday: 10AM - 4PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">5000+ Happy Students</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">95% Success Rate</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">5 Training Centers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    <span className="text-gray-700">24/7 Student Support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    {/* Course Interest */}
                    <div>
                      <label htmlFor="courseInterest" className="block text-sm font-medium text-gray-700 mb-2">
                        Course Interest
                      </label>
                      <select
                        id="courseInterest"
                        name="courseInterest"
                        value={formData.courseInterest}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {courses.map(course => (
                          <option key={course} value={course.toLowerCase().replace(' ', '-')}>
                            {course}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>

                {/* FAQ Links */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="/faq" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      General FAQ
                    </a>
                    <a href="/courses" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Course Information
                    </a>
                    <a href="/payment-info" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Payment & Refunds
                    </a>
                    <a href="/support" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Student Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Us</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Google Map Embed */}
                <div className="h-96 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.3766789012345!2d90.3815!3d23.7525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b000000001%3A0x0!2sTridhara+Tower%2C+West+Panthapath%2C+Dhaka!5e0!3m2!1sen!2sbd!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

                {/* Locations List */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Our Training Centers</h3>

                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-600 pl-4">
                      <h4 className="font-semibold text-gray-900">Dhaka Center (Head Office)</h4>
                      <p className="text-gray-600">Tridhara Tower (2nd Floor), 67 West Panthapath, Lake Circus, Kalabagan, Dhaka-1205</p>
                      <p className="text-sm text-gray-500">Phone: 01810186702</p>
                    </div>

                    <div className="border-l-4 border-green-600 pl-4">
                      <h4 className="font-semibold text-gray-900">Delhi Center</h4>
                      <p className="text-gray-600">Connaught Place, New Delhi, India</p>
                      <p className="text-sm text-gray-500">Phone: Coming Soon</p>
                    </div>

                    <div className="border-l-4 border-purple-600 pl-4">
                      <h4 className="font-semibold text-gray-900">Mumbai Center</h4>
                      <p className="text-gray-600">Andheri West, Mumbai, India</p>
                      <p className="text-sm text-gray-500">Phone: Coming Soon</p>
                    </div>

                    <div className="border-l-4 border-orange-600 pl-4">
                      <h4 className="font-semibold text-gray-900">Chennai Center</h4>
                      <p className="text-gray-600">T. Nagar, Chennai, India</p>
                      <p className="text-sm text-gray-500">Phone: Coming Soon</p>
                    </div>

                    <div className="border-l-4 border-red-600 pl-4">
                      <h4 className="font-semibold text-gray-900">Kolkata Center</h4>
                      <p className="text-gray-600">Salt Lake, Kolkata, India</p>
                      <p className="text-sm text-gray-500">Phone: Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
