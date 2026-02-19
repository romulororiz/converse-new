'use client';

import { Drawer } from '@/components/ui/Drawer';
import { Chip } from '@/components/ui/Chip';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  genres: string[];
  selectedGenres: string[];
  onToggleGenre: (genre: string) => void;
  onClearAll: () => void;
}

export function FilterDrawer({
  open,
  onClose,
  genres,
  selectedGenres,
  onToggleGenre,
  onClearAll,
}: FilterDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title="Filters" side="right">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Genre & Topic
            </h3>
            {selectedGenres.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Chip
                key={genre}
                variant={selectedGenres.includes(genre) ? 'active' : 'default'}
                onClick={() => onToggleGenre(genre)}
              >
                {genre}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
