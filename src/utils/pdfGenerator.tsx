import React from 'react';
import { pdf } from '@react-pdf/renderer';
import SpkDocument from '@/components/SpkDocument';
import { saveAs } from 'file-saver';

export interface SpkData {
  spkNumber: string;
  date: string;
  customer: {
    nama: string;
    alamat: string;
    noHp: string;
    email: string;
    ktp: string;
  };
  sales: {
    nama: string;
    noHp: string;
    email: string;
  };
  vehicle: {
    type: string;
    warna: string;
    noRangka: string;
    noMesin: string;
    tahun: string;
    harga: string;
  };
  payment: {
    type: 'cash' | 'credit';
    dp: string;
    tenor?: string;
    angsuran?: string;
    bunga?: string;
  };
  signatures: {
    spv: string;
    sales: string;
    customer: string;
  };
}

export const generateSpkPdf = async (data: SpkData, filename?: string) => {
  try {
    const doc = <SpkDocument data={data} />;
    const blob = await pdf(doc).toBlob();

    const defaultFilename = `SPK-${data.spkNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
    saveAs(blob, filename || defaultFilename);

    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const previewSpkPdf = async (data: SpkData) => {
  try {
    const doc = <SpkDocument data={data} />;
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    return url;
  } catch (error) {
    console.error('Error previewing PDF:', error);
    throw error;
  }
};

// Sample data for testing
export const sampleSpkData: SpkData = {
  spkNumber: 'SPK/001/SBM/XII/2025',
  date: '13 Desember 2025',
  customer: {
    nama: 'Ahmad Wijaya',
    alamat: 'Jl. Merdeka No. 123, Kelurahan Cikarang Selatan, Bekasi, Jawa Barat 17550',
    noHp: '0812-3456-7890',
    email: 'ahmad.wijaya@email.com',
    ktp: '3275031212850001'
  },
  sales: {
    nama: 'Budi Santoso',
    noHp: '0813-2345-6789',
    email: 'budi.santoso@sinarbajamotor.co.id'
  },
  vehicle: {
    type: 'Honda Beat FI CBS',
    warna: 'Hitam',
    noRangka: 'MH1JFC115JK000001',
    noMesin: 'JFC1E-1500001',
    tahun: '2024',
    harga: 'Rp 17.500.000'
  },
  payment: {
    type: 'credit',
    dp: 'Rp 5.000.000',
    tenor: '35 Bulan',
    angsuran: 'Rp 650.000',
    bunga: '10%'
  },
  signatures: {
    spv: 'Drs. H. Joko Widodo',
    sales: 'Budi Santoso',
    customer: 'Ahmad Wijaya'
  }
};