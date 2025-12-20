'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Car,
  Users,
  MapPin,
  FileText,
  TrendingUp,
  Activity,
  Settings,
  Map as MapIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { dashboardAPI } from '@/services/api';
import { toast } from 'sonner';

interface DashboardStats {
  totalSpks: number;
  finishedSpks: number;
  pendingSpks: number;
  activeSales: number;
  totalSales: number;
  totalSalesApproved: number;
  thisMonthSpks: number;
  totalSalesValue: number;
}

interface RecentSPK {
  id: number;
  noSPK: string;
  tanggal: string;
  namaCustomer: string;
  unitInfo?: {
    vehicleType?: {
      name: string;
    };
    hargaOtr: number;
  };
  finish: boolean;
  createdAt: string;
}

interface Article {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

interface SalesProfile {
  id: number;
  surename: string;
  city: string;
  online_stat: boolean;
}

const moduleCards = [
  {
    title: 'Master Data Management',
    description: 'Manage vehicle groups, types, colors, supervisors, and branches',
    icon: Settings,
    href: '/dashboard/master-data',
    color: 'bg-blue-500',
  },
  {
    title: 'Sales Monitoring',
    description: 'Live map view of sales staff locations and activity',
    icon: MapIcon,
    href: '/dashboard/sales-monitoring',
    color: 'bg-green-500',
  },
  {
    title: 'SPK Management',
    description: 'Manage orders, generate PDFs, and track order status',
    icon: FileText,
    href: '/dashboard/spk-management',
    color: 'bg-purple-500',
  },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSpks, setRecentSpks] = useState<RecentSPK[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [topSales, setTopSales] = useState<SalesProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [Dashboard] Fetching dashboard data...');
      const data = await dashboardAPI.getStatistics();

      console.log('✅ [Dashboard] Data fetched successfully');
      setStats(data.stats);
      setRecentSpks(data.recentSpks);
      setRecentArticles(data.recentArticles);
      setTopSales(data.topSales);
    } catch (error: any) {
      console.error('❌ [Dashboard] Failed to fetch data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.round(diffTime / 60000);

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.round(diffMinutes / 60)} hours ago`;
    } else {
      return `${Math.round(diffMinutes / 1440)} days ago`;
    }
  };

  const statsCards = [
    {
      title: 'Total SPKs',
      value: stats?.totalSpks || 0,
      description: `${stats?.finishedSpks || 0} completed`,
      icon: FileText,
      trend: stats?.totalSpks ? 'neutral' as const : 'neutral' as const,
    },
    {
      title: 'Active Sales',
      value: stats?.activeSales || 0,
      description: `out of ${stats?.totalSales || 0} total`,
      icon: Users,
      trend: 'online' as const,
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingSpks || 0,
      description: 'waiting for completion',
      icon: Car,
      trend: 'warning' as const,
    },
    {
      title: 'SPK This Month',
      value: stats?.thisMonthSpks || 0,
      description: `${formatCurrency(stats?.totalSalesValue || 0)} total value`,
      icon: TrendingUp,
      trend: 'up' as const,
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your Car Dealer Dashboard</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-lg">Loading dashboard data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={fetchDashboardData}
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content */}
        {!loading && !error && stats && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statsCards.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Module Cards */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Access
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {moduleCards.map((module) => (
                  <Card key={module.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-4`}>
                        <module.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={module.href}>
                        <Button className="w-full">
                          Open Module
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent SPKs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent SPKs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentSpks.length > 0 ? (
                    <div className="space-y-4">
                      {recentSpks.map((spk) => (
                        <div key={spk.id} className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${
                            spk.finish ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {spk.namaCustomer}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {spk.noSPK} - {spk.unitInfo?.vehicleType?.name || 'N/A'}
                            </p>
                          </div>
                          <Badge variant={spk.finish ? 'default' : 'secondary'}>
                            {spk.finish ? 'Finished' : 'Pending'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(spk.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No SPKs found</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Sales & Announcements */}
              <div className="space-y-6">
                {/* Top Sales */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Top Sales Staff
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topSales.length > 0 ? (
                      <div className="space-y-4">
                        {topSales.map((sale) => (
                          <div key={sale.id} className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${
                              sale.online_stat ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{sale.surename}</p>
                              <p className="text-xs text-gray-500">{sale.city}</p>
                            </div>
                            <Badge variant={sale.online_stat ? 'default' : 'secondary'}>
                              {sale.online_stat ? 'Online' : 'Offline'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">No sales staff found</p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Announcements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Announcements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentArticles.length > 0 ? (
                      <div className="space-y-4">
                        {recentArticles.map((article) => (
                          <div key={article.id} className="border-l-2 border-blue-500 pl-4">
                            <p className="text-sm font-medium">{article.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(article.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">No announcements</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  </ProtectedRoute>
);
}