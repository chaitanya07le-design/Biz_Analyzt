import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Share2, 
  AlertCircle, 
  Bell, 
  Database, 
  BellRing, 
  Package, 
  Calendar, 
  LayoutDashboard, 
  IndianRupee,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompany } from '../context/CompanyContext';
import useGoogleSheetsData from '../hooks/useGoogleSheetsData';

const settingsItems = [
  { 
    id: 'share', 
    name: 'Share', 
    icon: Share2, 
    desc: 'Share company data with accountants or partners',
    path: '/settings/share'
  },
  { 
    id: 'outstanding', 
    name: 'Outstanding', 
    icon: AlertCircle, 
    desc: 'Configure outstanding receivable/payable settings',
    path: '/settings/outstanding'
  },
  { 
    id: 'auto-reminder', 
    name: 'Auto Reminder', 
    icon: BellRing, 
    desc: 'Set up automatic payment reminders',
    path: '/settings/auto-reminder'
  },
  { 
    id: 'data-entry', 
    name: 'Data Entry', 
    icon: Database, 
    desc: 'Customize default values for voucher entry',
    path: '/settings/data-entry'
  },
  { 
    id: 'notification', 
    name: 'Notification', 
    icon: Bell, 
    desc: 'Manage notification preferences',
    path: '/settings/notification'
  },
  { 
    id: 'stock-item', 
    name: 'Stock Item', 
    icon: Package, 
    desc: 'Configure stock and inventory settings',
    path: '/settings/stock-item'
  },
  { 
    id: 'date', 
    name: 'Date Settings', 
    icon: Calendar, 
    desc: 'Set financial year and date preferences',
    path: '/settings/date'
  },
  { 
    id: 'default-screen', 
    name: 'Default App Screen', 
    icon: LayoutDashboard, 
    desc: 'Choose default landing screen (Dashboard)',
    path: '/settings/default-screen'
  },
  { 
    id: 'currency', 
    name: 'Currency', 
    icon: IndianRupee, 
    desc: 'Set currency and number format',
    path: '/settings/currency'
  },
];

export default function Settings() {
  const { currentCompany } = useCompany();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    connectionStatus,
    sheetsStatus,
    refresh,
    clearCache,
    loading,
  } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await clearCache();
    await refresh();
    setIsRefreshing(false);
  };

  const statusConfig = {
    connected: {
      icon: Cloud,
      color: 'text-green-600',
      bg: 'bg-green-50',
      label: 'Connected',
      badge: 'bg-green-100 text-green-700'
    },
    disconnected: {
      icon: CloudOff,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      label: 'Demo Mode',
      badge: 'bg-yellow-100 text-yellow-700'
    },
    checking: {
      icon: RefreshCw,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      label: 'Checking...',
      badge: 'bg-gray-100 text-gray-700'
    }
  };

  const currentStatus = statusConfig[connectionStatus] || statusConfig.checking;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-2">
          {settingsItems.map((item, index) => (
            <Link
              key={item.id}
              to={item.path}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-ink-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-ink-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <item.icon className="w-5 h-5 text-ink-600 group-hover:text-brand-600 transition-colors" />
                </div>
                <div>
                  <div className="font-semibold text-ink-900">{item.name}</div>
                  <div className="text-xs text-ink-600 mt-0.5">{item.desc}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-ink-400 group-hover:text-brand-600 transition-colors" />
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-ink-50 transition-colors rounded-xl"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${currentStatus.bg} flex items-center justify-center`}>
              <StatusIcon className={`w-5 h-5 ${currentStatus.color}`} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-ink-900">Google Sheets Connection</div>
              <div className="text-xs text-ink-600 mt-0.5">
                {currentStatus.label}
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-ink-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-ink-400" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                <div className="border-t border-canvas-faint pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${currentStatus.badge}`}>
                      {connectionStatus === 'connected' ? `${sheetsStatus?.connectedSheets ?? 20}/20 sheets live` : currentStatus.label}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isRefreshing || loading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                  </div>

                  {sheetsStatus?.sheets && connectionStatus === 'connected' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {sheetsStatus.sheets.map((sheet) => (
                        <div
                          key={sheet.name}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${
                            sheet.status === 'connected'
                              ? 'bg-green-50 text-green-800'
                              : 'bg-red-50 text-red-800'
                          }`}
                        >
                          <span>{sheet.status === 'connected' ? '✅' : '❌'}</span>
                          <span className="truncate flex-1">{sheet.name}</span>
                          <span className="text-ink-faint">{sheet.rowCount}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {connectionStatus === 'disconnected' && (
                    <div className="text-sm text-ink-muted bg-yellow-50 p-3 rounded-lg">
                      <p className="font-medium text-yellow-800 mb-1">Demo Mode Active</p>
                      <p className="text-yellow-700">
                        Configure your Google Sheets credentials in <code className="bg-yellow-100 px-1 rounded">backend/.env</code> to connect live data.
                      </p>
                    </div>
                  )}

                  {connectionStatus === 'checking' && (
                    <div className="text-sm text-ink-muted bg-gray-50 p-3 rounded-lg">
                      Checking connection to Google Sheets...
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
