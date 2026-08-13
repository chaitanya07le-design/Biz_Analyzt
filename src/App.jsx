import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { DateRangeProvider } from './context/DateRangeContext';
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
import ItemsPage from './pages/ItemsPage';
import Settings from './pages/Settings';
import ComingSoon from './pages/ComingSoon';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import BalanceSheet from './pages/reports/BalanceSheet';
import ProfitLoss from './pages/reports/ProfitLoss';
import DayBook from './pages/reports/DayBook';
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
import SyncLogPage from './pages/reports/SyncLogPage';
import TrendCharts from './pages/reports/TrendCharts';
import GeographicReport from './pages/reports/GeographicReport';
import LedgerStatement from './pages/reports/LedgerStatement';
import PendingOrders from './pages/reports/PendingOrders';
import SalesVouchers from './pages/Vouchers/SalesVouchers';
import PurchaseVouchers from './pages/Vouchers/PurchaseVouchers';
import ReceiptVouchers from './pages/Vouchers/ReceiptVouchers';
import PaymentVouchers from './pages/Vouchers/PaymentVouchers';
import JournalVouchers from './pages/Vouchers/JournalVouchers';
import ContraVouchers from './pages/Vouchers/ContraVouchers';
import DebitNoteVouchers from './pages/Vouchers/DebitNoteVouchers';
import CreditNoteVouchers from './pages/Vouchers/CreditNoteVouchers';
import DeliveryNoteVouchers from './pages/Vouchers/DeliveryNoteVouchers';
import ReceiptNoteVouchers from './pages/Vouchers/ReceiptNoteVouchers';
import Parties from './pages/Masters/Parties';
import Items from './pages/Masters/Items';
import Groups from './pages/Masters/Groups';
import Ledgers from './pages/Masters/Ledgers';
import Categories from './pages/Masters/Categories';
import Accounts from './pages/Masters/Accounts';

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
          {/* Vouchers routes - must come BEFORE :module catch-all */}
          <Route path="vouchers" element={<Navigate to="/vouchers/sales" replace />} />
          <Route path="vouchers/sales" element={<SalesVouchers />} />
          <Route path="vouchers/purchase" element={<PurchaseVouchers />} />
          <Route path="vouchers/receipt" element={<ReceiptVouchers />} />
          <Route path="vouchers/payment" element={<PaymentVouchers />} />
          <Route path="vouchers/journal" element={<JournalVouchers />} />
          <Route path="vouchers/contra" element={<ContraVouchers />} />
          <Route path="vouchers/debit-note" element={<DebitNoteVouchers />} />
          <Route path="vouchers/credit-note" element={<CreditNoteVouchers />} />
          <Route path="vouchers/delivery-note" element={<DeliveryNoteVouchers />} />
          <Route path="vouchers/receipt-note" element={<ReceiptNoteVouchers />} />
          {/* Masters routes - must come BEFORE :module catch-all */}
          <Route path="masters" element={<Navigate to="/masters/parties" replace />} />
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
          <Route path="items/:itemId" element={<ComingSoon />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/balance-sheet" element={<BalanceSheet />} />
          <Route path="reports/profit-loss" element={<ProfitLoss />} />
          <Route path="reports/day-book" element={<DayBook />} />
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
          <Route path="reports/expenses" element={<ExpensesReport />} />
          <Route path="reports/customer" element={<CustomerView />} />
          <Route path="reports/ledger/:ledgerId" element={<LedgerStatement />} />
          <Route path="reports/pending-purchase" element={<PendingOrders type="purchase" />} />
          <Route path="reports/pending-sales" element={<PendingOrders type="sales" />} />
          <Route path="sales-team" element={<ComingSoon />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CompanyProvider>
          <DateRangeProvider>
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
        </DateRangeProvider>
      </CompanyProvider>
    </AuthProvider>
  </Router>
);
}
