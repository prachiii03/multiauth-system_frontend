import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Role Permission System',
  description: 'Multi-user role and department based permission system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}