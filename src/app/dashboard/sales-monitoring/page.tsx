'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { MapPin, Phone, Mail, Activity, Map as MapIcon } from 'lucide-react';

interface SalesStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  status: 'online' | 'offline';
  lastUpdated: Date;
  latitude: number;
  longitude: number;
  currentLocation?: string;
  todayVisits: number;
  monthlyTarget: number;
  monthlyAchievement: number;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const sampleSalesData: SalesStaff[] = [
  {
    id: '1',
    name: 'Ahmad Wijaya',
    email: 'ahmad.w@sinarbajamotor.co.id',
    phone: '0812-3456-7890',
    branch: 'Jakarta',
    status: 'online',
    lastUpdated: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    latitude: -6.1944,
    longitude: 106.8229,
    currentLocation: 'Grand Indonesia, Jakarta',
    todayVisits: 8,
    monthlyTarget: 50,
    monthlyAchievement: 35,
  },
  {
    id: '2',
    name: 'Budi Santoso',
    email: 'budi.s@sinarbajamotor.co.id',
    phone: '0813-2345-6789',
    branch: 'Jakarta',
    status: 'online',
    lastUpdated: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    latitude: -6.2088,
    longitude: 106.8456,
    currentLocation: 'Thamrin City, Jakarta',
    todayVisits: 6,
    monthlyTarget: 50,
    monthlyAchievement: 42,
  },
  {
    id: '3',
    name: 'Siti Nurhaliza',
    email: 'siti.n@sinarbajamotor.co.id',
    phone: '0814-3456-7891',
    branch: 'Surabaya',
    status: 'offline',
    lastUpdated: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    latitude: -7.2575,
    longitude: 112.7521,
    currentLocation: 'Tunjungan Plaza, Surabaya',
    todayVisits: 5,
    monthlyTarget: 45,
    monthlyAchievement: 28,
  },
  {
    id: '4',
    name: 'Rudi Hermawan',
    email: 'rudi.h@sinarbajamotor.co.id',
    phone: '0815-4567-8912',
    branch: 'Bandung',
    status: 'online',
    lastUpdated: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    latitude: -6.9175,
    longitude: 107.6191,
    currentLocation: 'Paris Van Java, Bandung',
    todayVisits: 7,
    monthlyTarget: 48,
    monthlyAchievement: 38,
  },
];

export default function SalesMonitoringPage() {
  const [salesData, setSalesData] = useState<SalesStaff[]>(sampleSalesData);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [map, setMap] = useState<any | null>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  const branches = [
    { value: 'all', label: 'All Branches' },
    { value: 'Jakarta', label: 'Jakarta' },
    { value: 'Surabaya', label: 'Surabaya' },
    { value: 'Bandung', label: 'Bandung' },
  ];

  const getMarkerColor = (lastUpdated: Date) => {
    const minutesDiff = (Date.now() - lastUpdated.getTime()) / (1000 * 60);
    if (minutesDiff < 30) {
      return '#10b981'; // Green for recent
    } else {
      return '#ef4444'; // Red for old
    }
  };

  const initMap = useCallback(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    // Ensure Google Maps API is loaded
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      return;
    }

    // Use requestAnimationFrame to ensure this runs after React's render cycle
    requestAnimationFrame(() => {
      const mapInstance = new window.google.maps.Map(mapRef.current!, {
        zoom: 11,
        center: { lat: -6.2088, lng: 106.8456 }, // Jakarta center
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      setMap(mapInstance);
    });
  }, []);

  const updateMarkers = useCallback(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: any[] = [];
    const bounds = new (window.google.maps.LatLngBounds as any)();

    salesData
      .filter(sales => selectedBranch === 'all' || sales.branch === selectedBranch)
      .forEach(sales => {
        const marker = new (window.google.maps.Marker as any)({
          position: { lat: sales.latitude, lng: sales.longitude },
          map,
          title: sales.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: getMarkerColor(sales.lastUpdated),
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWidth: 2,
          },
        });

        const infoWindow = new (window.google.maps.InfoWindow as any)({
          content: `
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="margin: 0 0 10px 0; font-weight: bold;">${sales.name}</h3>
              <p style="margin: 5px 0;">📍 ${sales.currentLocation || 'Unknown location'}</p>
              <p style="margin: 5px 0;">📱 ${sales.phone}</p>
              <p style="margin: 5px 0;">📊 Today's visits: ${sales.todayVisits}</p>
              <p style="margin: 5px 0;">🏢 Branch: ${sales.branch}</p>
              <p style="margin: 5px 0; color: ${sales.status === 'online' ? '#10b981' : '#ef4444'};">
                ● ${sales.status.toUpperCase()} (${Math.floor((Date.now() - sales.lastUpdated.getTime()) / (1000 * 60))} min ago)
              </p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        newMarkers.push(marker);
        bounds.extend({ lat: sales.latitude, lng: sales.longitude });
      });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
  }, [map, salesData, selectedBranch]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      initMap();
    }
  }, [initMap]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  const loadGoogleMaps = useCallback(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is not configured');
      return;
    }

    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, [initMap]);

  useEffect(() => {
    loadGoogleMaps();
  }, [loadGoogleMaps]);

  const filteredSalesData = salesData.filter(sales =>
    selectedBranch === 'all' || sales.branch === selectedBranch
  );

  const onlineCount = filteredSalesData.filter(s => s.status === 'online').length;
  const totalCount = filteredSalesData.length;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Monitoring</h1>
              <p className="text-gray-600">Live tracking of sales staff locations and activities</p>
            </div>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.value} value={branch.value}>
                    {branch.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCount}</div>
                <p className="text-xs text-muted-foreground">
                  Across all branches
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Online Now</CardTitle>
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredSalesData.reduce((acc, s) => acc + s.todayVisits, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total customer visits
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Target</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    (filteredSalesData.reduce((acc, s) => acc + (s.monthlyAchievement / s.monthlyTarget) * 100, 0) / totalCount)
                  )}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average achievement
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Map and Sales List */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Live Map</CardTitle>
                <CardDescription>
                  Real-time location of sales staff.
                  <span className="inline-flex items-center gap-1 ml-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Recent (&lt;30 min)
                    <span className="w-2 h-2 bg-red-500 rounded-full ml-2"></span>
                    Old (&gt;30 min)
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  ref={mapRef}
                  style={{ width: '100%', height: '500px' }}
                  className="bg-gray-100 rounded-lg"
                />
              </CardContent>
            </Card>

            {/* Sales List */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Staff</CardTitle>
                <CardDescription>
                  {onlineCount} of {totalCount} currently online
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {filteredSalesData.map((sales) => (
                    <div
                      key={sales.id}
                      className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Avatar>
                        <AvatarFallback>{sales.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{sales.name}</p>
                          <Badge
                            variant={sales.status === 'online' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {sales.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {sales.currentLocation || 'Unknown location'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sales.branch} • {sales.todayVisits} visits today
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-xs text-gray-500">
                          {Math.floor((Date.now() - sales.lastUpdated.getTime()) / (1000 * 60))}m ago
                        </span>
                        <div className="flex items-center space-x-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getMarkerColor(sales.lastUpdated) }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}