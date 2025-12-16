import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';
import ThemeRegistry from './theme/ThemeRegistry';

export const metadata: Metadata = {
  title: 'Car Dealer Dashboard',
  description: 'Car Dealer Admin Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}