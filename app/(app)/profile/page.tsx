'use client';

import type { UserProfile } from '@/lib/core';
import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, FileText, Save, RotateCcw } from 'lucide-react';
import { fetchCurrentProfile, updateProfile } from '@/lib/services/profile';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchCurrentProfile();
        setProfile(data);
        setFullName(data?.full_name ?? '');
        setBio(data?.bio ?? '');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const updated = await updateProfile({ full_name: fullName, bio });
      setProfile(updated);
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[14px] accent-button flex items-center justify-center text-xl font-bold shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? <User size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-medium uppercase tracking-wide mb-0.5">
              <User size={12} /> Profile
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{profile?.full_name || 'Your Profile'}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email ?? ''}</p>
          </div>
        </div>
      </motion.div>

      {loading && (
        <div className="surface-card p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {!loading && !profile && (
        <div className="surface-card p-8 text-center">
          <p className="text-muted-foreground">No authenticated profile found. Please sign in first.</p>
        </div>
      )}

      {profile && !loading && (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          onSubmit={onSave}
          className="space-y-4"
        >
          <div className="surface-card p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Mail size={14} /> Email
            </label>
            <Input value={profile.email} disabled className="opacity-60" />
          </div>

          <div className="surface-card p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <User size={14} /> Full name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="surface-card p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <FileText size={14} /> Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="A short bio..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setFullName(profile.full_name ?? ''); setBio(profile.bio ?? ''); }}
            >
              <RotateCcw size={14} /> Reset
            </Button>
            <Button type="submit">
              <Save size={14} /> Save changes
            </Button>
          </div>
        </motion.form>
      )}

      {message && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-4 text-sm text-center text-muted-foreground">
          {message}
        </motion.div>
      )}
    </div>
  );
}
