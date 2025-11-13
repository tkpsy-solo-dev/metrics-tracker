import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { ClientInit } from '../components/ClientInit';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Metrics Tracker',
  description: '汎用メトリクス追跡・可視化ツール',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ClientInit />
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Metrics Tracker
                </h1>
                <nav className="flex gap-4">
                  <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                    ダッシュボード
                  </Link>
                  <Link href="/input" className="text-gray-600 hover:text-gray-900 transition-colors">
                    データ入力
                  </Link>
                  <Link href="/config" className="text-gray-600 hover:text-gray-900 transition-colors">
                    設定
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
