import { cn } from '../../lib/utils';
import { Star } from 'lucide-react';

export function RatingStars({ value, onChange, size = 'md', readonly = false }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' | 'lg'; readonly?: boolean }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readonly || !onChange}
          onClick={() => onChange?.(i)}
          className={cn('transition-transform', onChange && !readonly && 'hover:scale-110')}
        >
          <Star
            className={cn(
              sizes[size],
              i <= value ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700',
            )}
          />
        </button>
      ))}
    </div>
  );
}