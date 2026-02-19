'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookCoverImageProps {
  src?: string | null;
  alt: string;
  variant?: 'card' | 'fill' | 'header';
  className?: string;
}

export function BookCoverImage({
  src,
  alt,
  variant = 'card',
  className,
}: BookCoverImageProps) {
  const [hasError, setHasError] = useState(false);
  const showFallback = !src || hasError;

  if (variant === 'fill') {
    if (showFallback) {
      return (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-primary/20 via-surface-2 to-surface-1 flex items-center justify-center',
            className,
          )}
        >
          <BookOpen className="w-12 h-12 text-muted-foreground/40" />
        </div>
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn('object-cover', className)}
        onError={() => setHasError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    );
  }

  if (variant === 'header') {
    if (showFallback) {
      return (
        <div
          className={cn(
            'w-16 h-24 bg-gradient-to-br from-primary/30 to-surface-2 rounded-[12px] flex items-center justify-center shadow-md',
            className,
          )}
        >
          <BookOpen className="w-8 h-8 text-primary/60" />
        </div>
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={64}
        height={96}
        className={cn('w-16 h-24 object-cover rounded-[12px] shadow-md', className)}
        onError={() => setHasError(true)}
      />
    );
  }

  if (showFallback) {
    return (
      <div
        className={cn(
          'w-full aspect-[3/4] flex flex-col items-center justify-center',
          'bg-gradient-to-br from-primary/15 via-surface-2 to-surface-1',
          className,
        )}
      >
        <BookOpen size={40} className="text-muted-foreground/40 mb-2" />
        <span className="text-xs text-muted-foreground/50 font-medium px-4 text-center line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('w-full aspect-[3/4] relative', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
