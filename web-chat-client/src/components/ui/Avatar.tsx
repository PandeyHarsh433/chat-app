import { cn } from '../../lib/utils';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
}

export function Avatar({ src, alt, size = 'md', online }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className="relative">
      <img
        src={src || `https://source.unsplash.com/100x100/?portrait&${alt}`}
        alt={alt}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size]
        )}
      />
      {typeof online !== 'undefined' && (
        <span className={cn(
          'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-800',
          size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3',
          online ? 'bg-green-500' : 'bg-gray-400'
        )} />
      )}
    </div>
  );
}