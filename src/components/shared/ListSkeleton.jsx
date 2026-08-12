import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import Skeleton, { SkeletonAvatar, SkeletonText } from './Skeleton';

export default function ListSkeleton({ items = 5, className }) {
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <SkeletonAvatar size="md" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="w-1/3 h-4" />
              <Skeleton variant="text" className="w-1/2 h-3" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton variant="text" className="w-24 h-5" />
              <Skeleton variant="rounded" className="w-16 h-4 rounded-full" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function PartyCardSkeleton({ className }) {
  return (
    <motion.div
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="md" />
          <div className="space-y-1">
            <Skeleton variant="text" className="w-32 h-4" />
            <Skeleton variant="text" className="w-24 h-3" />
          </div>
        </div>
        <Skeleton variant="rounded" className="w-16 h-6 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Skeleton variant="text" className="w-12 h-3" />
          <Skeleton variant="text" className="w-24 h-5" />
        </div>
        <div className="space-y-1">
          <Skeleton variant="text" className="w-12 h-3" />
          <Skeleton variant="text" className="w-20 h-5" />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Skeleton variant="rounded" className="flex-1 h-8 rounded-lg" />
          <Skeleton variant="rounded" className="flex-1 h-8 rounded-lg" />
        </div>
      </div>
    </motion.div>
  );
}

export function AccountCardSkeleton({ className }) {
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
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-32 h-5 mb-2" />
          <Skeleton variant="text" className="w-20 h-3" />
        </div>
      </div>
      <Skeleton variant="text" className="w-full h-8 mb-3" />
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <Skeleton variant="text" className="w-16 h-3" />
          <Skeleton variant="text" className="w-20 h-3" />
        </div>
        <div className="flex justify-between">
          <Skeleton variant="text" className="w-16 h-3" />
          <Skeleton variant="text" className="w-24 h-3" />
        </div>
        <div className="flex justify-between">
          <Skeleton variant="text" className="w-16 h-3" />
          <Skeleton variant="text" className="w-16 h-3" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rounded" className="flex-1 h-9 rounded-lg" />
        <Skeleton variant="rounded" className="h-9 w-9 rounded-lg" />
      </div>
    </motion.div>
  );
}

export function ItemCardSkeleton({ className }) {
  return (
    <motion.div
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700',
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="rounded" className="w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-28 h-4 mb-1" />
          <Skeleton variant="text" className="w-16 h-3" />
        </div>
        <Skeleton variant="rounded" className="w-12 h-6 rounded-full" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="flex justify-between">
          <Skeleton variant="text" className="w-12 h-3" />
          <Skeleton variant="text" className="w-16 h-4" />
        </div>
        <div className="flex justify-between">
          <Skeleton variant="text" className="w-12 h-3" />
          <Skeleton variant="text" className="w-14 h-4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="w-10 h-3" />
          <Skeleton variant="text" className="w-8 h-3" />
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gray-300 dark:bg-gray-600 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '60%' }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function ReportCardSkeleton({ className }) {
  return (
    <motion.div
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-32 h-5 mb-2" />
          <Skeleton variant="text" className="w-48 h-3" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="w-16 h-3" />
          <Skeleton variant="text" className="w-24 h-5" />
        </div>
        <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="flex justify-between">
          <Skeleton variant="rounded" className="w-16 h-6 rounded-full" />
          <Skeleton variant="text" className="w-12 h-3" />
        </div>
      </div>
    </motion.div>
  );
}
