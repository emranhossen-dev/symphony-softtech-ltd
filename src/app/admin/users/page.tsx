"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Users,
  User,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  MoreVertical,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Key,
  TrendingUp,
  GraduationCap,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE" | "MENTOR";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  phone?: string;
  _count?: {
    enrollments: number;
  };
}

interface NewUser {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "EMPLOYEE" | "MENTOR";
  phone?: string;
}

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<NewUser>({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get auth token
      const token = localStorage.getItem('auth_token') || 
                     localStorage.getItem('token') ||
                     document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      
      const response = await fetch("/api/admin/users", {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        setError("Access denied. Please login as an admin user.");
        return;
      }
      
      if (response.status === 403) {
        setError("Access denied. Admin privileges required.");
        return;
      }
      
      if (!response.ok) {
        setError(`Server error: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesStatus = filterStatus === "all" ||
        (filterStatus === "active" && user.isActive) ||
        (filterStatus === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // Get auth token
      const token = localStorage.getItem('auth_token') || 
                     localStorage.getItem('token') ||
                     document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        setError("Access denied. Please login as an admin user.");
        return;
      }
      
      if (response.status === 403) {
        setError("Access denied. Admin privileges required.");
        return;
      }

      const data = await response.json();

      if (data.success) {
        setSuccess("User created successfully!");
        setFormData({ name: "", email: "", password: "", role: "EMPLOYEE" });
        setShowCreateModal(false);
        fetchUsers();
      } else {
        setError(data.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    try {
      // Get auth token
      const token = localStorage.getItem('auth_token') || 
                     localStorage.getItem('token') ||
                     document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
        setSuccess(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        setError(data.error || "Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Network error");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      // Get auth token
      const token = localStorage.getItem('auth_token') || 
                     localStorage.getItem('token') ||
                     document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
        setSuccess("User deleted successfully");
      } else {
        setError(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Network error");
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Active</Badge>
      : <Badge className="bg-red-500/20 text-red-300 border-red-400/30">Inactive</Badge>;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">Admin</Badge>;
      case "EMPLOYEE":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Employee</Badge>;
      case "MENTOR":
        return <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Mentor</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-400/30">Unknown</Badge>;
    }
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    mentors: users.filter(u => u.role === 'MENTOR').length,
    employees: users.filter(u => u.role === 'EMPLOYEE').length
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
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">User Management</span>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                  Active System
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Manage Users
              </h1>
              <p className="text-gray-300">Create and manage admin, employee, and mentor accounts (Students managed separately)</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-2xl shadow-green-500/25 transition-all hover:scale-105"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              <Button
                onClick={fetchUsers}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl shadow-purple-500/25 transition-all hover:scale-105"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{stats.totalUsers}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>Admin, Employee, Mentor</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Users className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-green-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">{stats.activeUsers}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                    <UserCheck className="w-3 h-3" />
                    <span>Currently active</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <UserCheck className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Admins</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{stats.admins}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-purple-400">
                    <Shield className="w-3 h-3" />
                    <span>Administrators</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-blue-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Mentors</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{stats.mentors}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-blue-400">
                    <GraduationCap className="w-3 h-3" />
                    <span>Course mentors</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-orange-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Employees</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">{stats.employees}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-orange-400">
                    <UserCheck className="w-3 h-3" />
                    <span>Staff members</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <UserCheck className="w-7 h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-red-300 font-medium block">{error}</span>
                {error.includes("Access denied") && (
                  <div className="mt-2 text-sm text-red-200">
                    <p className="mb-2">To fix this issue:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to <a href="/login" className="underline hover:text-red-300">login page</a></li>
                      <li>Login with admin credentials</li>
                      <li>Return to this page</li>
                    </ol>
                    <p className="mt-2">
                      <button
                        onClick={() => window.location.href = '/login'}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Go to Login
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur-sm flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
            <span className="text-green-300">{success}</span>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-400/30 transition-all duration-300 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-900 text-gray-300">All Roles</option>
                <option value="ADMIN" className="bg-gray-900 text-gray-300">Admin</option>
                <option value="EMPLOYEE" className="bg-gray-900 text-gray-300">Employee</option>
                <option value="MENTOR" className="bg-gray-900 text-gray-300">Mentor</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-900 text-gray-300">All Status</option>
                <option value="active" className="bg-gray-900 text-gray-300">Active</option>
                <option value="inactive" className="bg-gray-900 text-gray-300">Inactive</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-400/30 transition-all duration-300 shadow-2xl">
          <CardHeader className="bg-white/5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-purple-400" />
                Users ({filteredUsers.length})
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent absolute top-0"></div>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No users found</h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery || filterRole !== "all" || filterStatus !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first user to get started"}
                </p>
                {!searchQuery && filterRole === "all" && filterStatus === "all" && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-2xl shadow-green-500/25 transition-all hover:scale-105"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create First User
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-medium text-gray-300 uppercase tracking-wider text-xs">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300 uppercase tracking-wider text-xs">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300 uppercase tracking-wider text-xs">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300 uppercase tracking-wider text-xs">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300 uppercase tracking-wider text-xs">Last Login</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-300 uppercase tracking-wider text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/10 border-b border-white/5 transition-all duration-200">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-purple-500/25">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-white">{user.name}</p>
                              <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(user.isActive)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Calendar className="w-4 h-4" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {user.lastLogin ? (
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Clock className="w-4 h-4" />
                              {new Date(user.lastLogin).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Never</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {user.isActive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(user.id, false)}
                                className="bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30 text-yellow-400 hover:text-yellow-300"
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(user.id, true)}
                                className="bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-400 hover:text-green-300"
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />

          <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-200 border-2 border-white/10">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 transition-colors group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
            <div className="flex items-center gap-3 mb-6 pr-8">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create New User</h2>
                <p className="text-sm text-gray-400">Add a new member to your team</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Full Name Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 pl-10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-200 hover:border-white/30 bg-white/10 text-white placeholder-gray-400 text-sm"
                      placeholder="Enter full name"
                    />
                    <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 pl-10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-200 hover:border-white/30 bg-white/10 text-white placeholder-gray-400 text-sm"
                      placeholder="Enter email address"
                    />
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Phone Number
                    <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 pl-10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-200 hover:border-white/30 bg-white/10 text-white placeholder-gray-400 text-sm"
                      placeholder="Enter phone number"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <Key className="w-3.5 h-3.5 text-purple-400" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2.5 pl-10 pr-10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-200 hover:border-white/30 bg-white/10 text-white placeholder-gray-400 text-sm"
                      placeholder="Enter password"
                    />
                    <Key className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    User Role
                  </label>
                  <div className="relative">
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as "ADMIN" | "EMPLOYEE" | "MENTOR" })}
                      className="w-full px-3 py-2.5 pl-10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-200 hover:border-white/30 bg-white/10 appearance-none cursor-pointer text-white text-sm"
                    >
                      <option value="EMPLOYEE" className="bg-gray-900 text-gray-300">Employee</option>
                      <option value="ADMIN" className="bg-gray-900 text-gray-300">Admin</option>
                      <option value="MENTOR" className="bg-gray-900 text-gray-300">Mentor</option>
                    </select>
                    <Shield className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <svg className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 p-4 pt-0 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-4 border-2 border-white/20 hover:bg-white/10 text-white font-semibold transition-all duration-200 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-lg shadow-green-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5" />
                      Create User
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
