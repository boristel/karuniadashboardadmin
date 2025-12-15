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
import { branchesAPI } from '@/services/api';
import { toast } from 'sonner';

interface Branch {
  id: number;
  documentId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  city: string | null;
  province: string | null;
  phone_number: string | null;
  whatsapp_number: string | null;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function BranchesPage() {
  const [data, setData] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    address: '',
    city: '',
    province: '',
    phone_number: '',
    whatsapp_number: '',
    latitude: 0,
    longitude: 0,
  });

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await branchesAPI.find();
      setData(response.data || []);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any | null>(null);
  const [marker, setMarker] = useState<any | null>(null);

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('id')}</Badge>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Branch Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {row.getValue('address')}
        </div>
      ),
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue('city') || '-'}</div>
      ),
    },
    {
      accessorKey: 'phone_number',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue('phone_number') || '-'}</div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return <div className="text-sm text-gray-600">{date.toLocaleDateString()}</div>;
      },
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

      mapMarker.addListener('dragend', (event: any) => {
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

      mapInstance.addListener('click', (event: any) => {
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
      phone_number: '',
      whatsapp_number: '',
      latitude: 0,
      longitude: 0,
    });
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Branch) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (item: Branch) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await branchesAPI.delete(item.documentId);
        setData(data.filter(d => d.id !== item.id));
        toast.success('Branch deleted successfully');
      } catch (error) {
        console.error('Failed to delete branch:', error);
        toast.error('Failed to delete branch');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        // Edit existing item
        const response = await branchesAPI.update(editingItem.documentId, formData);
        setData(data.map(item =>
          item.id === editingItem.id
            ? { ...item, ...response.data }
            : item
        ));
        toast.success('Branch updated successfully');
      } else {
        // Add new item
        const response = await branchesAPI.create(formData);
        setData([...data, response.data]);
        toast.success('Branch created successfully');
      }
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save branch:', error);
      toast.error('Failed to save branch');
    }
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
                <div className="space-y-2">
                  <Label htmlFor="name">Branch Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., KARUNIA SURABAYA"
                  />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g., Surabaya"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      value={formData.province || ''}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      placeholder="e.g., Jawa Timur"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number || ''}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      placeholder="e.g., (021) 8901234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                    <Input
                      id="whatsapp_number"
                      value={formData.whatsapp_number || ''}
                      onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                      placeholder="e.g., 0812-3456-7890"
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