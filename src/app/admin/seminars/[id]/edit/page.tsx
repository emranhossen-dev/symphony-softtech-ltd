"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
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

export default function EditSeminarPage() {
  const router = useRouter();
  const params = useParams();
  const seminarId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    fetchSeminar();
  }, [seminarId]);

  const fetchSeminar = async () => {
    try {
      const response = await fetch(`/api/admin/seminars/${seminarId}`);
      const data = await response.json();
      
      if (data.success) {
        const seminar = data.data;
        setFormData({
          title: seminar.title,
          description: seminar.description,
          date: new Date(seminar.date).toISOString().split('T')[0],
          time: seminar.time,
          location: seminar.location,
          maxParticipants: seminar.maxParticipants.toString(),
          imageUrl: seminar.imageUrl || "",
          registrationUrl: seminar.registrationUrl,
          status: seminar.status
        });
      } else {
        console.error('Failed to fetch seminar:', data.error);
      }
    } catch (error) {
      console.error('Error fetching seminar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/seminars/${seminarId}`, {
        method: 'PUT',
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
        console.error('Failed to update seminar:', result.error);
      }
    } catch (error) {
      console.error('Error updating seminar:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading seminar details...</div>
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
                className="mb-4 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Seminars
              </Button>
              <div className="space-y-2">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Edit Seminar
                </h1>
                <p className="text-purple-200 text-lg">Update seminar information</p>
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
              <CardHeader className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-b border-white/20">
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-3">
                  <div className="w-3 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full shadow-lg"></div>
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
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Save className="w-6 h-6" />
                      {saving ? 'Updating...' : 'Update Seminar'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => router.push('/admin/seminars')}
                      className="flex-1 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
