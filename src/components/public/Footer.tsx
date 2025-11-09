'use client';

import Link from 'next/link';
import { useI18n } from '@/hooks/useI18n';

export default function Footer() {
  const { t, isRTL } = useI18n();

  const quickLinks = [
    { href: '/home', label: t('nav.home') },
    { href: '/event', label: t('nav.event') },
    { href: '/camp', label: t('nav.camp') },
    { href: '/gift', label: t('nav.gift') },
    { href: '/kitchen-shifts', label: t('nav.kitchenShifts') },
    { href: '/additional-info', label: t('nav.additionalInfo') },
    { href: '/reports', label: t('nav.reports') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-orange-400">
              {isRTL ? 'קנדי לנד' : 'Candy Land'}
            </div>
            <p className="text-gray-300 text-sm">
              {t('footer.description')}
            </p>
            <div className="pt-4">
              <a
                href="https://camp-managment-prd.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                {t('nav.register')}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-400">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy & Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-400">
              {t('footer.privacy')}
            </h3>
            <p className="text-gray-300 text-sm">
              {t('footer.privacyText')}
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="text-orange-400 hover:text-orange-300 transition-colors text-sm font-medium"
              >
                {t('nav.contact')} →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2025 Candy Land. Midburn 2025 Camp.
            </div>
            <div className="text-gray-400 text-sm">
              Built with ❤️ for the Midburn community
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
