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
import { colorsAPI } from '@/services/api';
import { toast } from 'sonner';

interface Color {
  id: number;
  documentId: string;
  colorname: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export default function ColorsPage() {
  const [data, setData] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Color | null>(null);
  const [formData, setFormData] = useState<Partial<Color>>({
    colorname: '',
  });

  const fetchData = async () => {
    console.log('🚀 [Colors] fetchData started');
    try {
      setLoading(true);
      console.log('📡 [Colors] Making API call to colors...');
      const response = await colorsAPI.find();
      console.log('📊 [Colors] API Response received:', {
        hasData: !!response?.data,
        dataCount: response?.data?.length || 0,
        keys: response ? Object.keys(response) : 'null',
      });
      const colorsData = response.data || [];
      console.log('📋 [Colors] Setting state:', {
        colorsCount: colorsData.length,
        colorsSample: colorsData.slice(0, 2),
      });
      setData(colorsData);
      console.log('✅ [Colors] fetchData completed successfully');
    } catch (error) {
      console.error('❌ [Colors] fetchData failed:', error);
      toast.error('Failed to load colors');
    } finally {
      setLoading(false);
      console.log('⏳ [Colors] setLoading(false) - loading complete');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnDef<Color>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <Badge variant="outline">{row.original.id}</Badge>,
    },
    {
      accessorKey: 'colorname',
      header: 'Color Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.colorname}</div>
      ),
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
    console.log('➕ [Colors] handleAdd called');
    setFormData({
      colorname: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (item: Color) => {
    console.log('✏️ [Colors] handleEdit called with item:', item);
    setEditingItem(item);
    setFormData(item);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (item: Color) => {
    console.log('🗑️ [Colors] handleDelete called with item:', item);
    if (window.confirm(`Are you sure you want to delete ${item.colorname}?`)) {
      try {
        await colorsAPI.delete(item.documentId);
        toast.success('Color deleted successfully');
        fetchData(); // Refetch data
      } catch (error) {
        console.error('Failed to delete color:', error);
        toast.error('Failed to delete color');
      }
    }
  };

  const handleSave = async () => {
    console.log('💾 [Colors] handleSave called with formData:', formData);
    try {
      if (editingItem) {
        const dataToUpdate = {
          colorname: formData.colorname,
        };
        await colorsAPI.update(
          editingItem.documentId,
          dataToUpdate
        );
        toast.success('Color updated successfully');
      } else {
        await colorsAPI.create(formData);
        toast.success('Color created successfully');
      }
      setIsEditDialogOpen(false);
      setIsAddDialogOpen(false);
      setEditingItem(null);
      fetchData(); // Refetch data
    } catch (error) {
      console.error('Failed to save color:', error);
      toast.error('Failed to save color');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <CRUDTable
            data={data}
            columns={columns}
            title="Colors"
            description="Manage available vehicle colors"
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="Search colors..."
            addButtonText="Add Color"
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
                  {editingItem ? 'Edit Color' : 'Add New Color'}
                </DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? 'Update the color information below.'
                    : 'Fill in the details for the new color.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="colorname">Color Name</Label>
                  <Input
                    id="colorname"
                    value={formData.colorname || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, colorname: e.target.value })
                    }
                    placeholder="e.g., HIJAU METALIK"
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