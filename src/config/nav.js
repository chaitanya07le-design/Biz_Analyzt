import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  BarChart3,
  AlertCircle,
  Settings,
  Receipt,
  TrendingUp,
  TrendingDown,
  Truck,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  CreditCard,
  Wallet,
  Building2,
  Tags,
  FolderOpen,
  Calculator,
  FileSpreadsheet,
  Clock,
  ShoppingBag,
  UserCheck,
  ArrowRightLeft,
  Percent,
  IndianRupee,
  Map,
} from 'lucide-react'

export const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/vouchers',
    label: 'Vouchers',
    icon: FileText,
    children: [
      { path: '/vouchers/sales', label: 'Sales', icon: TrendingUp },
      { path: '/vouchers/purchase', label: 'Purchase', icon: TrendingDown },
      { path: '/vouchers/receipt', label: 'Receipt', icon: ArrowDownCircle },
      { path: '/vouchers/payment', label: 'Payment', icon: ArrowUpCircle },
      { path: '/vouchers/delivery-note', label: 'Delivery Note', icon: Truck },
      { path: '/vouchers/receipt-note', label: 'Receipt Note', icon: ArrowDownCircle },
      { path: '/vouchers/journal', label: 'Journal', icon: FileSpreadsheet },
      { path: '/vouchers/contra', label: 'Contra', icon: RefreshCw },
      { path: '/vouchers/debit-note', label: 'Debit Note', icon: CreditCard },
      { path: '/vouchers/credit-note', label: 'Credit Note', icon: Wallet },
    ],
  },
  {
    path: '/masters',
    label: 'Masters',
    icon: Users,
    children: [
      { path: '/masters/parties', label: 'Parties', icon: Building2 },
      { path: '/masters/items', label: 'Items', icon: Package },
      { path: '/masters/categories', label: 'Categories', icon: Tags },
      { path: '/masters/groups', label: 'Groups', icon: FolderOpen },
      { path: '/masters/ledgers', label: 'Ledgers', icon: Calculator },
      { path: '/masters/accounts', label: 'Bank/Cash Accounts', icon: Wallet },
    ],
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: BarChart3,
    children: [
      { path: '/reports/balance-sheet', label: 'Balance Sheet', icon: FileSpreadsheet },
      { path: '/reports/profit-loss', label: 'Profit & Loss', icon: TrendingUp },
      { path: '/reports/pending-purchase', label: 'Pending Purchase', icon: ShoppingBag },
      { path: '/reports/pending-sales', label: 'Pending Sales', icon: UserCheck },
      { path: '/reports/ledger', label: 'Ledger', icon: Calculator },
      { path: '/reports/day-book', label: 'Day Book', icon: Clock },
      { path: '/reports/by-ledger', label: 'By Ledger', icon: ArrowRightLeft },
      { path: '/reports/by-item', label: 'By Item', icon: Package },
      { path: '/reports/top', label: 'Top Report', icon: TrendingUp },
      { path: '/reports/expenses', label: 'Expenses', icon: Receipt },
      { path: '/reports/customer', label: 'Customer Report', icon: Users },
      { path: '/reports/stock-aging', label: 'Stock Aging', icon: Package },
      { path: '/reports/stock-status', label: 'Stock Status', icon: Package },
      { path: '/reports/customer-movement', label: 'Customer Movement', icon: Users },
      { path: '/reports/sync-log', label: 'Sync Log', icon: RefreshCw },
      { path: '/reports/trends', label: 'Trend Charts', icon: TrendingUp },
      { path: '/reports/geographic', label: 'Geographic Report', icon: Map },
      { path: '/reports/brands', label: 'Top Brands', icon: Tags },
    ],
  },
  {
    path: '/outstanding',
    label: 'Outstanding',
    icon: AlertCircle,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
  },
]

export function titleForPath(pathname) {
  for (const item of NAV_ITEMS) {
    if (item.path === pathname) {
      return item.label
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.path === pathname) {
          return child.label
        }
      }
    }
  }
  return 'Dashboard'
}

export function findNavItem(pathname) {
  for (const item of NAV_ITEMS) {
    if (item.path === pathname) return item
    if (item.children) {
      const child = item.children.find(c => c.path === pathname)
      if (child) return child
    }
  }
  return null
}
