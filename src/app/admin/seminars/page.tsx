"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  Link,
  Plus,
  Eye,
  Edit,
  Trash2,
  Share,
  Copy,
  ExternalLink
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
  registrationUrl: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt: string;
  imageUrl?: string;
}

export default function SeminarsPage() {
  const router = useRouter();
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    try {
      const response = await fetch('/api/admin/seminars');
      const data = await response.json();
      if (data.success) {
        setSeminars(data.data);
      }
    } catch (error) {
      console.error('Error fetching seminars:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyRegistrationUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // You can add a toast notification here
  };

  const getRegistrationStats = (seminar: Seminar) => {
    const percentage = (seminar.currentRegistrations / seminar.maxParticipants) * 100;
    return {
      percentage: percentage.toFixed(1),
      isFull: seminar.currentRegistrations >= seminar.maxParticipants,
      available: seminar.maxParticipants - seminar.currentRegistrations
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seminar Management</h1>
          <p className="text-gray-600 mt-1">Manage seminars and track registrations</p>
        </div>
        <Button
          onClick={() => router.push('/admin/seminars/create')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Seminar
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Seminars</p>
                <p className="text-2xl font-bold">{seminars.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold">
                  {seminars.filter(s => s.status === 'upcoming').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold">
                  {seminars.reduce((sum, s) => sum + s.currentRegistrations, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Now</p>
                <p className="text-2xl font-bold">
                  {seminars.filter(s => s.status === 'ongoing').length}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seminars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seminars.map((seminar) => {
          const stats = getRegistrationStats(seminar);
          
          function setEditingSeminar(seminar: Seminar): void {
            throw new Error("Function not implemented.");
          }

          return (
            <Card key={seminar.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg line-clamp-2">{seminar.title}</h3>
                    <Badge className={`mt-2 ${getStatusColor(seminar.status)}`}>
                      {seminar.status}
                    </Badge>
                  </div>
                  {seminar.imageUrl && (
                    <img 
                      src={seminar.imageUrl} 
                      alt={seminar.title}
                      className="w-16 h-16 rounded-lg object-cover ml-3"
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-3">{seminar.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(seminar.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    {seminar.time}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {seminar.location}
                  </div>
                </div>

                {/* Registration Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Registrations</span>
                    <span className="font-medium">
                      {seminar.currentRegistrations}/{seminar.maxParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        stats.isFull ? 'bg-red-500' : 
                        parseFloat(stats.percentage) > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(parseFloat(stats.percentage), 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {stats.available} spots available
                  </p>
                </div>

                {/* Registration URL */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Link className="w-4 h-4" />
                    <span className="truncate flex-1">{seminar.registrationUrl}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyRegistrationUrl(seminar.registrationUrl)}
                      className="flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy URL
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(seminar.registrationUrl, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSeminar(seminar)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {seminars.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No seminars yet</h3>
          <p className="text-gray-600 mb-4">Create your first seminar to get started</p>
          <Button onClick={() => router.push('/admin/seminars/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Seminar
          </Button>
        </div>
      )}

      </div>
  );
}
