import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import Skeleton, { SkeletonAvatar, SkeletonText } from './Skeleton';

export default function CardSkeleton({ className, showAvatar = true, lines = 2 }) {
  return (
    <motion.div
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        {showAvatar && (
          <SkeletonAvatar size="lg" />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4 h-5" />
          <SkeletonText lines={lines} lastLineWidth="50%" />
        </div>
      </div>
    </motion.div>
  );
}

export function StatCardSkeleton({ className }) {
  return (
    <motion.div
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        <Skeleton variant="text" className="w-1/3 h-4" />
        <Skeleton variant="text" className="w-1/2 h-8" />
        <div className="flex gap-2">
          <Skeleton variant="rounded" className="h-6 w-16" />
          <Skeleton variant="text" className="flex-1 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

export function KpiCardSkeleton({ className }) {
  return (
    <motion.div
      className={clsx(
        'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-2/3 h-4 mb-2" />
          <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
      <Skeleton variant="text" className="w-full h-10 mb-2" />
      <div className="flex justify-between">
        <Skeleton variant="text" className="w-1/3 h-4" />
        <Skeleton variant="text" className="w-1/4 h-4" />
      </div>
    </motion.div>
  );
}

export function GridSkeleton({ count = 6, className }) {
  return (
    <div className={clsx('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
