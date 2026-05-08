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
    <div className="p-6">
      <div className="mb-6">
        <Button
          onClick={() => router.push('/admin/seminars')}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Seminars
        </Button>
        <h1 className="text-3xl font-bold">Create New Seminar</h1>
        <p className="text-gray-600 mt-1">Fill in the details to create a new seminar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Seminar Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Seminar Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter seminar title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the seminar content, objectives, and what participants will learn"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Room 101, Main Building"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="maxParticipants">Max Participants *</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    placeholder="Maximum number of participants"
                    min="1"
                    required
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

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Creating...' : 'Create Seminar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreviewMode(true)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">📝 Title Guidelines</h4>
                <p className="text-sm text-gray-600">
                  Make it clear and descriptive. Include the main topic and target audience.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">🎯 Description Tips</h4>
                <p className="text-sm text-gray-600">
                  Include learning objectives, prerequisites, and what participants will gain.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🔗 Registration URL</h4>
                <p className="text-sm text-gray-600">
                  Use the "Generate" button to create a clean URL automatically.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">👥 Participant Limit</h4>
                <p className="text-sm text-gray-600">
                  Set a realistic limit based on venue capacity and interaction quality.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Registration Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <span className="text-sm">User visits registration URL</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <span className="text-sm">Fills out registration form</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <span className="text-sm">Receives confirmation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                <span className="text-sm">Appears in admin dashboard</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
