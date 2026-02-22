// frontend/app/layout.jsx
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContexts';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './globals.css';
import Sidebar from '@/components/Sidebar';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SaaS Platform',
  description: 'Multi-tenant SaaS with AI documents',
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-6 dark:text-gray-100">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
