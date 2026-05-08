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
  Award
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

  useEffect(() => {
    fetchSeminar();
  }, [slug]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading seminar details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Button 
            onClick={() => window.history.back()}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for registering for "{seminar?.title}". We'll send you a confirmation email soon.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!seminar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Seminar not found</div>
      </div>
    );
  }

  const isFull = seminar.currentRegistrations >= seminar.maxParticipants;
  const registrationPercentage = (seminar.currentRegistrations / seminar.maxParticipants) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Button
              onClick={() => window.location.href = '/'}
              variant="ghost"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-2 sm:px-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Seminar Registration</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Seminar Details */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {seminar.imageUrl && (
                    <img 
                      src={seminar.imageUrl} 
                      alt={seminar.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      {seminar.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        seminar.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        seminar.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        seminar.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {seminar.status}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {seminar.currentRegistrations} / {seminar.maxParticipants} registered
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base line-clamp-3">{seminar.description}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(seminar.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium text-gray-900">{seminar.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{seminar.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-medium text-gray-900">{seminar.maxParticipants} participants</p>
                    </div>
                  </div>
                </div>

                {/* Registration Progress */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Registration Progress</span>
                    <span className="text-sm text-gray-500">{Math.round(registrationPercentage)}% full</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isFull ? 'bg-red-500' : 
                        registrationPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(registrationPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {seminar.maxParticipants - seminar.currentRegistrations} spots available
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Register Now
                </CardTitle>
                <p className="text-gray-600">Fill in your details to register</p>
              </CardHeader>
              
              <CardContent>
                {isFull ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Registration Full</h3>
                    <p className="text-gray-600">This seminar is fully booked. Check back for future events!</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Education *
                      </Label>
                      <Input
                        id="education"
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        placeholder="Your educational background"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whyJoin" className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Why Join? *
                      </Label>
                      <Textarea
                        id="whyJoin"
                        name="whyJoin"
                        value={formData.whyJoin}
                        onChange={handleChange}
                        placeholder="Tell us why you want to join this seminar"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Experience
                      </Label>
                      <Textarea
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="Any relevant experience (optional)"
                        rows={2}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? 'Registering...' : 'Register Now'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
