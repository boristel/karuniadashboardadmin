'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CRUDTable } from '@/components/CRUDTable';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive';
  manager: string;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const sampleData: Branch[] = [
  {
    id: '1',
    name: 'Jakarta Head Office',
    address: 'Jl. MH. Thamrin No. 9',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    postalCode: '10350',
    phone: '(021) 8901234',
    email: 'jakarta@sinarbajamotor.co.id',
    latitude: -6.1944,
    longitude: 106.8229,
    status: 'active',
    manager: 'Budi Santoso',
  },
  {
    id: '2',
    name: 'Surabaya Branch',
    address: 'Jl. Ahmad Yani No. 45',
    city: 'Surabaya',
    province: 'Jawa Timur',
    postalCode: '60281',
    phone: '(031) 8281234',
    email: 'surabaya@sinarbajamotor.co.id',
    latitude: -7.2575,
    longitude: 112.7521,
    status: 'active',
    manager: 'Ahmad Wijaya',
  },
];

export default function BranchesPage() {
  const [data, setData] = useState<Branch[]>(sampleData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
    latitude: 0,
    longitude: 0,
    status: 'active',
    manager: '',
  });
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: 'name',
      header: 'Branch Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'city',
      header: 'City',
    },
    {
      accessorKey: 'province',
      header: 'Province',
    },
    {
      accessorKey: 'manager',
      header: 'Manager',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('status') === 'active' ? 'default' : 'secondary'}>
          {row.getValue('status')}
        </Badge>
      ),
    },
  ];

  const initMap = useCallback(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    // Ensure Google Maps API is loaded
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      return;
    }

    // Use requestAnimationFrame to ensure this runs after React's render cycle
    requestAnimationFrame(() => {
      const defaultLocation = { lat: -6.1944, lng: 106.8229 };
      const mapInstance = new window.google.maps.Map(mapRef.current!, {
        zoom: 15,
        center: formData.latitude && formData.longitude
          ? { lat: formData.latitude, lng: formData.longitude }
          : defaultLocation,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      const mapMarker = new window.google.maps.Marker({
        position: formData.latitude && formData.longitude
          ? { lat: formData.latitude, lng: formData.longitude }
          : defaultLocation,
        map: mapInstance,
        draggable: true,
      });

      mapMarker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const lat = event.latLng?.lat();
        const lng = event.latLng?.lng();
        if (lat && lng) {
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));
        }
      });

      mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
        const lat = event.latLng?.lat();
        const lng = event.latLng?.lng();
        if (lat && lng) {
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));
          mapMarker.setPosition({ lat, lng });
        }
      });

      setMap(mapInstance);
      setMarker(mapMarker);
    });
  }, [formData.latitude, formData.longitude]);

  const handleAdd = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      phone: '',
      email: '',
      latitude: 0,
      longitude: 0,
      status: 'active',
      manager: '',
    });
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Branch) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (item: Branch) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      setData(data.filter(d => d.id !== item.id));
    }
  };

  const handleSave = () => {
    if (editingItem) {
      setData(data.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData, id: item.id }
          : item
      ));
    } else {
      const newItem: Branch = {
        ...formData as Branch,
        id: Date.now().toString(),
      };
      setData([...data, newItem]);
    }
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const loadGoogleMaps = (callback: () => void) => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is not configured');
      return;
    }

    const existingScript = document.getElementById('googleMapsScript');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'googleMapsScript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = callback;
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      document.body.appendChild(script);
    } else {
      callback();
    }
  };

  // Initialize map when dialog opens
  useEffect(() => {
    if (isDialogOpen && mapRef.current && !map) {
      loadGoogleMaps(initMap);
    }
  }, [isDialogOpen, map, initMap]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <CRUDTable
            data={data}
            columns={columns}
            title="Branches"
            description="Manage all branch locations and information"
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="Search branches..."
            addButtonText="Add Branch"
          />

          {/* Add/Edit Dialog */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsDialogOpen(false);
                setEditingItem(null);
                setMap(null);
                setMarker(null);
              }
            }}
          >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Branch' : 'Add New Branch'}
                </DialogTitle>
                <DialogDescription>
                  Fill in the branch details and select location on the map
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Branch Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Jakarta Branch"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager Name</Label>
                    <Input
                      id="manager"
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      placeholder="e.g., Budi Santoso"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g., Jakarta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      placeholder="e.g., DKI Jakarta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      placeholder="e.g., 10350"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g., (021) 8901234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="branch@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g., -6.1944"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g., 106.8229"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location on Map</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <div
                      ref={mapRef}
                      style={{ width: '100%', height: '400px' }}
                      className="bg-gray-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Click on the map or drag the marker to set the location
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingItem(null);
                      setMap(null);
                      setMarker(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {editingItem ? 'Update' : 'Save'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}