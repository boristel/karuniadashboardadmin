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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CRUDTable } from '@/components/CRUDTable';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { vehicleTypesAPI, vehicleGroupsAPI } from '@/services/api';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';

interface VehicleType {
  id: number;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  vehicle_group: string | null | { documentId: string; name: string };
}

interface VehicleGroupData {
  id: number;
  documentId: string;
  name: string;
}

export default function VehicleTypesPage() {
  const [data, setData] = useState<VehicleType[]>([]);
  const [vehicleGroups, setVehicleGroups] = useState<VehicleGroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VehicleType | null>(null);
  const [formData, setFormData] = useState<Partial<VehicleType>>({
    name: '',
    vehicle_group: null,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehicleTypesResponse, vehicleGroupsResponse] = await Promise.all([
        vehicleTypesAPI.find(),
        vehicleGroupsAPI.find(),
      ]);
      setData(vehicleTypesResponse.data || []);
      setVehicleGroups(vehicleGroupsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnDef<VehicleType>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <Badge variant="outline">{row.original.id}</Badge>,
    },
    {
      accessorKey: 'name',
      header: 'Vehicle Type',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'vehicle_group',
      header: 'Vehicle Group',
      cell: ({ row }) => {
        const group = row.original.vehicle_group;
        const displayValue = typeof group === 'object' && group !== null
          ? group.name
          : group;

        return (
          <div className="font-medium">{displayValue || '-'}</div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <div className="text-sm text-gray-600">
            {date.toLocaleDateString()}
          </div>
        );
      },
    },
  ];

  const handleAdd = () => {
    setFormData({
      name: '',
      vehicle_group: null,
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (item: VehicleType) => {
    setEditingItem(item);
    // Handle vehicle_group which might be an object or string
    const vehicleGroupValue = typeof item.vehicle_group === 'object' && item.vehicle_group !== null
      ? item.vehicle_group.name
      : item.vehicle_group;

    setFormData({
      ...item,
      vehicle_group: vehicleGroupValue
    });
    setIsEditDialogOpen(true);
  };

  
  const handleSave = async () => {
    try {
      const dataToSave = {
        name: formData.name,
        vehicle_group: formData.vehicle_group,
      };

      if (editingItem) {
        await vehicleTypesAPI.update(
          editingItem.documentId,
          dataToSave
        );
        toast.success('Vehicle type updated successfully');
      } else {
        await vehicleTypesAPI.create(dataToSave);
        toast.success('Vehicle type created successfully');
      }
      setIsEditDialogOpen(false);
      setIsAddDialogOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save vehicle type:', error);
      toast.error('Failed to save vehicle type');
    }
  };

  const vehicleGroupOptions = vehicleGroups.map((group) => ({
    label: group.name,
    value: group.name,
  }));

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <CRUDTable
            data={data}
            columns={columns}
            title="Vehicle Types"
            description="Manage all vehicle types and models"
            onAdd={handleAdd}
            onEdit={handleEdit}
            searchPlaceholder="Search vehicle types..."
            addButtonText="Add Vehicle Type"
          />

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
                  {editingItem ? 'Edit Vehicle Type' : 'Add New Vehicle Type'}
                </DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? 'Update the vehicle type information below.'
                    : 'Fill in the details for the new vehicle type.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vehicle Type Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., TERIOS R AT"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_group">Vehicle Group</Label>
                  <Combobox
                    options={vehicleGroupOptions}
                    value={typeof formData.vehicle_group === 'string' ? formData.vehicle_group : ''}
                    onChange={(value) => {
                      console.log('VehicleTypes onChange - selected value:', value);
                      console.log('Before update - formData:', formData);
                      setFormData(prev => {
                        const newFormData = { ...prev, vehicle_group: value };
                        console.log('After update - newFormData:', newFormData);
                        return newFormData;
                      });
                    }}
                    placeholder="Select vehicle group..."
                    searchPlaceholder="Search groups..."
                    noResultsMessage="No groups found."
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