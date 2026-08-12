import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import Skeleton from './Skeleton';

export default function TableSkeleton({ rows = 5, columns = 4, className }) {
  return (
    <motion.div
      className={clsx('bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton variant="text" className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-4">
                    <Skeleton
                      variant="text"
                      className={clsx(
                        colIndex === 0 ? 'w-32' : colIndex === columns - 1 ? 'w-24' : 'w-20'
                      )}
                    />
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export function LedgerTableSkeleton({ className }) {
  return (
    <TableSkeleton
      rows={8}
      columns={6}
      className={className}
    />
  );
}

export function TransactionTableSkeleton({ className }) {
  return (
    <motion.div
      className={clsx('bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3"><Skeleton variant="text" className="h-4 w-24" /></th>
              <th className="px-4 py-3"><Skeleton variant="text" className="h-4 w-28" /></th>
              <th className="px-4 py-3"><Skeleton variant="text" className="h-4 w-32" /></th>
              <th className="px-4 py-3 text-right"><Skeleton variant="text" className="h-4 w-24 ml-auto" /></th>
              <th className="px-4 py-3 text-right"><Skeleton variant="text" className="h-4 w-20 ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <td className="px-4 py-4">
                  <Skeleton variant="rounded" className="w-16 h-5 rounded-full" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton variant="text" className="w-28 h-4" />
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <Skeleton variant="text" className="w-40 h-4" />
                    <Skeleton variant="text" className="w-32 h-3" />
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <Skeleton variant="text" className="w-24 h-4 ml-auto" />
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="space-y-1 flex flex-col items-end">
                    <Skeleton variant="text" className="w-20 h-5" />
                    <Skeleton variant="text" className="w-16 h-3" />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export function VoucherTableSkeleton({ className }) {
  return (
    <motion.div
      className={clsx('bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 w-12"><Skeleton variant="rounded" className="w-4 h-4" /></th>
              <th className="px-4 py-3"><Skeleton variant="text" className="h-4 w-20" /></th>
              <th className="px-4 py-3"><Skeleton variant="text" className="h-4 w-24" /></th>
              <th className="px-4 py-3"><Skeleton variant="text" className="h-4 w-32" /></th>
              <th className="px-4 py-3 text-right"><Skeleton variant="text" className="h-4 w-28 ml-auto" /></th>
              <th className="px-4 py-3"><Skeleton variant="text" className="h-4 w-20" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <td className="px-4 py-3"><Skeleton variant="rounded" className="w-4 h-4" /></td>
                <td className="px-4 py-3"><Skeleton variant="text" className="w-20 h-4" /></td>
                <td className="px-4 py-3"><Skeleton variant="text" className="w-24 h-4" /></td>
                <td className="px-4 py-3"><Skeleton variant="text" className="w-40 h-4" /></td>
                <td className="px-4 py-3 text-right"><Skeleton variant="text" className="w-28 h-5 ml-auto" /></td>
                <td className="px-4 py-3"><Skeleton variant="rounded" className="w-16 h-5 rounded-full" /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
