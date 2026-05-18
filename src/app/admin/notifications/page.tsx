"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { toast } from 'react-hot-toast';
import { 
  Bell, 
  Send, 
  Trash2, 
  Search, 
  RefreshCw,
  Eye,
  Users,
  Mail,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  targetAudience: 'ALL' | 'STUDENTS' | 'MENTORS' | 'ADMIN';
  recipients?: string[];
  isRead: boolean;
  sentAt?: string;
  createdAt: string;
  createdBy: string;
}

interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  sentNotifications: number;
  draftNotifications: number;
}

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    totalNotifications: 0,
    unreadNotifications: 0,
    sentNotifications: 0,
    draftNotifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAudience, setFilterAudience] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notifications');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setStats(data.stats);
      } else {
        toast.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/send`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast.success('Notification sent successfully');
        fetchNotifications();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Notification deleted successfully');
        fetchNotifications();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INFO': return <Mail className="w-4 h-4 text-blue-600" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'ERROR': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INFO': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'WARNING': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'ERROR': return 'bg-red-50 text-red-700 border-red-200';
      case 'SUCCESS': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'ALL': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'STUDENTS': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'MENTORS': return 'bg-green-50 text-green-700 border-green-200';
      case 'ADMIN': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesAudience = filterAudience === 'all' || notification.targetAudience === filterAudience;
    
    return matchesSearch && matchesType && matchesAudience;
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Notification Management</h1>
              <p className="text-sm text-gray-300 mt-1">Send and manage system notifications</p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total Notifications</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.totalNotifications}</p>
                </div>
                <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Unread</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.unreadNotifications}</p>
                </div>
                <div className="w-12 h-12 bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Sent</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.sentNotifications}</p>
                </div>
                <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.draftNotifications}</p>
                </div>
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              >
                <option value="all">All Types</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
                <option value="SUCCESS">Success</option>
              </select>

              <select
                value={filterAudience}
                onChange={(e) => setFilterAudience(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              >
                <option value="all">All Audiences</option>
                <option value="ALL">All Users</option>
                <option value="STUDENTS">Students</option>
                <option value="MENTORS">Mentors</option>
                <option value="ADMIN">Admin</option>
              </select>

              <Button 
                onClick={fetchNotifications}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Table */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-900">Notification</TableHead>
                  <TableHead className="text-gray-900">Type</TableHead>
                  <TableHead className="text-gray-900">Audience</TableHead>
                  <TableHead className="text-gray-900">Status</TableHead>
                  <TableHead className="text-gray-900">Created</TableHead>
                  <TableHead className="text-gray-900">Created By</TableHead>
                  <TableHead className="text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    </TableCell>
                  </TableRow>
                ) : filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No notifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((notification) => (
                    <TableRow key={notification.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{notification.title}</div>
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {notification.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(notification.type)}
                          <Badge className={getTypeColor(notification.type)}>
                            {notification.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAudienceColor(notification.targetAudience)}>
                          {notification.targetAudience}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {notification.sentAt ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">Sent</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Draft</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {notification.createdBy}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!notification.sentAt && (
                            <Button
                              size="sm"
                              onClick={() => handleSendNotification(notification.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Notification</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Enter notification message"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="INFO">Info</option>
                    <option value="WARNING">Warning</option>
                    <option value="ERROR">Error</option>
                    <option value="SUCCESS">Success</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="ALL">All Users</option>
                    <option value="STUDENTS">Students</option>
                    <option value="MENTORS">Mentors</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Send Notification
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
