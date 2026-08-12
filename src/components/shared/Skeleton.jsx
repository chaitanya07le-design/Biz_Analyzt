import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function Skeleton({ className, variant = 'text', width, height, rounded = 'md' }) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variants = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  };

  return (
    <motion.div
      className={clsx(
        baseClasses,
        variants[variant],
        roundedClasses[rounded],
        className
      )}
      style={{ width, height }}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
}

export function SkeletonText({ lines = 3, className, lastLineWidth = '60%' }) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={clsx(i === lines - 1 && lastLineWidth)}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', className }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <Skeleton
      variant="circular"
      className={clsx(sizes[size], className)}
    />
  );
}

export function SkeletonButton({ size = 'md', className }) {
  const sizes = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32'
  };

  return (
    <Skeleton
      variant="rounded"
      rounded="lg"
      className={clsx(sizes[size], className)}
    />
  );
}
