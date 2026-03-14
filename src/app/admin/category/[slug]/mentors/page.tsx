"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft,
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Award,
  Calendar,
  Edit,
  Trash2,
  UserPlus,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  expertise: string[];
  rating: number;
  totalStudents: number;
  totalRevenue: number;
  isActive: boolean;
  joinedAt: string;
  courses: Array<{
    id: string;
    title: string;
    students: number;
  }>;
}

const MentorsPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMentor, setShowAddMentor] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const openDetailsModal = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedMentor(null);
    setShowDetailsModal(false);
  };

  useEffect(() => {
    fetchMentors();
  }, [slug]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/categories/${slug}/mentors`);
      const data = await response.json();
      
      if (data.success) {
        setMentors(data.mentors);
      } else {
        toast.error(data.error || 'Failed to fetch mentors');
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Failed to fetch mentors');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (slug: string) => {
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && mentor.isActive) ||
                         (filterStatus === 'inactive' && !mentor.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleToggleStatus = async (mentorId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/mentors/${mentorId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Mentor ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchMentors();
      } else {
        toast.error(data.error || 'Failed to update mentor status');
      }
    } catch (error) {
      console.error('Error updating mentor status:', error);
      toast.error('Failed to update mentor status');
    }
  };

  const handleDeleteMentor = async (mentorId: string) => {
    if (!confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/mentors/${mentorId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Mentor deleted successfully');
        fetchMentors();
      } else {
        toast.error(data.error || 'Failed to delete mentor');
      }
    } catch (error) {
      console.error('Error deleting mentor:', error);
      toast.error('Failed to delete mentor');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/category/${slug}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to {getCategoryName(slug)}
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mentors</h1>
                <p className="text-gray-600">
                  {getCategoryName(slug)} Category • {mentors.length} total mentors
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowAddMentor(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="w-4 h-4" />
              Add Mentor
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mentors..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
              >
                <option value="all">All Mentors</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">
                  {mentors.filter(m => m.isActive).length} Active
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">
                  {mentors.filter(m => !m.isActive).length} Inactive
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="max-w-7xl mx-auto p-6">
        {filteredMentors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first mentor'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowAddMentor(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="w-4 h-4" />
                Add First Mentor
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{mentor.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {mentor.email}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      mentor.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {mentor.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Rating and Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{mentor.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-gray-600">
                      {mentor.totalStudents} students
                    </div>
                  </div>

                  {/* Expertise */}
                  {mentor.expertise.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Expertise</p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {mentor.expertise.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                            +{mentor.expertise.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Revenue */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-medium text-green-600">
                      ৳{mentor.totalRevenue.toLocaleString()}
                    </span>
                  </div>

                  {/* Courses */}
                  {mentor.courses.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Courses ({mentor.courses.length})
                      </p>
                      <div className="space-y-1">
                        {mentor.courses.slice(0, 2).map((course) => (
                          <div key={course.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 truncate">{course.title}</span>
                            <span className="text-gray-500">{course.students} students</span>
                          </div>
                        ))}
                        {mentor.courses.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{mentor.courses.length - 2} more courses
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailsModal(mentor)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/mentors/${mentor.id}`)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(mentor.id, mentor.isActive)}
                      className={`flex items-center gap-1 ${
                        mentor.isActive 
                          ? 'text-orange-600 hover:text-orange-700' 
                          : 'text-green-600 hover:text-green-700'
                      }`}
                    >
                      {mentor.isActive ? (
                        <>
                          <XCircle className="w-3 h-3" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Activate
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMentor(mentor.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Mentor Modal - Placeholder */}
      {showAddMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Mentor</h3>
            <p className="text-gray-600 mb-6">
              This feature is coming soon. For now, please use the main mentors page to add new mentors.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddMentor(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => router.push('/admin/mentors/add')}
                className="bg-green-600 hover:bg-green-700"
              >
                Go to Add Mentor
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mentor Details Modal */}
      {showDetailsModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Mentor Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={closeDetailsModal}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium">{selectedMentor.name}</h4>
                  <p className="text-gray-600">{selectedMentor.email}</p>
                  {selectedMentor.phone && (
                    <p className="text-gray-600">{selectedMentor.phone}</p>
                  )}
                </div>
              </div>
              
              {/* Bio */}
              {selectedMentor.bio && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Biography</h5>
                  <p className="text-gray-600">{selectedMentor.bio}</p>
                </div>
              )}
              
              {/* Expertise */}
              {selectedMentor.expertise.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Expertise</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentor.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-xl font-bold">{selectedMentor.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold mb-2">{selectedMentor.totalStudents}</div>
                  <p className="text-sm text-gray-600">Students</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold mb-2">{selectedMentor.courses.length}</div>
                  <p className="text-sm text-gray-600">Courses</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold mb-2 text-green-600">
                    ৳{selectedMentor.totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>
              </div>
              
              {/* Courses */}
              {selectedMentor.courses.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Courses</h5>
                  <div className="space-y-2">
                    {selectedMentor.courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h6 className="font-medium">{course.title}</h6>
                          <p className="text-sm text-gray-600">Course ID: {course.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{course.students} students</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Status</h5>
                  <p className="text-sm text-gray-600">Account Status</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedMentor.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedMentor.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              {/* Joined Date */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Joined Date</h5>
                  <p className="text-sm text-gray-600">When mentor joined</p>
                </div>
                <div className="text-sm">
                  {new Date(selectedMentor.joinedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={closeDetailsModal}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  closeDetailsModal();
                  router.push(`/admin/mentors/${selectedMentor.id}`);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Edit Mentor
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorsPage;
