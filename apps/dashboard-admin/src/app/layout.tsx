import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: 'Rwanda Safe — Admin Dashboard',
    description: 'Rwanda Safe System Administration',
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
