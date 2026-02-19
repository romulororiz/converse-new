import type { UserProfile } from '@/lib/core';

export async function fetchCurrentProfile() {
  const response = await fetch('/api/profile', { cache: 'no-store' });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to load profile');
  }

  return data as UserProfile | null;
}

export async function updateProfile(updates: Partial<UserProfile>) {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to update profile');
  }

  return data as UserProfile | null;
}
