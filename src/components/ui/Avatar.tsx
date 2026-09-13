import { cn, hueFrom, initials } from '@/lib/utils';

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const hue = hueFrom(name);
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        backgroundColor: `hsl(${hue} 45% 38%)`,
      }}
      aria-hidden
    >
      {initials(name) || '?'}
    </div>
  );
}

export function ProduceSwatch({ seed, className }: { seed: string; className?: string }) {
  const hue = hueFrom(seed);
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 38% 88%), hsl(${(hue + 40) % 360} 42% 78%))`,
      }}
    />
  );
}
