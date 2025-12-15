'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CRUDTable } from '@/components/CRUDTable';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { vehicleGroupsAPI, categoriesAPI } from '@/services/api';
import { toast } from 'sonner';

interface VehicleGroup {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export default function VehicleGroupsPage() {
  const [data, setData] = useState<VehicleGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VehicleGroup | null>(null);
  const [formData, setFormData] = useState<Partial<VehicleGroup>>({
    name: '',
  });

  // Fetch data from API
  const fetchData = async () => {
    console.log('🚀 [VehicleGroups] fetchData started');
    try {
      setLoading(true);
      console.log('📡 [VehicleGroups] Making parallel API calls...');

      const [vehicleGroupsResponse, categoriesResponse] = await Promise.all([
        vehicleGroupsAPI.find(),
        categoriesAPI.find()
      ]);

      console.log('📊 [VehicleGroups] API Responses received:', {
        vehicleGroups: {
          hasData: !!vehicleGroupsResponse?.data,
          dataCount: vehicleGroupsResponse?.data?.length || 0,
          keys: vehicleGroupsResponse ? Object.keys(vehicleGroupsResponse) : 'null'
        },
        categories: {
          hasData: !!categoriesResponse?.data,
          dataCount: categoriesResponse?.data?.length || 0,
          keys: categoriesResponse ? Object.keys(categoriesResponse) : 'null'
        }
      });

      const vehicleGroupsData = vehicleGroupsResponse.data || [];
      const categoriesData = categoriesResponse.data || [];

      console.log('📋 [VehicleGroups] Setting state:', {
        vehicleGroupsCount: vehicleGroupsData.length,
        categoriesCount: categoriesData.length,
        vehicleGroupsSample: vehicleGroupsData.slice(0, 2),
        categoriesSample: categoriesData.slice(0, 2)
      });

      setData(vehicleGroupsData);
      setCategories(categoriesData);

      console.log('✅ [VehicleGroups] fetchData completed successfully');
    } catch (error) {
      console.error('❌ [VehicleGroups] fetchData failed:', error);
      toast.error('Failed to load vehicle groups');
    } finally {
      setLoading(false);
      console.log('⏳ [VehicleGroups] setLoading(false) - loading complete');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnDef<VehicleGroup>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('id')}</Badge>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Vehicle Group',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
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

  const handleAdd = () => {
    setFormData({
      name: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (item: VehicleGroup) => {
    setEditingItem(item);
    setFormData(item);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (item: VehicleGroup) => {
    if (window.confirm(`Are you sure you want to delete ${item.name} group?`)) {
      try {
        await vehicleGroupsAPI.delete(item.documentId);
        setData(data.filter(d => d.id !== item.id));
        toast.success('Vehicle group deleted successfully');
      } catch (error) {
        console.error('Failed to delete vehicle group:', error);
        toast.error('Failed to delete vehicle group');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        // Edit existing item
        const response = await vehicleGroupsAPI.update(editingItem.documentId, formData);
        setData(data.map(item =>
          item.id === editingItem.id
            ? { ...item, ...response.data }
            : item
        ));
        setIsEditDialogOpen(false);
        toast.success('Vehicle group updated successfully');
      } else {
        // Add new item
        const response = await vehicleGroupsAPI.create(formData);
        setData([...data, response.data]);
        setIsAddDialogOpen(false);
        toast.success('Vehicle group created successfully');
      }
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save vehicle group:', error);
      toast.error('Failed to save vehicle group');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <CRUDTable
            data={data}
            columns={columns}
            title="Vehicle Groups"
            description="Manage vehicle categories and groups"
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="Search vehicle groups..."
            addButtonText="Add Vehicle Group"
          />

          {/* Add/Edit Dialog */}
          <Dialog
            open={isAddDialogOpen || isEditDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsAddDialogOpen(false);
                setIsEditDialogOpen(false);
                setEditingItem(null);
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Vehicle Group' : 'Add New Vehicle Group'}
                </DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? 'Update the vehicle group information below.'
                    : 'Fill in the details for the new vehicle group.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vehicle Group Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., ALL NEW XENIA"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setIsEditDialogOpen(false);
                      setEditingItem(null);
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