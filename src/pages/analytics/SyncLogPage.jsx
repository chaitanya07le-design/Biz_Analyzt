import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';
import Skeleton from '../../components/shared/Skeleton';

const SyncLogPage = () => {
  const { currentCompany } = useCompany();
  
  const { syncLog, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const normalizedData = useMemo(() => {
    if (!syncLog || syncLog.length === 0) return [];
    
    return syncLog.map(log => ({
      logId: log.LogID,
      companyId: log.CompanyID,
      workflowId: log.WorkflowID,
      workflowName: log.WorkflowName,
      triggerType: log.TriggerType,
      startTime: log.StartTime,
      endTime: log.EndTime,
      status: log.Status,
      recordsProcessed: parseInt(log.RecordsProcessed) || 0,
      errorMessage: log.ErrorMessage,
      durationSeconds: parseInt(log.DurationSeconds) || 0,
      createdAt: log.CreatedAt,
    }));
  }, [syncLog]);

  const summary = useMemo(() => {
    const total = normalizedData.length;
    const success = normalizedData.filter(l => l.status === 'Success').length;
    const failed = normalizedData.filter(l => l.status === 'Failed').length;
    const totalRecords = normalizedData.reduce((sum, l) => sum + l.recordsProcessed, 0);
    const avgDuration = total > 0 ? Math.round(normalizedData.reduce((sum, l) => sum + l.durationSeconds, 0) / total) : 0;
    
    return { total, success, failed, totalRecords, avgDuration };
  }, [normalizedData]);

  const statusColors = {
    Success: 'bg-green-100 text-green-700',
    Failed: 'bg-red-100 text-red-700',
    Partial: 'bg-yellow-100 text-yellow-700',
  };

  const triggerColors = {
    Scheduled: 'bg-blue-100 text-blue-700',
    Manual: 'bg-purple-100 text-purple-700',
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
        <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
          <Skeleton variant="text" className="w-48 h-7" />
          <Skeleton variant="rounded" className="w-full h-96" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-canvas-default pb-20 md:pb-6">
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
          <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Sync Log</h1>
          <p className="text-sm text-ink-muted mt-1">
            Workflow execution history
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg border border-canvas-faint p-3">
            <p className="text-xs text-ink-muted">Total Runs</p>
            <p className="text-xl font-semibold text-ink-default mt-1">{summary.total}</p>
          </motion.div>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05 }} className="bg-green-50 rounded-lg border border-green-200 p-3">
            <p className="text-xs text-green-600">✓ Success</p>
            <p className="text-xl font-semibold text-green-700 mt-1">{summary.success}</p>
          </motion.div>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-red-50 rounded-lg border border-red-200 p-3">
            <p className="text-xs text-red-600">✗ Failed</p>
            <p className="text-xl font-semibold text-red-700 mt-1">{summary.failed}</p>
          </motion.div>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }} className="bg-white rounded-lg border border-canvas-faint p-3">
            <p className="text-xs text-ink-muted">Records Synced</p>
            <p className="text-xl font-semibold text-ink-default mt-1">{summary.totalRecords.toLocaleString('en-IN')}</p>
          </motion.div>
        </div>

        <div className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle border-b border-canvas-faint">
                <tr>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Workflow</th>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Trigger</th>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Start Time</th>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Duration</th>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Records</th>
                  <th className="text-left px-4 py-3 text-ink-muted font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {normalizedData.map((log, idx) => (
                  <motion.tr
                    key={log.logId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.01 }}
                    className="hover:bg-canvas-subtle transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-ink-default">{log.workflowName}</p>
                        <p className="text-ink-muted text-xs">{log.workflowId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${triggerColors[log.triggerType] || 'bg-gray-100 text-gray-700'}`}>
                        {log.triggerType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted text-xs">{log.startTime}</td>
                    <td className="px-4 py-3 text-ink-muted text-xs">{log.durationSeconds}s</td>
                    <td className="px-4 py-3 text-ink-default">{log.recordsProcessed}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[log.status] || 'bg-gray-100 text-gray-700'}`}>
                        {log.status}
                      </span>
                      {log.errorMessage && (
                        <p className="text-red-600 text-xs mt-1">{log.errorMessage}</p>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {normalizedData.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-ink-muted">No sync logs found</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SyncLogPage;
