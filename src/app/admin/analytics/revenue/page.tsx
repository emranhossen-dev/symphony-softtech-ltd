"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Smartphone,
  Wallet,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  User,
  BookOpen,
  BarChart3,
  PieChart
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { toast } from "react-hot-toast";

interface Payment {
  id: string;
  enrollmentId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  courseName: string;
  amount: number;
  paymentMethod: string | null;
  transactionId: string | null;
  paymentStatus: string;
  enrollmentStatus: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
}

interface PaymentStats {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  failedRevenue: number;
  cancelledRevenue: number;
  totalTransactions: number;
  paidTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  cancelledTransactions: number;
  onlinePayments: number;
  manualPayments: number;
  todayRevenue: number;
  thisMonthRevenue: number;
  thisWeekRevenue: number;
}

export default function RevenueAnalytics() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [stats, setStats] = useState<PaymentStats | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token') ||
                     localStorage.getItem('token') ||
                     document.cookie.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1];

      const response = await fetch("/api/admin/payments", {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPayments(data.payments || []);
          setStats(data.stats || null);
        }
      } else {
        toast.error("Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Error fetching payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Listen for payment updates from enrollment management
  useEffect(() => {
    const handleUpdate = () => {
      fetchPayments();
    };

    window.addEventListener('updateRevenueAnalytics', handleUpdate);

    return () => {
      window.removeEventListener('updateRevenueAnalytics', handleUpdate);
    };
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (payment.transactionId && payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = filterStatus === "all" || payment.paymentStatus === filterStatus;

      const matchesMethod = filterMethod === "all" ||
        (filterMethod === "online" && payment.paymentMethod?.toLowerCase().includes("online")) ||
        (filterMethod === "manual" && (!payment.paymentMethod || payment.paymentMethod?.toLowerCase().includes("manual") || payment.paymentMethod?.toLowerCase().includes("cash")));

      const matchesDate = (() => {
        if (dateRange === "all") return true;

        const paymentDate = new Date(payment.createdAt);
        const now = new Date();

        if (dateRange === "today") {
          return paymentDate.toDateString() === now.toDateString();
        }

        if (dateRange === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return paymentDate >= weekAgo;
        }

        if (dateRange === "month") {
          const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
          return paymentDate >= monthAgo;
        }

        return true;
      })();

      return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });
  }, [payments, searchQuery, filterStatus, filterMethod, dateRange]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Paid</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">Pending</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500/20 text-red-300 border-red-400/30">Failed</Badge>;
      case "CANCELLED":
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-400/30">Cancelled</Badge>;
      case "NOT_REQUIRED":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Not Required</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-400/30">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string | null) => {
    if (!method) {
      return <Badge className="bg-gray-500/20 text-gray-300 border-gray-400/30">Unknown</Badge>;
    }

    const methodLower = method.toLowerCase();
    if (methodLower.includes("online") || methodLower.includes("bkash") || methodLower.includes("nagad") || methodLower.includes("card")) {
      return <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 flex items-center gap-1">
        <Smartphone className="w-3 h-3" />
        Online
      </Badge>;
    } else {
      return <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30 flex items-center gap-1">
        <Wallet className="w-3 h-3" />
        Manual
      </Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    if (filteredPayments.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Date", "Name", "Email", "Phone", "Course", "Amount", "Payment Method", "Transaction ID", "Status"];
    const rows = filteredPayments.map(p => [
      formatDate(p.createdAt),
      p.fullName,
      p.email,
      p.phoneNumber,
      p.courseName,
      p.amount,
      p.paymentMethod || "Unknown",
      p.transactionId || "N/A",
      p.paymentStatus
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Export successful");
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-green-300 border border-green-400/30">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-semibold">Revenue Analytics</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Payment Tracking
              </h1>
              <p className="text-gray-300">Track all manual and online payment transactions</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={exportToCSV}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-2xl shadow-blue-500/25 transition-all hover:scale-105"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={fetchPayments}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl shadow-purple-500/25 transition-all hover:scale-105"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-8 space-y-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-green-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>All time</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-blue-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Paid Revenue</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                      {formatCurrency(stats.paidRevenue)}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-400">
                      <CheckCircle className="w-3 h-3" />
                      <span>{stats.paidTransactions} transactions</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-yellow-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                      {formatCurrency(stats.pendingRevenue)}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-yellow-400">
                      <Clock className="w-3 h-3" />
                      <span>{stats.pendingTransactions} pending</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-red-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Failed</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
                      {formatCurrency(stats.failedRevenue)}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-red-400">
                      <XCircle className="w-3 h-3" />
                      <span>{stats.failedTransactions} failed</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Online</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
                      {stats.onlinePayments}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-purple-400">
                      <Smartphone className="w-3 h-3" />
                      <span>Payments</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-orange-400/30 transition-all duration-300 hover:scale-105 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Manual</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                      {stats.manualPayments}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-orange-400">
                      <Wallet className="w-3 h-3" />
                      <span>Payments</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-green-400/30 transition-all duration-300 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Today's Revenue</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                      {formatCurrency(stats.todayRevenue)}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                      <Calendar className="w-3 h-3" />
                      <span>Today</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-blue-400/30 transition-all duration-300 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">This Week</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                      {formatCurrency(stats.thisWeekRevenue)}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-400">
                      <BarChart3 className="w-3 h-3" />
                      <span>Last 7 days</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-400/30 transition-all duration-300 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">This Month</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      {formatCurrency(stats.thisMonthRevenue)}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-purple-400">
                      <PieChart className="w-3 h-3" />
                      <span>This month</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <PieChart className="w-7 h-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  placeholder="Search by name, email, course, or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-900 text-gray-300">All Status</option>
                <option value="PAID" className="bg-gray-900 text-gray-300">Paid</option>
                <option value="PENDING" className="bg-gray-900 text-gray-300">Pending</option>
                <option value="FAILED" className="bg-gray-900 text-gray-300">Failed</option>
                <option value="CANCELLED" className="bg-gray-900 text-gray-300">Cancelled</option>
                <option value="NOT_REQUIRED" className="bg-gray-900 text-gray-300">Not Required</option>
              </select>

              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-900 text-gray-300">All Methods</option>
                <option value="online" className="bg-gray-900 text-gray-300">Online</option>
                <option value="manual" className="bg-gray-900 text-gray-300">Manual</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-900 text-gray-300">All Time</option>
                <option value="today" className="bg-gray-900 text-gray-300">Today</option>
                <option value="week" className="bg-gray-900 text-gray-300">This Week</option>
                <option value="month" className="bg-gray-900 text-gray-300">This Month</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Payment Transactions Table */}
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-400/30 transition-all duration-300 shadow-2xl">
          <CardHeader className="bg-white/5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-purple-400" />
                Payment Transactions ({filteredPayments.length})
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
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No payments found</h3>
                <p className="text-gray-400">
                  {searchQuery || filterStatus !== "all" || filterMethod !== "all" || dateRange !== "all"
                    ? "Try adjusting your filters"
                    : "No payment transactions yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 font-medium text-gray-300 uppercase tracking-wider text-xs">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300 uppercase tracking-wider text-xs">Student</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300 uppercase tracking-wider text-xs">Course</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300 uppercase tracking-wider text-xs">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300 uppercase tracking-wider text-xs">Method</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300 uppercase tracking-wider text-xs">Transaction ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300 uppercase tracking-wider text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-white/10 border-b border-white/5 transition-all duration-200">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Calendar className="w-4 h-4" />
                            {formatDate(payment.createdAt)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-white">{payment.fullName}</p>
                            <p className="text-sm text-gray-400">{payment.email}</p>
                            <p className="text-xs text-gray-500">{payment.phoneNumber}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-gray-300">{payment.courseName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-green-400">{formatCurrency(payment.amount)}</p>
                        </td>
                        <td className="py-4 px-4">
                          {getMethodBadge(payment.paymentMethod)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-300 font-mono">
                            {payment.transactionId || "N/A"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(payment.paymentStatus)}
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
    </div>
  );
}
