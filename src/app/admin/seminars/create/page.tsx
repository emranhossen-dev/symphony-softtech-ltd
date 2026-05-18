"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import {
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Users,
  Link as LinkIcon
} from "lucide-react";

export default function CreateSeminarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxParticipants: "",
    imageUrl: "",
    registrationUrl: "",
    status: "UPCOMING" as const
  });

  const [previewMode, setPreviewMode] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateRegistrationUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const seminarSlug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const registrationUrl = `${baseUrl}/seminar-registration/${seminarSlug}`;
    setFormData(prev => ({
      ...prev,
      registrationUrl: registrationUrl
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/seminars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          maxParticipants: parseInt(formData.maxParticipants),
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/seminars');
      } else {
        console.error('Failed to create seminar:', result.error);
      }
    } catch (error) {
      console.error('Error creating seminar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <Button
                onClick={() => setPreviewMode(false)}
                variant="outline"
                className="mb-4 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Edit
              </Button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Seminar Preview
              </h1>
              <p className="text-gray-600 mt-2 text-lg">See how your seminar will appear to participants</p>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Eye className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Seminar Card Preview */}
        <Card className="max-w-4xl mx-auto shadow-2xl border-0 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30 ${
                      formData.status === 'UPCOMING' ? 'bg-white/20' : 'bg-gray-500/20'
                    }`}>
                      {formData.status || 'UPCOMING'}
                    </span>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Max {formData.maxParticipants || "0"} participants</span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-3 text-white drop-shadow-lg">
                    {formData.title || "Seminar Title"}
                  </h2>
                  <p className="text-white/90 text-lg leading-relaxed max-w-2xl">
                    {formData.description || "Seminar description will appear here..."}
                  </p>
                </div>
                {formData.imageUrl && (
                  <div className="ml-8">
                    <img 
                      src={formData.imageUrl} 
                      alt={formData.title}
                      className="w-32 h-32 rounded-2xl object-cover shadow-xl border-4 border-white/30"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <CardContent className="p-8 space-y-8">
            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Date</h3>
                    <p className="text-gray-700 font-medium">
                      {formData.date ? new Date(formData.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : "Date not set"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Time</h3>
                    <p className="text-gray-700 font-medium">
                      {formData.time || "Time not set"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Location</h3>
                    <p className="text-gray-700 font-medium">
                      {formData.location || "Location not set"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Capacity</h3>
                    <p className="text-gray-700 font-medium">
                      {formData.maxParticipants || "0"} Participants Max
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration URL */}
            {formData.registrationUrl && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-blue-500" />
                    Registration Link
                  </h3>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-300 flex items-center justify-between">
                  <span className="text-gray-700 font-mono text-sm truncate flex-1 mr-4">
                    {formData.registrationUrl}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(formData.registrationUrl)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setPreviewMode(false)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Continue Editing
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-lg transition-all duration-200"
              >
                Save as Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10 p-6">
        {/* Header with glassmorphism */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <Button
                onClick={() => router.push('/admin/seminars')}
                variant="outline"
                className="mb-4 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Seminars
              </Button>
              <div className="space-y-2">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Create New Seminar
                </h1>
                <p className="text-purple-200 text-lg">Organize an amazing learning experience for your audience</p>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm">
                <Calendar className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-b border-white/20">
              <CardTitle className="text-xl font-semibold text-white flex items-center gap-3">
                <div className="w-3 h-8 bg-gradient-to-b from-purple-400 to-blue-500 rounded-full shadow-lg"></div>
                Seminar Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-purple-200 font-semibold text-lg">Seminar Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter an engaging seminar title"
                    required
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-purple-300 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl shadow-lg transition-all duration-300 h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-purple-200 font-semibold text-lg">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the seminar content, objectives, and what participants will learn"
                    rows={4}
                    required
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-purple-300 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl shadow-lg transition-all duration-300 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="date" className="text-purple-200 font-semibold text-lg flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      Date *
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="bg-white/10 backdrop-blur-sm border-white/30 text-white focus:border-purple-400 focus:ring-purple-400/50 rounded-xl shadow-lg transition-all duration-300 h-12"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="time" className="text-purple-200 font-semibold text-lg flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      Time *
                    </Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="bg-white/10 backdrop-blur-sm border-white/30 text-white focus:border-purple-400 focus:ring-purple-400/50 rounded-xl shadow-lg transition-all duration-300 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="location" className="text-purple-200 font-semibold text-lg flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    Location *
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Room 101, Main Building"
                    required
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-purple-300 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl shadow-lg transition-all duration-300 h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="maxParticipants" className="text-purple-200 font-semibold text-lg flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    Max Participants *
                  </Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    placeholder="Maximum number of participants"
                    min="1"
                    required
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-purple-300 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl shadow-lg transition-all duration-300 h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="imageUrl" className="text-purple-200 font-semibold text-lg">Image URL (Optional)</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/seminar-image.jpg"
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-purple-300 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl shadow-lg transition-all duration-300 h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="registrationUrl" className="text-purple-200 font-semibold text-lg">Registration URL</Label>
                  <div className="flex gap-3">
                    <Input
                      id="registrationUrl"
                      name="registrationUrl"
                      value={formData.registrationUrl}
                      onChange={handleChange}
                      placeholder="Registration page URL"
                      className="flex-1 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-purple-300 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl shadow-lg transition-all duration-300 h-12"
                    />
                    <Button
                      type="button"
                      onClick={generateRegistrationUrl}
                      className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium px-6 rounded-xl shadow-lg transition-all duration-300"
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="status" className="text-purple-200 font-semibold text-lg">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white focus:border-purple-400 focus:ring-purple-400/50 rounded-xl shadow-lg transition-all duration-300 h-12 px-4"
                  >
                    <option value="UPCOMING" className="bg-purple-900">Upcoming</option>
                    <option value="ONGOING" className="bg-purple-900">Ongoing</option>
                    <option value="COMPLETED" className="bg-purple-900">Completed</option>
                    <option value="CANCELLED" className="bg-purple-900">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-8 border-t border-white/20">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Save className="w-6 h-6" />
                    {loading ? 'Creating...' : 'Create Seminar'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className="flex-1 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl transition-all duration-300"
                  >
                    <Eye className="w-6 h-6 mr-2" />
                    Preview
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/20">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
                <div className="w-3 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full shadow-lg"></div>
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <h4 className="font-bold mb-3 text-purple-200 flex items-center gap-3">
                  <span className="text-xl">📝</span>
                  Title Guidelines
                </h4>
                <p className="text-purple-300 leading-relaxed text-sm">
                  Make it clear and descriptive. Include the main topic and target audience.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <h4 className="font-bold mb-3 text-purple-200 flex items-center gap-3">
                  <span className="text-xl">🎯</span>
                  Description Tips
                </h4>
                <p className="text-purple-300 leading-relaxed text-sm">
                  Include learning objectives, prerequisites, and what participants will gain.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <h4 className="font-bold mb-3 text-purple-200 flex items-center gap-3">
                  <span className="text-xl">🔗</span>
                  Registration URL
                </h4>
                <p className="text-purple-300 leading-relaxed text-sm">
                  Use the "Generate" button to create a clean URL automatically.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <h4 className="font-bold mb-3 text-purple-200 flex items-center gap-3">
                  <span className="text-xl">👥</span>
                  Participant Limit
                </h4>
                <p className="text-purple-300 leading-relaxed text-sm">
                  Set a realistic limit based on venue capacity and interaction quality.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 shadow-2xl border-0 bg-white/10 backdrop-blur-xl">
            <CardHeader className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-b border-white/20">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
                <div className="w-3 h-6 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full shadow-lg"></div>
                Registration Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-xl">1</div>
                <span className="text-purple-200 font-medium">User visits registration URL</span>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-xl">2</div>
                <span className="text-purple-200 font-medium">Fills out registration form</span>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-xl">3</div>
                <span className="text-purple-200 font-medium">Receives confirmation</span>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-xl">4</div>
                <span className="text-purple-200 font-medium">Appears in admin dashboard</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
