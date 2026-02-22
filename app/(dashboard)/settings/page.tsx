'use client';

import { Settings, Bell, Globe, Shield, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';

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
  const router = useRouter();

  return (
    <div className="max-w-2xl space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-(--neo-accent) mb-2">
          <Settings size={13} />
          <span className="mono text-[10px] font-medium uppercase tracking-[0.18em]">Settings</span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-(--text-primary)">Settings</h1>
        <p className="text-sm text-(--text-muted) mt-0.5">Manage your account preferences</p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="ink-card overflow-hidden p-0">
          <h2 className="mono text-[10px] font-medium text-(--neo-accent) uppercase tracking-[0.15em] px-5 pt-4 pb-3">
            {section.title}
          </h2>
          {section.items.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-(--bg-overlay) transition-colors text-sm group ${
                i < section.items.length - 1 ? 'border-b' : ''
              }`}
              style={i < section.items.length - 1 ? { borderColor: 'var(--border)' } : {}}
            >
              <div className="flex items-center gap-3">
                <item.icon size={15} className="text-(--text-muted) group-hover:text-(--neo-accent) transition-colors" />
                <span className="text-(--text-secondary) group-hover:text-(--text-primary) transition-colors">{item.label}</span>
              </div>
              <ChevronRight size={14} className="text-(--text-muted) group-hover:text-(--neo-accent) transition-colors" />
            </Link>
          ))}
        </div>
      ))}

      {/* Sign out */}
      <div className="ink-card overflow-hidden p-0">
        <button
          onClick={async () => {
            await authClient.signOut();
            router.replace('/auth/sign-in');
          }}
          className="flex items-center gap-3 px-5 py-3.5 hover:bg-(--neo-danger)/8 transition-colors text-sm w-full text-left cursor-pointer group"
        >
          <LogOut size={15} className="text-(--neo-danger)" />
          <span className="text-(--neo-danger)">Sign out</span>
        </button>
      </div>
    </div>
  );
}
