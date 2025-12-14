'use client';

import React from 'react';
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
  Map as MapIcon
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const statsCards = [
  {
    title: 'Total Vehicles',
    value: '247',
    description: '+12% from last month',
    icon: Car,
    trend: 'up',
  },
  {
    title: 'Active Sales',
    value: '18',
    description: 'Currently online',
    icon: Users,
    trend: 'online',
  },
  {
    title: 'Branches',
    value: '5',
    description: 'Across 3 cities',
    icon: MapPin,
    trend: 'neutral',
  },
  {
    title: 'SPK This Month',
    value: '62',
    description: '+8% from last month',
    icon: FileText,
    trend: 'up',
  },
];

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
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your Car Dealer Dashboard</p>
        </div>

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New SPK created</p>
                  <p className="text-xs text-gray-500">SPK/001/SBM/XII/2025 - Honda Beat FI</p>
                </div>
                <span className="text-xs text-gray-500">2 min ago</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New sales staff registered</p>
                  <p className="text-xs text-gray-500">Budi Santoso - jakarta Branch</p>
                </div>
                <span className="text-xs text-gray-500">1 hour ago</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New branch added</p>
                  <p className="text-xs text-gray-500">Surabaya Branch - Jl. Ahmad Yani</p>
                </div>
                <span className="text-xs text-gray-500">3 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}