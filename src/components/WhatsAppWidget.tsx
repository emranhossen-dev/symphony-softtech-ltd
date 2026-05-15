"use client";

import { useState } from 'react';
import { MessageCircle, X, Send, User, Phone, Mail, Clock, CheckCircle } from 'lucide-react';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
        
        // Show success notification
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        
        // Close widget after success
        setTimeout(() => setIsOpen(false), 1500);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-right-5 duration-300">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Message sent successfully!</span>
        </div>
      )}

      {/* WhatsApp Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Chat Window */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Symphony Institute</h3>
                    <p className="text-xs text-emerald-100 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      We'll respond within minutes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="bg-gradient-to-b from-emerald-50 to-white p-3 border-b border-gray-100">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-3 h-3 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-800 leading-relaxed">
                    👋 Welcome! Fill in the form below and we'll get back to you instantly via WhatsApp.
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Clock className="w-2 h-2" />
                    <span>Just now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-700 mb-2">Your Details</p>
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name *"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white shadow-sm"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email *"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white shadow-sm"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your Phone (WhatsApp) *"
                    required
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white shadow-sm"
                  />
                </div>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you? *"
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none bg-white shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2.5 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-emerald-500/25"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium text-sm">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="font-medium text-sm">Send via WhatsApp</span>
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                We'll reply directly to your WhatsApp
              </p>
            </form>
          </div>
        )}

        {/* WhatsApp Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        >
          <MessageCircle className="w-6 h-6 text-white" />

          {/* Pulse Animation */}
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20"></span>
          
          {/* Badge */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            1
          </span>
        </button>

        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat with us!
        </div>
      </div>
    </>
  );
};

export default WhatsAppWidget;
