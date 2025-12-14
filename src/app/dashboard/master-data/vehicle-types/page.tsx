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

interface VehicleType {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  year: string;
  status: 'active' | 'inactive';
  price: number;
}

const sampleData: VehicleType[] = [
  {
    id: '1',
    name: 'Beat FI',
    brand: 'Honda',
    model: 'K81',
    category: 'Matic',
    year: '2024',
    status: 'active',
    price: 17500000,
  },
  {
    id: '2',
    name: 'Vario 160',
    brand: 'Honda',
    model: 'K68J',
    category: 'Matic',
    year: '2024',
    status: 'active',
    price: 26500000,
  },
  {
    id: '3',
    name: 'Nmax',
    brand: 'Yamaha',
    model: 'ABS',
    category: 'Matic',
    year: '2024',
    status: 'active',
    price: 32500000,
  },
  {
    id: '4',
    name: 'Vixion',
    brand: 'Yamaha',
    model: 'V155',
    category: 'Sport',
    year: '2024',
    status: 'active',
    price: 28500000,
  },
  {
    id: '5',
    name: 'Satria F150',
    brand: 'Suzuki',
    model: 'FI',
    category: 'Sport',
    year: '2024',
    status: 'inactive',
    price: 27500000,
  },
];

const brands = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki'];
const categories = ['Matic', 'Sport', 'Bebek', 'Naked'];

export default function VehicleTypesPage() {
  const [data, setData] = useState<VehicleType[]>(sampleData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VehicleType | null>(null);
  const [formData, setFormData] = useState<Partial<VehicleType>>({
    name: '',
    brand: '',
    model: '',
    category: '',
    year: new Date().getFullYear().toString(),
    status: 'active',
    price: 0,
  });

  const columns: ColumnDef<VehicleType>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
    },
    {
      accessorKey: 'model',
      header: 'Model',
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('category')}</Badge>
      ),
    },
    {
      accessorKey: 'year',
      header: 'Year',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('price'));
        const formatted = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
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

  const handleAdd = () => {
    setFormData({
      name: '',
      brand: '',
      model: '',
      category: '',
      year: new Date().getFullYear().toString(),
      status: 'active',
      price: 0,
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (item: VehicleType) => {
    setEditingItem(item);
    setFormData(item);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (item: VehicleType) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      setData(data.filter(d => d.id !== item.id));
    }
  };

  const handleSave = () => {
    if (editingItem) {
      // Edit existing item
      setData(data.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData, id: item.id }
          : item
      ));
      setIsEditDialogOpen(false);
    } else {
      // Add new item
      const newItem: VehicleType = {
        ...formData as VehicleType,
        id: Date.now().toString(),
      };
      setData([...data, newItem]);
      setIsAddDialogOpen(false);
    }
    setEditingItem(null);
  };

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
            onDelete={handleDelete}
            searchPlaceholder="Search vehicle types..."
            addButtonText="Add Vehicle Type"
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
                  {editingItem ? 'Edit Vehicle Type' : 'Add New Vehicle Type'}
                </DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? 'Update the vehicle type information below.'
                    : 'Fill in the details for the new vehicle type.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Beat FI"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select
                      value={formData.brand}
                      onValueChange={(value) => setFormData({ ...formData, brand: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g., K81"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g., 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      placeholder="e.g., 25000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
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