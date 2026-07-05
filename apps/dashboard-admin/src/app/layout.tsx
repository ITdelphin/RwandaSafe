import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Rwanda Safe — Admin Dashboard',
  description: 'Super Admin System Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
