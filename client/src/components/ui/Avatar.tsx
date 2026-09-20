import { cn, initials } from '../../lib/utils';

export function Avatar({ name, src, size = 'md', className }: { name?: string; src?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl',
  };
  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />;
  }
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 font-bold text-white',
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}