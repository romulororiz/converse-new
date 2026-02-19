'use client';

import { ArrowUpDown } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const sortOptions = [
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'newest', label: 'Recently added' },
  { value: 'trending', label: 'Trending' },
  { value: 'most-chatted', label: 'Most chatted' },
];

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  return (
    <Dropdown
      icon={<ArrowUpDown size={14} />}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={sortOptions}
      className={className}
    />
  );
}
