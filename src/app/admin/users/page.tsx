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
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE" | "MENTOR" | "STUDENT";
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
  role: "ADMIN" | "EMPLOYEE";
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
      const token = localStorage.getItem('auth_token') || localStorage.getItem('auth-token');
      
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
      const token = localStorage.getItem('auth_token') || localStorage.getItem('auth-token');
      
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
      const token = localStorage.getItem('auth_token') || localStorage.getItem('auth-token');
      
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
      const token = localStorage.getItem('auth_token') || localStorage.getItem('auth-token');
      
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
      ? <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      : <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Admin</Badge>;
      case "EMPLOYEE":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Employee</Badge>;
      case "MENTOR":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Mentor</Badge>;
      case "STUDENT":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Student</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-gray-600 text-sm">Manage admin and employee accounts</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
              <Button
                onClick={fetchUsers}
                disabled={loading}
                variant="outline"
                className="bg-white/90 hover:bg-white border-gray-300/60"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8 relative overflow-hidden w-full">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-red-800 font-medium block">{error}</span>
                {error.includes("Access denied") && (
                  <div className="mt-2 text-sm text-red-700">
                    <p className="mb-2">To fix this issue:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to <a href="/login" className="underline hover:text-red-800">login page</a></li>
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
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="MENTOR">Mentor</option>
                <option value="STUDENT">Student</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                Users ({filteredUsers.length})
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterRole !== "all" || filterStatus !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first user to get started"}
                </p>
                {!searchQuery && filterRole === "all" && filterStatus === "all" && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25"
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
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Last Login</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
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
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {user.lastLogin ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {new Date(user.lastLogin).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Never</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {user.isActive ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(user.id, false)}
                                className="bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700"
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(user.id, true)}
                                className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
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
            className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-indigo-900/90 backdrop-blur-md"
            onClick={() => setShowCreateModal(false)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-white/20 flex flex-col">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white flex-shrink-0">
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Create New User</h3>
                  <p className="text-blue-100 text-xs mt-0.5">Add a new member to your team</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Full Name Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-gray-50/50 text-sm"
                      placeholder="Enter full name"
                    />
                    <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-gray-50/50 text-sm"
                      placeholder="Enter email address"
                    />
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                
                {/* Phone Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Phone Number
                    <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-gray-50/50 text-sm"
                      placeholder="Enter phone number"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                
                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2.5 pl-10 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-gray-50/50 text-sm"
                      placeholder="Enter password"
                    />
                    <Key className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Role Field */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    User Role
                  </label>
                  <div className="relative">
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as "ADMIN" | "EMPLOYEE" })}
                      className="w-full px-3 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-gray-50/50 appearance-none cursor-pointer text-sm"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="ADMIN">Admin</option>
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
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all duration-200 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
