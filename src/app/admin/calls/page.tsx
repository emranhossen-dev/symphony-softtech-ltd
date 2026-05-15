"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { toast } from 'react-hot-toast';
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Play, 
  Pause, 
  Download, 
  Search, 
  RefreshCw,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Mic,
  MicOff,
  Edit,
  Trash2,
  Filter as FilterIcon,
  X,
  FileAudio,
  Activity,
  CheckCircle,
  XCircle,
  BarChart3,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  MapPin,
  Star,
  MoreHorizontal,
  ChevronDown,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Users,
  TrendingDown
} from 'lucide-react';
import { getAuthHeaders, handleAuthError } from '@/lib/auth-helper';
import { useRouter } from 'next/navigation';

interface CallRecord {
  id: string;
  type: 'incoming' | 'outgoing';
  status: 'completed' | 'missed' | 'ongoing';
  callerName: string;
  calleeName: string;
  phoneNumber: string;
  duration: number;
  recordingUrl?: string;
  transcript?: string;
  notes?: string;
  cost: number;
  revenue: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CallStats {
  totalCalls: number;
  incomingCalls: number;
  outgoingCalls: number;
  totalDuration: number;
  totalCost: number;
  totalRevenue: number;
}

export default function CallManagementPage() {
  const router = useRouter();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallRecord[]>([]);
  const [stats, setStats] = useState<CallStats>({
    totalCalls: 0,
    incomingCalls: 0,
    outgoingCalls: 0,
    totalDuration: 0,
    totalCost: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'missed' | 'ongoing'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);

  useEffect(() => {
    fetchCalls();
  }, []);

  useEffect(() => {
    filterCalls();
  }, [calls, searchTerm, filterType, filterStatus]);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/calls', {
        headers: getAuthHeaders()
      });
      
      if (response.status === 401) {
        handleAuthError(router);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setCalls(data.data);
        setStats(data.stats);
      } else {
        toast.error('Failed to fetch calls');
      }
    } catch (error) {
      console.error('Error fetching calls:', error);
      toast.error('Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  };

  const filterCalls = () => {
    let filtered = [...calls];
    
    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(call =>
        call.callerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.calleeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.phoneNumber.includes(searchTerm) ||
        (call.notes && call.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(call => call.type === filterType);
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(call => call.status === filterStatus);
    }
    
    setFilteredCalls(filtered);
  };

  const handlePlayRecording = (callId: string) => {
    if (playingRecording === callId) {
      setPlayingRecording(null);
    } else {
      setPlayingRecording(callId);
      // In real implementation, play audio from recordingUrl
      toast('Playing recording...');
    }
  };

  const handleEditCall = (call: CallRecord) => {
    setSelectedCall(call);
    setShowEditModal(true);
  };

  const handleDeleteCall = (call: CallRecord) => {
    setSelectedCall(call);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCall) return;

    setActionLoading({ [selectedCall.id]: true });
    try {
      const response = await fetch(`/api/admin/calls/${selectedCall.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Call record deleted successfully');
        setShowDeleteModal(false);
        setSelectedCall(null);
        fetchCalls();
      } else {
        toast.error(data.error || 'Failed to delete call');
      }
    } catch (error) {
      console.error('Error deleting call:', error);
      toast.error('Failed to delete call');
    } finally {
      setActionLoading({ [selectedCall.id]: false });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-50 text-green-700 border-green-200',
      missed: 'bg-red-50 text-red-700 border-red-200',
      ongoing: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getTypeIcon = (type: string) => {
    return type === 'incoming' ? <PhoneIncoming className="w-4 h-4" /> : <PhoneOutgoing className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'incoming' ? 'text-green-500' : 'text-blue-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-purple-300 border border-purple-400/30">
                  <Phone className="w-5 h-5" />
                  <span className="font-semibold">Call Center</span>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                  Live System
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Call Management
              </h1>
              <p className="text-gray-300">Track, manage, and analyze all your call recordings</p>
            </div>
            <Button
              onClick={fetchCalls}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl shadow-purple-500/25 transition-all hover:scale-105"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Total Calls</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{stats.totalCalls}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12% from last week</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Phone className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-green-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Incoming</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">{stats.incomingCalls}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>+8% from last week</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <PhoneIncoming className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-pink-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Outgoing</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">{stats.outgoingCalls}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>+5% from last week</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/25">
                  <PhoneOutgoing className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-orange-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Total Duration</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">{formatDuration(stats.totalDuration)}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-orange-400">
                    <Clock className="w-3 h-3" />
                    <span>Updated just now</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Clock className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-400/30 transition-all duration-300 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search calls by name, phone, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all"
                />
              </div>
              
              <div className="flex gap-3">
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-40 pl-4 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-gray-900 text-gray-300">All Types</option>
                    <option value="incoming" className="bg-gray-900 text-gray-300">Incoming</option>
                    <option value="outgoing" className="bg-gray-900 text-gray-300">Outgoing</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="w-40 pl-4 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-gray-900 text-gray-300">All Status</option>
                    <option value="completed" className="bg-gray-900 text-gray-300">Completed</option>
                    <option value="missed" className="bg-gray-900 text-gray-300">Missed</option>
                    <option value="ongoing" className="bg-gray-900 text-gray-300">Ongoing</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calls Table */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <Table>
              <thead>
                <tr>
                  <th className="text-gray-900 h-12 px-4 text-left align-middle font-medium">Type</th>
                  <th className="text-gray-900 h-12 px-4 text-left align-middle font-medium">Caller</th>
                  <th className="text-gray-900 h-12 px-4 text-left align-middle font-medium">Callee</th>
                  <th className="text-gray-900 h-12 px-4 text-left align-middle font-medium">Phone</th>
                  <th className="text-gray-900 h-12 px-4 text-left align-middle font-medium">Duration</th>
                  <th className="text-gray-900 h-12 px-4 text-left align-middle font-medium">Status</th>
                  <th className="text-gray-900 h-12 px-4 text-left align-middle font-medium">Cost</th>
                  <th className="text-gray-900 h-12 px-4 text-left align-middle font-medium">Revenue</th>
                  <th className="text-gray-900 h-12 px-4 text-left align-middle font-medium">Handled By</th>
                  <th className="text-gray-900 h-12 px-4 text-left align-middle font-medium">Date</th>
                  <th className="text-gray-900 h-12 px-4 text-right align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={12} className="p-4 text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    </td>
                  </tr>
                ) : filteredCalls.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-4 text-center py-8 text-gray-500">
                      No calls found
                    </td>
                  </tr>
                ) : (
                  filteredCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-gray-50 border-b">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            call.type === 'incoming' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {getTypeIcon(call.type)}
                          </div>
                          <span className="text-sm capitalize text-gray-600">{call.type}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm font-medium text-gray-900">{call.callerName}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm text-gray-600">{call.calleeName}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm text-gray-600">{call.phoneNumber}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm font-medium text-gray-900">{formatDuration(call.duration)}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge className={getStatusBadge(call.status)}>
                          {call.status}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(call.cost)}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(call.revenue)}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm text-gray-600">{call.user?.name || 'System'}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm text-gray-600">{new Date(call.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          {call.recordingUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePlayRecording(call.id)}
                              className="border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                              {playingRecording === call.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCall(call)}
                            className="border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCall(call)}
                            disabled={actionLoading[call.id]}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedCall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in duration-200 border-2 border-gray-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 pr-8">
              Edit Call Details
            </h2>
            <p className="text-sm text-gray-500 mb-6">Update call information</p>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 border-2 border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold"
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold shadow-lg"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCall && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in duration-200 border-2 border-red-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-red-600" />
            </button>
            <div className="flex items-center gap-3 mb-4 pr-8">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Delete Call Record</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete the call from <strong>{selectedCall.callerName}</strong>?
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading[selectedCall.id]}
                className="px-6 py-2 border-2 border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={actionLoading[selectedCall.id]}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 font-semibold shadow-lg"
              >
                {actionLoading[selectedCall.id] ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
