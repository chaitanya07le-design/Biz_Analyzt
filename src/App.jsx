import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { DateRangeProvider } from './context/DateRangeContext';
import { SettingsProvider } from './context/SettingsContext';
import Login from './pages/Login';
import CompanySelection from './pages/CompanySelection';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import VoucherDetail from './pages/VoucherDetail';
import PartyStatement from './pages/PartyStatement';
import LedgerDetail from './pages/Masters/LedgerDetail';
import ReportPage from './pages/ReportPage';
import CashBankPage from './pages/CashBankPage';
import Outstanding from './pages/Outstanding';
import ReportsPage from './pages/ReportsPage';
import MastersPage from './pages/MastersPage';
import VouchersPage from './pages/VouchersPage';
import ItemsPage from './pages/ItemsPage';
import Settings from './pages/Settings';
import ComingSoon from './pages/ComingSoon';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import BalanceSheet from './pages/reports/BalanceSheet';
import ProfitLoss from './pages/reports/ProfitLoss';
import DayBook from './pages/reports/DayBook';
import DayBookMonth from './pages/reports/DayBookMonth';
import TallyVoucherDetail from './pages/TallyVoucherDetail';
import LedgerReport from './pages/reports/LedgerReport';
import ByLedger from './pages/reports/ByLedger';
import ByItem from './pages/reports/ByItem';
import TopReport from './pages/reports/TopReport';
import ExpensesReport from './pages/reports/ExpensesReport';
import CustomerView from './pages/reports/CustomerView';
import TopBrands from './pages/reports/TopBrands';
import StockAging from './pages/reports/StockAging';
import CustomerMovementReport from './pages/reports/CustomerMovementReport';
import StockStatusReport from './pages/reports/StockStatusReport';
import StockDetail from './pages/StockDetail';
import SyncLogPage from './pages/reports/SyncLogPage';
import TrendCharts from './pages/reports/TrendCharts';
import GeographicReport from './pages/reports/GeographicReport';
import GeographicStateDetail from './pages/reports/GeographicStateDetail';
import LedgerStatement from './pages/reports/LedgerStatement';
import PendingOrders from './pages/reports/PendingOrders';
import PendingOrderDetail from './pages/reports/PendingOrderDetail';
import VoucherAudit from './pages/Reports/VoucherAudit';
import SalesQuotations from './pages/Reports/SalesQuotations';
import CustomerPurchaseHistory from './pages/Reports/CustomerPurchaseHistory';
import SalesRegister from './pages/Reports/SalesRegister';
import VendorPurchaseHistory from './pages/Reports/VendorPurchaseHistory';
import GstReconciliation from './pages/Reports/GstReconciliation';
import ReimbursementAudit from './pages/Reports/ReimbursementAudit';
import StockBatchesPage from './pages/analytics/StockBatchesPage';
import ItemStockStatusPage from './pages/analytics/ItemStockStatusPage';
import CustomerMovementPage from './pages/analytics/CustomerMovementPage';
import VoucherListView from './pages/Vouchers/VoucherListView';
import PartyWiseSales from './pages/Vouchers/PartyWiseSales';
import ItemWiseSales from './pages/Vouchers/ItemWiseSales';
import Parties from './pages/Masters/Parties';
import Items from './pages/Masters/Items';
import Groups from './pages/Masters/Groups';
import Ledgers from './pages/Masters/Ledgers';
import Categories from './pages/Masters/Categories';
import Accounts from './pages/Masters/Accounts';
import ShareSettings from './pages/Settings/ShareSettings';
import OutstandingSettings from './pages/Settings/OutstandingSettings';
import AutoReminderSettings from './pages/Settings/AutoReminderSettings';
import DataEntrySettings from './pages/Settings/DataEntrySettings';
import NotificationSettings from './pages/Settings/NotificationSettings';
import StockItemSettings from './pages/Settings/StockItemSettings';
import DateSettings from './pages/Settings/DateSettings';
import DefaultScreenSettings from './pages/Settings/DefaultScreenSettings';
import CurrencySettings from './pages/Settings/CurrencySettings';
import GstLiability from './pages/Reports/GstLiability';
import GstMonthDetail from './pages/Reports/GstMonthDetail';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-canvas">
        <div className="text-ink-600">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          <ErrorBoundary>
            <Login />
          </ErrorBoundary>
        } />
        <Route
          path="/company-selection"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <CompanySelection />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="voucher/:voucherId" element={<VoucherDetail />} />
          <Route path="tally-voucher/:voucherType/*" element={<TallyVoucherDetail />} />
          {/* Vouchers routes - must come BEFORE :module catch-all */}
          <Route path="vouchers" element={<VouchersPage />} />
          <Route path="vouchers/sales" element={<VoucherListView type="sales" />} />
          <Route path="vouchers/purchase" element={<VoucherListView type="purchase" />} />
          <Route path="vouchers/receipt" element={<VoucherListView type="receipt" />} />
          <Route path="vouchers/payment" element={<VoucherListView type="payment" />} />
          <Route path="vouchers/journal" element={<VoucherListView type="journal" />} />
          <Route path="vouchers/contra" element={<VoucherListView type="contra" />} />
          <Route path="vouchers/debit-note" element={<VoucherListView type="debit-note" />} />
          <Route path="vouchers/credit-note" element={<VoucherListView type="credit-note" />} />
          <Route path="vouchers/delivery-note" element={<VoucherListView type="delivery-note" />} />
          <Route path="vouchers/receipt-note" element={<VoucherListView type="receipt-note" />} />
          <Route path="vouchers/party-wise-sales" element={<PartyWiseSales />} />
          <Route path="vouchers/item-wise-sales" element={<ItemWiseSales />} />
          {/* Masters routes - must come BEFORE :module catch-all */}
          <Route path="masters" element={<MastersPage />} />
          <Route path="masters/parties" element={<Parties />} />
          <Route path="masters/items" element={<Items />} />
          <Route path="masters/groups" element={<Groups />} />
          <Route path="masters/ledgers" element={<Ledgers />} />
          <Route path="masters/categories" element={<Categories />} />
          <Route path="masters/accounts" element={<Accounts />} />
          <Route path="ledger/:ledgerId" element={<LedgerDetail />} />
          <Route path=":module" element={<ReportPage />} />
          <Route path=":module/:partyId" element={<PartyStatement />} />
          <Route path="cash-bank" element={<CashBankPage />} />
          <Route path="cash-bank/:ledgerId" element={<LedgerDetail />} />
          <Route path="outstanding" element={<Outstanding />} />
          <Route path="outstanding/:partyId" element={<PartyStatement />} />
          <Route path="items" element={<ItemsPage />} />
          <Route path="items/:itemId" element={<StockDetail />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/balance-sheet" element={<BalanceSheet />} />
          <Route path="reports/profit-loss" element={<ProfitLoss />} />
          <Route path="reports/day-book" element={<DayBook />} />
          <Route path="reports/day-book/month/:monthKey" element={<DayBookMonth />} />
          <Route path="reports/ledger" element={<LedgerReport />} />
          <Route path="reports/by-ledger" element={<ByLedger />} />
          <Route path="reports/by-item" element={<ByItem />} />
          <Route path="reports/top" element={<TopReport />} />
          <Route path="reports/brands" element={<TopBrands />} />
          <Route path="reports/stock-aging" element={<StockAging />} />
          <Route path="reports/customer-movement" element={<CustomerMovementReport />} />
          <Route path="reports/stock-status" element={<StockStatusReport />} />
          <Route path="reports/sync-log" element={<SyncLogPage />} />
          <Route path="reports/trends" element={<TrendCharts />} />
          <Route path="reports/geographic" element={<GeographicReport />} />
          <Route path="reports/geographic/:state" element={<GeographicStateDetail />} />
          <Route path="reports/expenses" element={<ExpensesReport />} />
          <Route path="reports/gst-liability" element={<GstLiability />} />
          <Route path="reports/gst-liability/month/:month" element={<GstMonthDetail />} />
          <Route path="reports/customer" element={<CustomerView />} />
          <Route path="reports/ledger/:ledgerId" element={<LedgerDetail />} />
          <Route path="reports/pending-purchase" element={<PendingOrders type="purchase" />} />
          <Route path="reports/pending-sales" element={<PendingOrders type="sales" />} />
          <Route path="reports/pending-sales/:orderNumber" element={<PendingOrderDetail />} />
          <Route path="reports/voucher-audit" element={<VoucherAudit />} />
          <Route path="reports/sales-quotations" element={<SalesQuotations />} />
          <Route path="reports/customer-purchase-history" element={<CustomerPurchaseHistory />} />
          <Route path="reports/sales-register" element={<SalesRegister />} />
          <Route path="reports/vendor-purchase-history" element={<VendorPurchaseHistory />} />
          <Route path="reports/gst-reconciliation" element={<GstReconciliation />} />
          <Route path="reports/reimbursement-audit" element={<ReimbursementAudit />} />
          <Route path="reports/stock-batches" element={<StockBatchesPage />} />
          <Route path="reports/item-stock-status" element={<ItemStockStatusPage />} />
          <Route path="reports/customer-movement-analytics" element={<CustomerMovementPage />} />
          <Route path="sales-team" element={<ComingSoon />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/share" element={<ShareSettings />} />
          <Route path="settings/outstanding" element={<OutstandingSettings />} />
          <Route path="settings/auto-reminder" element={<AutoReminderSettings />} />
          <Route path="settings/data-entry" element={<DataEntrySettings />} />
          <Route path="settings/notification" element={<NotificationSettings />} />
          <Route path="settings/stock-item" element={<StockItemSettings />} />
          <Route path="settings/date" element={<DateSettings />} />
          <Route path="settings/default-screen" element={<DefaultScreenSettings />} />
          <Route path="settings/currency" element={<CurrencySettings />} />
          <Route path="settings/*" element={<ComingSoon />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

// Inner wrapper: gives DateRangeProvider and SettingsProvider access to currentCompany.id
function AppWithSettings({ children }) {
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id;
  return (
    <SettingsProvider companyId={companyId}>
      <DateRangeProvider companyId={companyId}>
        {children}
      </DateRangeProvider>
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CompanyProvider>
          <AppWithSettings>
            <div className="min-h-screen bg-canvas">
              <AppRoutes />
            
            <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none select-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 px-4 py-2 bg-white/90 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(139,92,246,0.15)] border border-white/50"
              >
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                  Powered By
                </span>
                <img
                  src="https://cdn.prod.website-files.com/690ec911550adb97c4a56495/69399fa4c6253325791cd9ce_pucho%20logo.webp"
                  alt="Pucho.ai"
                  className="h-4 w-auto object-contain"
                />
              </motion.div>
            </div>
          </div>
        </AppWithSettings>
      </CompanyProvider>
    </AuthProvider>
  </Router>
);
}
