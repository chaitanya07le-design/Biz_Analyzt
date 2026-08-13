import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, XCircle, Clock, Database } from 'lucide-react';
import Skeleton from '../../components/shared/Skeleton';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';

const SyncLogPage = () => {
  const { currentCompany } = useCompany();
  const { syncLog, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const syncStats = useMemo(() => {
    if (!syncLog || syncLog.length === 0) {
      return { lastSync: null, successRate: 0, totalRuns: 0, failedRuns: 0 };
    }

    const companyLogs = syncLog.filter(l => l.CompanyID === (currentCompany?.id || 'COMP-0001'));
    const totalRuns = companyLogs.length;
    const successRuns = companyLogs.filter(l => l.Status === 'Success').length;
    const failedRuns = companyLogs.filter(l => l.Status === 'Failed').length;
    const lastSync = companyLogs.length > 0 ? companyLogs[0] : null;

    return {
      lastSync,
      successRate: totalRuns > 0 ? ((successRuns / totalRuns) * 100).toFixed(1) : 0,
      totalRuns,
      failedRuns,
    };
  }, [syncLog, currentCompany]);

  const recentLogs = useMemo(() => {
    if (!syncLog) return [];
    return syncLog
      .filter(l => l.CompanyID === (currentCompany?.id || 'COMP-0001'))
      .slice(0, 20);
  }, [syncLog, currentCompany]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const s = parseInt(seconds);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  };

  if (loading) {
    return (
      <motion.div className="min-h-screen bg-canvas-default pb-20 md:pb-6">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <Skeleton variant="text" className="w-40 h-7" />
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rounded" className="h-24" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-canvas-default pb-20 md:pb-6"
    >
      <div className="px-4 py-4 md:px-6 md:py-6">
        <motion.div className="mb-6" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-xl md:text-2xl font-semibold text-ink-default">Sync Log</h1>
          <p className="text-sm text-ink-muted mt-1">Data synchronization history and status</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-ink-muted">Last Sync</span>
            </div>
            <div className="text-sm font-medium text-ink-default">
              {syncStats.lastSync ? formatDateTime(syncStats.lastSync.StartTime) : 'Never'}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl p-4 border border-teal-200 bg-teal-light"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              <span className="text-xs text-ink-muted">Success Rate</span>
            </div>
            <div className="text-lg font-bold text-teal-700">{syncStats.successRate}%</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-canvas-faint"
          >
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              <span className="text-xs text-ink-muted">Total Runs</span>
            </div>
            <div className="text-lg font-bold text-ink-default">{syncStats.totalRuns}</div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl p-4 border border-rose-200 bg-rose-light"
          >
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span className="text-xs text-ink-muted">Failed</span>
            </div>
            <div className="text-lg font-bold text-rose-700">{syncStats.failedRuns}</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-canvas-faint"
        >
          <div className="px-4 py-3 border-b border-canvas-faint">
            <h3 className="font-medium text-ink-default">Recent Sync Activity</h3>
          </div>

          <div className="divide-y divide-canvas-faint">
            {recentLogs.map((log, idx) => (
              <motion.div
                key={log.LogID}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + idx * 0.02 }}
                className="px-4 py-4 hover:bg-canvas-subtle"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {log.Status === 'Success' ? (
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      <span className="font-medium text-ink-default">{log.WorkflowName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.Status === 'Success' ? 'bg-teal-light text-teal-700' : 'bg-rose-light text-rose-700'
                      }`}>
                        {log.Status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-ink-muted">
                      <span>{formatDateTime(log.StartTime)}</span>
                      <span>Duration: {formatDuration(log.DurationSeconds)}</span>
                      <span>Records: {log.RecordsProcessed || 0}</span>
                    </div>
                    {log.ErrorMessage && (
                      <div className="mt-1 text-xs text-rose-600">
                        Error: {log.ErrorMessage}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {log.TriggerType}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-canvas-faint text-xs text-ink-muted">
            Showing {recentLogs.length} of {syncStats.totalRuns} sync runs
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SyncLogPage;
