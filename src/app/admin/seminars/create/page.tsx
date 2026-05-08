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
    status: "upcoming" as const
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
      <div className="p-6">
        <div className="mb-6">
          <Button
            onClick={() => setPreviewMode(false)}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Edit
          </Button>
          <h1 className="text-3xl font-bold">Seminar Preview</h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{formData.title || "Seminar Title"}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${
                  formData.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {formData.status}
                </span>
              </div>
              {formData.imageUrl && (
                <img 
                  src={formData.imageUrl} 
                  alt={formData.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-600">{formData.description || "Seminar description will appear here..."}</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span>{formData.date || "Date not set"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <span>{formData.time || "Time not set"}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>{formData.location || "Location not set"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-500" />
                <span>Max {formData.maxParticipants || "0"} participants</span>
              </div>
            </div>

            {formData.registrationUrl && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Registration Link:</h3>
                <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-sm truncate flex-1">{formData.registrationUrl}</span>
                  <Button
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(formData.registrationUrl)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header with gradient background */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <Button
              onClick={() => router.push('/admin/seminars')}
              variant="outline"
              className="mb-4 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Seminars
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create New Seminar
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Organize an amazing learning experience for your audience</p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                Seminar Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700 font-medium">Seminar Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter an engaging seminar title"
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700 font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the seminar content, objectives, and what participants will learn"
                    rows={4}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm transition-all duration-200 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-gray-700 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      Date *
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-gray-700 font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      Time *
                    </Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-700 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    Location *
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Room 101, Main Building"
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants" className="text-gray-700 font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
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
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm transition-all duration-200"
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/seminar-image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="registrationUrl">Registration URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="registrationUrl"
                      name="registrationUrl"
                      value={formData.registrationUrl}
                      onChange={handleChange}
                      placeholder="Registration page URL"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRegistrationUrl}
                      disabled={!formData.title}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Click "Generate" to auto-create a registration URL based on the title
                  </p>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-8 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Creating...' : 'Create Seminar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreviewMode(true)}
                    className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium px-6 py-3 rounded-lg transition-all duration-200"
                  >
                    <Eye className="w-5 h-5" />
                    Preview
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <div className="lg:col-span-1">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-5 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  Title Guidelines
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Make it clear and descriptive. Include the main topic and target audience.
                </p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  Description Tips
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Include learning objectives, prerequisites, and what participants will gain.
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <span className="text-lg">🔗</span>
                  Registration URL
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Use the "Generate" button to create a clean URL automatically.
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  Participant Limit
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Set a realistic limit based on venue capacity and interaction quality.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-5 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full"></div>
                Registration Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">1</div>
                <span className="text-gray-800 font-medium">User visits registration URL</span>
              </div>
              <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">2</div>
                <span className="text-gray-800 font-medium">Fills out registration form</span>
              </div>
              <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">3</div>
                <span className="text-gray-800 font-medium">Receives confirmation</span>
              </div>
              <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">4</div>
                <span className="text-gray-800 font-medium">Appears in admin dashboard</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
