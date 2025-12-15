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
import { Checkbox } from '@/components/ui/checkbox';
import { CRUDTable } from '@/components/CRUDTable';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { usersAPI } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  whatsapp?: string;
  role_custom: string;
  supervisor?: string;
  confirmed: boolean;
  blocked: boolean;
  isApproved: boolean;
  lastLocation?: string;
  createdAt: string;
  updatedAt: string;
}

interface Supervisor {
  id: number;
  documentId: string;
  namasupervisor: string;
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [data, setData] = useState<User[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    role_custom: 'SALES',
    supervisor: '',
    isApproved: false,
    blocked: false,
    confirmed: false,
  });

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, supervisorsResponse] = await Promise.all([
        usersAPI.getSalesUsers(),
        usersAPI.getSupervisors()
      ]);
      setData(usersResponse.data || []);
      setSupervisors(supervisorsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('username')}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">{row.getValue('email')}</div>
      ),
    },
    {
      accessorKey: 'fullName',
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue('fullName') || '-'}</div>
      ),
    },
    {
      accessorKey: 'role_custom',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('role_custom') || '-'}</Badge>
      ),
    },
    {
      accessorKey: 'supervisor',
      header: 'Supervisor',
      cell: ({ row }) => (
        <div className="text-sm">{row.getValue('supervisor') || '-'}</div>
      ),
    },
    {
      accessorKey: 'isApproved',
      header: 'Approved',
      cell: ({ row }) => (
        <Badge variant={row.getValue('isApproved') ? 'default' : 'secondary'}>
          {row.getValue('isApproved') ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      accessorKey: 'confirmed',
      header: 'Confirmed',
      cell: ({ row }) => (
        <Badge variant={row.getValue('confirmed') ? 'default' : 'destructive'}>
          {row.getValue('confirmed') ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      accessorKey: 'blocked',
      header: 'Blocked',
      cell: ({ row }) => (
        <Badge variant={row.getValue('blocked') ? 'destructive' : 'default'}>
          {row.getValue('blocked') ? 'Yes' : 'No'}
        </Badge>
      ),
    },
  ];

  const handleEdit = (item: User) => {
    setEditingItem(item);
    setFormData({
      role_custom: item.role_custom || 'SALES',
      supervisor: item.supervisor || '',
      isApproved: item.isApproved,
      blocked: item.blocked,
      confirmed: item.confirmed,
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      await usersAPI.updateUser(editingItem.id, {
        role_custom: formData.role_custom,
        supervisor: formData.supervisor,
        isApproved: formData.isApproved,
        blocked: formData.blocked,
        confirmed: formData.confirmed,
      });

      setData(data.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData }
          : item
      ));

      setIsEditDialogOpen(false);
      setEditingItem(null);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">
              Manage users with SALES role - Only specific fields can be edited
            </p>
          </div>

          <CRUDTable
            data={data}
            columns={columns}
            title="Sales Users"
            description="Users with SALES role - Dashboard access management"
            onEdit={handleEdit}
            searchPlaceholder="Search users..."
            addButtonText={null as any} // Disable add button - users register via frontend
          />

          {/* Edit User Dialog */}
          <Dialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsEditDialogOpen(false);
                setEditingItem(null);
              }
            }}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit User - {editingItem?.username}</DialogTitle>
                <DialogDescription>
                  Only the following fields can be edited: Role, Supervisor, Approval Status, Confirmation Status, and Blocked Status.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Read-only fields */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Username</Label>
                    <p className="text-sm font-mono">{editingItem?.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-sm font-mono">{editingItem?.email}</p>
                  </div>
                  {editingItem?.fullName && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                      <p className="text-sm">{editingItem.fullName}</p>
                    </div>
                  )}
                  {editingItem?.phone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-sm">{editingItem.phone}</p>
                    </div>
                  )}
                  {editingItem?.whatsapp && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">WhatsApp</Label>
                      <p className="text-sm">{editingItem.whatsapp}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Created</Label>
                    <p className="text-sm">
                      {editingItem?.createdAt ? new Date(editingItem.createdAt).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="role_custom">Role</Label>
                    <Select
                      value={formData.role_custom}
                      onValueChange={(value) => setFormData({ ...formData, role_custom: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SALES">SALES</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supervisor">Supervisor</Label>
                    <Select
                      value={formData.supervisor || ''}
                      onValueChange={(value) => setFormData({ ...formData, supervisor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Supervisor</SelectItem>
                        {supervisors.map((supervisor) => (
                          <SelectItem key={supervisor.documentId} value={supervisor.namasupervisor}>
                            {supervisor.namasupervisor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isApproved"
                        checked={formData.isApproved}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isApproved: checked as boolean })
                        }
                      />
                      <Label htmlFor="isApproved" className="text-sm font-medium">
                        Approved
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="confirmed"
                        checked={formData.confirmed}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, confirmed: checked as boolean })
                        }
                      />
                      <Label htmlFor="confirmed" className="text-sm font-medium">
                        Confirmed
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="blocked"
                        checked={formData.blocked}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, blocked: checked as boolean })
                        }
                      />
                      <Label htmlFor="blocked" className="text-sm font-medium text-red-600">
                        Blocked
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingItem(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Update User
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