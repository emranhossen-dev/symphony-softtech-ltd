"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { 
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  CheckCircle,
  XCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  CreditCard,
  Smartphone,
  Building,
  Eye,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Wallet,
  Receipt
} from 'lucide-react';
import { formatBDT } from '@/lib/currency';
import { toast } from 'react-hot-toast';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface Payment {
  id: string;
  enrollmentId: string;
  enrollment?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    courseName: string;
    category: string;
  };
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  paidAmount: number;
  failedAmount: number;
  totalTransactions: number;
  pendingCount: number;
  paidCount: number;
  failedCount: number;
  monthlyRevenue: number;
  revenueGrowth: number;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'RECORDED', label: 'Recorded' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' }
];

const paymentMethods = [
  { value: 'all', label: 'All Methods' },
  { value: 'bkash', label: 'bKash', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'nagad', label: 'Nagad', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'bank', label: 'Bank Transfer', icon: <Building className="w-4 h-4" /> },
  { value: 'cash', label: 'Cash', icon: <Banknote className="w-4 h-4" /> },
  { value: 'card', label: 'Credit Card', icon: <CreditCard className="w-4 h-4" /> }
];

const paymentStatuses = [
  { value: 'all', label: 'All Status' },
  { value: 'PENDING', label: 'Pending', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'PAID', label: 'Paid', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'FAILED', label: 'Failed', color: 'bg-red-50 text-red-700 border-red-200' }
];

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    failedAmount: 0,
    totalTransactions: 0,
    pendingCount: 0,
    paidCount: 0,
    failedCount: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    method: 'all',
    category: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payments');
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.payments);
        setStats(data.stats);
      } else {
        toast.error('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];
    
    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(payment => 
        payment.enrollment?.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
        payment.enrollment?.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        payment.enrollment?.phoneNumber.includes(filters.search) ||
        payment.transactionId?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(payment => payment.paymentStatus === filters.status);
    }
    
    // Filter by payment method
    if (filters.method !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === filters.method);
    }
    
    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(payment => payment.enrollment?.category === filters.category);
    }
    
    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(payment => 
        new Date(payment.createdAt) >= startDate
      );
    }
    
    setFilteredPayments(filtered);
  };

  const verifyPayment = async (paymentId: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [paymentId]: true }));
      
      const response = await fetch('/api/admin/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPayments(prev => 
          prev.map(payment => 
            payment.id === paymentId 
              ? { ...payment, paymentStatus: 'PAID', verifiedAt: new Date().toISOString() }
              : payment
          )
        );
        
        // Update stats
        fetchPayments();
        toast.success('Payment verified successfully!');
      } else {
        toast.error(data.error || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    } finally {
      setActionLoading(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  const rejectPayment = async (paymentId: string, reason?: string) => {
    if (!confirm('Are you sure you want to reject this payment?')) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [paymentId]: true }));
      
      const response = await fetch('/api/admin/payment/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          reason: reason || 'Payment rejected by admin'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPayments(prev => 
          prev.map(payment => 
            payment.id === paymentId 
              ? { ...payment, paymentStatus: 'FAILED', notes: reason }
              : payment
          )
        );
        
        // Update stats
        fetchPayments();
        toast.success('Payment rejected successfully!');
      } else {
        toast.error(data.error || 'Failed to reject payment');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Failed to reject payment');
    } finally {
      setActionLoading(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await fetch('/api/admin/payments/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: filters
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Payments exported successfully!');
      } else {
        toast.error('Failed to export payments');
      }
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast.error('Failed to export payments');
    }
  };

  const viewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };


  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bkash':
      case 'nagad':
        return <Smartphone className="w-4 h-4" />;
      case 'bank':
        return <Building className="w-4 h-4" />;
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'PAID': return 'bg-green-50 text-green-700 border-green-200';
      case 'FAILED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Payment Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and track all payment transactions</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={fetchPayments}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatBDT(stats.totalRevenue)}</p>
                  <div className="flex items-center mt-2">
                    {stats.revenueGrowth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(stats.revenueGrowth)}% from last month
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">৳</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatBDT(stats.pendingAmount)}</p>
                  <p className="text-sm text-gray-500 mt-2">{stats.pendingCount} transactions</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatBDT(stats.monthlyRevenue)}</p>
                  <p className="text-sm text-gray-500 mt-2">This month</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Amount</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatBDT(stats.failedAmount)}</p>
                  <p className="text-sm text-gray-500 mt-2">{stats.failedCount} transactions</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by student name, email, phone, or transaction ID..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-full border-gray-200 text-sm">
                    <SelectValue>All Status</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <Select value={filters.method} onValueChange={(value) => setFilters(prev => ({ ...prev, method: value }))}>
                  <SelectTrigger className="w-full border-gray-200 text-sm">
                    <SelectValue>All Methods</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center">
                          {method.icon}
                          <span className="ml-2">{method.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="w-full border-gray-200 text-sm">
                    <SelectValue>All Categories</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                  <SelectTrigger className="w-full border-gray-200 text-sm">
                    <SelectValue>All Time</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-gray-100">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-gray-900">Payment Transactions</span>
                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                  {filteredPayments.length} Total
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</TableHead>
                    <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.enrollment?.fullName}</div>
                          <div className="text-xs text-gray-500">{payment.enrollment?.email}</div>
                          <div className="text-xs text-gray-500">{payment.enrollment?.phoneNumber}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{payment.enrollment?.courseName}</div>
                          <div className="text-xs text-gray-500">{payment.enrollment?.category}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatBDT(payment.amount)}
                        </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="ml-2 capitalize">{payment.paymentMethod}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-mono">
                          {payment.transactionId || 'N/A'}
                        </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <Badge className={getStatusColor(payment.paymentStatus)}>
                          {payment.paymentStatus}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>{new Date(payment.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewPaymentDetails(payment)}
                            className="border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                          
                          {payment.paymentStatus === 'PENDING' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => verifyPayment(payment.id)}
                                disabled={actionLoading[payment.id]}
                              >
                                {actionLoading[payment.id] ? (
                                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                )}
                                Verify
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() => rejectPayment(payment.id)}
                                disabled={actionLoading[payment.id]}
                              >
                                {actionLoading[payment.id] ? (
                                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <X className="w-4 h-4 mr-1" />
                                )}
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Empty State */}
            {filteredPayments.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Receipt className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500">
                  Try adjusting your filters or check back later for new payments.
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">Loading payments...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowDetailsModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Information</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-900">{selectedPayment.enrollment?.fullName}</div>
                      <div className="text-sm text-gray-600">{selectedPayment.enrollment?.email}</div>
                      <div className="text-sm text-gray-600">{selectedPayment.enrollment?.phoneNumber}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Information</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-900">{selectedPayment.enrollment?.courseName}</div>
                      <div className="text-sm text-gray-600">{selectedPayment.enrollment?.category}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Details</label>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="font-medium text-gray-900">{formatBDT(selectedPayment.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Method:</span>
                        <span className="font-medium text-gray-900 capitalize">{selectedPayment.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Transaction ID:</span>
                        <span className="font-medium text-gray-900 font-mono">
                          {selectedPayment.transactionId || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge className={getStatusColor(selectedPayment.paymentStatus)}>
                          {selectedPayment.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timestamps</label>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(selectedPayment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {selectedPayment.verifiedAt && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Verified:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(selectedPayment.verifiedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedPayment.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-900">{selectedPayment.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
