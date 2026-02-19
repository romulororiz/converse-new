'use client';

import { Settings, Bell, Globe, Shield, LogOut } from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    title: 'Account',
    items: [
      { icon: Shield, label: 'Change password', href: '/account/settings' },
      { icon: Globe, label: 'Language & region', href: '#' },
      { icon: Bell, label: 'Notifications', href: '#' },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6 pb-24 md:pb-6">
      <div>
        <div className="flex items-center gap-2 text-primary text-xs font-medium uppercase tracking-wide mb-1">
          <Settings size={13} /> Settings
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account preferences</p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="surface-card overflow-hidden">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 pt-4 pb-2">
            {section.title}
          </h2>
          {section.items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors text-sm"
            >
              <item.icon size={16} className="text-muted-foreground" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      ))}

      <div className="surface-card overflow-hidden">
        <button className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors text-sm text-danger w-full text-left cursor-pointer">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}
