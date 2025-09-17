'use client';

import I18nProvider from '@/components/I18nProvider';
import NavBar from '@/components/public/NavBar';
import Footer from '@/components/public/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
