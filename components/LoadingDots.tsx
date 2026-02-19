'use client';

export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:240ms]" />
    </div>
  );
}
