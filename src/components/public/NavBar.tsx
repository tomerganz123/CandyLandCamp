'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();
  const { t, language, setLanguage, isRTL } = useI18n();

  const navItems = [
    { href: '/home', label: t('nav.home') },
    { href: '/event', label: t('nav.event') },
    { href: '/camp', label: t('nav.camp') },
    { href: '/gift', label: t('nav.gift') },
    { href: '/kitchen-shifts', label: t('nav.kitchenShifts') },
    { href: '/additional-info', label: t('nav.additionalInfo') },
    { href: '/reports', label: t('nav.reports') },
    { href: '/contact', label: t('nav.contact') },
  ];

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="BABA ZMAN" 
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-orange-600",
                  pathname === item.href
                    ? "text-orange-600 border-b-2 border-orange-600 pb-1"
                    : "text-gray-700"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-600 hover:text-orange-600"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Language toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="text-gray-600 hover:text-orange-600"
              title={language === 'en' ? 'עברית' : 'English'}
            >
              <Globe className="h-5 w-5" />
              <span className="ml-1 text-xs font-bold">
                {language === 'en' ? 'HE' : 'EN'}
              </span>
            </Button>

            {/* Register button */}
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <a 
                href="https://camp-managment-prd.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {t('nav.register')}
              </a>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-orange-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                    pathname === item.href
                      ? "text-orange-600 bg-orange-50"
                      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-orange-100">
                <a
                  href="https://camp-managment-prd.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.register')}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
