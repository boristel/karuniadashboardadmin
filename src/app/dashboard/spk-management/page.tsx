'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CRUDTable } from '@/components/CRUDTable';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { pdf } from '@react-pdf/renderer';
import SpkDocument from '@/components/SpkDocument';
import { MoreHorizontal, FileText, Download, Eye, Edit, CheckCircle, Clock } from 'lucide-react';

interface SPK {
  id: string;
  spkNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  vehicleType: string;
  vehicleColor: string;
  totalPrice: number;
  paymentType: 'cash' | 'credit';
  dp: number;
  salesName: string;
  status: 'ON PROGRESS' | 'FINISH';
  isEditable: boolean;
  notes?: string;
}

const sampleData: SPK[] = [
  {
    id: '1',
    spkNumber: 'SPK/001/SBM/XII/2025',
    date: '2025-12-13',
    customerName: 'Ahmad Wijaya',
    customerPhone: '0812-3456-7890',
    vehicleType: 'Honda Beat FI',
    vehicleColor: 'Hitam',
    totalPrice: 17500000,
    paymentType: 'credit',
    dp: 5000000,
    salesName: 'Budi Santoso',
    status: 'ON PROGRESS',
    isEditable: true,
  },
  {
    id: '2',
    spkNumber: 'SPK/002/SBM/XII/2025',
    date: '2025-12-12',
    customerName: 'Siti Nurhaliza',
    customerPhone: '0813-2345-6789',
    vehicleType: 'Yamaha Nmax',
    vehicleColor: 'Merah',
    totalPrice: 32500000,
    paymentType: 'cash',
    dp: 32500000,
    salesName: 'Rudi Hermawan',
    status: 'FINISH',
    isEditable: false,
  },
  {
    id: '3',
    spkNumber: 'SPK/003/SBM/XII/2025',
    date: '2025-12-11',
    customerName: 'Budi Pratama',
    customerPhone: '0814-3456-7891',
    vehicleType: 'Honda Vario 160',
    vehicleColor: 'Putih',
    totalPrice: 26500000,
    paymentType: 'credit',
    dp: 8000000,
    salesName: 'Ahmad Wijaya',
    status: 'ON PROGRESS',
    isEditable: true,
  },
];

export default function SpkManagementPage() {
  const [data, setData] = useState<SPK[]>(sampleData);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSpk, setSelectedSpk] = useState<SPK | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [salesFilter, setSalesFilter] = useState('');
  const [spkNumberFilter, setSpkNumberFilter] = useState('');

  const columns: ColumnDef<SPK>[] = [
    {
      accessorKey: 'spkNumber',
      header: 'SPK Number',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('spkNumber')}</div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <div>{date.toLocaleDateString('id-ID')}</div>;
      },
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('customerName')}</div>
          <div className="text-sm text-gray-500">{row.original.customerPhone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'vehicleType',
      header: 'Vehicle',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('vehicleType')}</div>
          <div className="text-sm text-gray-500">{row.original.vehicleColor}</div>
        </div>
      ),
    },
    {
      accessorKey: 'totalPrice',
      header: 'Price',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalPrice'));
        const formatted = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: 'salesName',
      header: 'Sales',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge
            variant={status === 'FINISH' ? 'default' : 'secondary'}
            className={status === 'FINISH' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
          >
            {status === 'FINISH' ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                FINISH
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" />
                ON PROGRESS
              </>
            )}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'isEditable',
      header: 'Editable',
      cell: ({ row }) => (
        <Badge variant={row.getValue('isEditable') ? 'default' : 'secondary'}>
          {row.getValue('isEditable') ? 'Yes' : 'No'}
        </Badge>
      ),
    },
  ];

  const generatePdf = async (spk: SPK) => {
    try {
      const pdfData = {
        spkNumber: spk.spkNumber,
        date: new Date(spk.date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        customer: {
          nama: spk.customerName,
          alamat: '-',
          noHp: spk.customerPhone,
          email: '-',
          ktp: '-',
        },
        sales: {
          nama: spk.salesName,
          noHp: '-',
          email: '-',
        },
        vehicle: {
          type: spk.vehicleType,
          warna: spk.vehicleColor,
          noRangka: '-',
          noMesin: '-',
          tahun: '2024',
          harga: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(spk.totalPrice),
        },
        payment: {
          type: spk.paymentType,
          dp: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(spk.dp),
          tenor: spk.paymentType === 'credit' ? '35 Bulan' : undefined,
          angsuran: spk.paymentType === 'credit' ? 'Rp 650.000' : undefined,
          bunga: spk.paymentType === 'credit' ? '10%' : undefined,
        },
        signatures: {
          spv: 'Drs. H. Joko Widodo',
          sales: spk.salesName,
          customer: spk.customerName,
        },
      };

      const doc = <SpkDocument data={pdfData} />;
      const pdfBlob = await pdf(doc).toBlob();

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${spk.spkNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    }
  };

  const previewPdf = async (spk: SPK) => {
    try {
      const pdfData = {
        spkNumber: spk.spkNumber,
        date: new Date(spk.date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        customer: {
          nama: spk.customerName,
          alamat: '-',
          noHp: spk.customerPhone,
          email: '-',
          ktp: '-',
        },
        sales: {
          nama: spk.salesName,
          noHp: '-',
          email: '-',
        },
        vehicle: {
          type: spk.vehicleType,
          warna: spk.vehicleColor,
          noRangka: '-',
          noMesin: '-',
          tahun: '2024',
          harga: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(spk.totalPrice),
        },
        payment: {
          type: spk.paymentType,
          dp: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(spk.dp),
          tenor: spk.paymentType === 'credit' ? '35 Bulan' : undefined,
          angsuran: spk.paymentType === 'credit' ? 'Rp 650.000' : undefined,
          bunga: spk.paymentType === 'credit' ? '10%' : undefined,
        },
        signatures: {
          spv: 'Drs. H. Joko Widodo',
          sales: spk.salesName,
          customer: spk.customerName,
        },
      };

      const doc = <SpkDocument data={pdfData} />;
      const pdfBlob = await pdf(doc).toBlob();

      // Open in new tab
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error previewing PDF:', error);
      alert('Error previewing PDF');
    }
  };

  const toggleStatus = (spk: SPK) => {
    setData(data.map(item =>
      item.id === spk.id
        ? {
            ...item,
            status: item.status === 'ON PROGRESS' ? 'FINISH' : 'ON PROGRESS',
            isEditable: item.status === 'FINISH' ? true : false,
          }
        : item
    ));
  };

  const toggleEditable = (spk: SPK) => {
    if (spk.status !== 'FINISH') {
      setData(data.map(item =>
        item.id === spk.id
          ? { ...item, isEditable: !item.isEditable }
          : item
      ));
    }
  };

  const filteredData = data.filter(spk => {
    if (dateFilter && !spk.date.includes(dateFilter)) return false;
    if (salesFilter && !spk.salesName.toLowerCase().includes(salesFilter.toLowerCase())) return false;
    if (spkNumberFilter && !spk.spkNumber.toLowerCase().includes(spkNumberFilter.toLowerCase())) return false;
    return true;
  });

  const salesOptions = Array.from(new Set(data.map(s => s.salesName))).map(sales => ({
    value: sales,
    label: sales,
  }));

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SPK Management</h1>
              <p className="text-gray-600">Manage all vehicle orders and generate PDF documents</p>
            </div>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Create New SPK
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total SPK</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.length}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {data.filter(s => s.status === 'ON PROGRESS').length}
                </div>
                <p className="text-xs text-muted-foreground">Active orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Finished</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {data.filter(s => s.status === 'FINISH').length}
                </div>
                <p className="text-xs text-muted-foreground">Completed orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(data.reduce((sum, s) => sum + s.totalPrice, 0))}
                </div>
                <p className="text-xs text-muted-foreground">From all orders</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="dateFilter">Date</Label>
                  <Input
                    id="dateFilter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesFilter">Sales Name</Label>
                  <Select value={salesFilter} onValueChange={setSalesFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All sales" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All sales</SelectItem>
                      {salesOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spkNumberFilter">SPK Number</Label>
                  <Input
                    id="spkNumberFilter"
                    placeholder="Search SPK number"
                    value={spkNumberFilter}
                    onChange={(e) => setSpkNumberFilter(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SPK Table */}
          <Card>
            <CardHeader>
              <CardTitle>SPK List</CardTitle>
              <CardDescription>
                Showing {filteredData.length} of {data.length} orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CRUDTable
                data={filteredData}
                columns={columns}
                title=""
                description=""
                searchPlaceholder=""
                onAdd={undefined}
                onEdit={undefined}
                onDelete={undefined}
              />
            </CardContent>
          </Card>

          {/* View/Edit SPK Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>SPK Details</DialogTitle>
                <DialogDescription>
                  View and manage SPK information
                </DialogDescription>
              </DialogHeader>
              {selectedSpk && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>SPK Number</Label>
                      <Input value={selectedSpk.spkNumber} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input value={selectedSpk.date} disabled />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Customer Name</Label>
                      <Input value={selectedSpk.customerName} disabled={!selectedSpk.isEditable} />
                    </div>
                    <div className="space-y-2">
                      <Label>Customer Phone</Label>
                      <Input value={selectedSpk.customerPhone} disabled={!selectedSpk.isEditable} />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => previewPdf(selectedSpk)} variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview PDF
                    </Button>
                    <Button onClick={() => generatePdf(selectedSpk)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button
                      onClick={() => toggleStatus(selectedSpk)}
                      variant="outline"
                      disabled={!selectedSpk.isEditable}
                    >
                      Change Status to {selectedSpk.status === 'ON PROGRESS' ? 'FINISH' : 'ON PROGRESS'}
                    </Button>
                    <Button
                      onClick={() => toggleEditable(selectedSpk)}
                      variant="outline"
                      disabled={selectedSpk.status === 'FINISH'}
                    >
                      Toggle Editable
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}