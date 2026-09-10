'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Search, Bookmark, Home } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'ഹോം',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'സ്കന്ധങ്ങൾ',
      href: '/#skandams',
      icon: BookOpen,
      isActive: pathname.startsWith('/skandam'),
    },
    {
      label: 'തിരയുക',
      href: '/search',
      icon: Search,
      isActive: pathname === '/search',
    },
    {
      label: 'ബുക്ക്മാർക്ക്',
      href: '/bookmarks',
      icon: Bookmark,
      isActive: pathname === '/bookmarks',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-devotional-main/95 backdrop-blur border-t border-devotional shadow-lg pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all select-none ${
                item.isActive
                  ? 'text-devotional-accent font-bold scale-105'
                  : 'text-devotional-secondary hover:text-devotional-primary opacity-80'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[11px] leading-none tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
