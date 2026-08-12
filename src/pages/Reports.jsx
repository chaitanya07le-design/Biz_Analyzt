import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  FileSpreadsheet, 
  TrendingUp, 
  ShoppingBag, 
  UserCheck, 
  Calculator, 
  Clock,
  ArrowRightLeft,
  Package,
  Receipt
} from 'lucide-react';

const reportCategories = [
  {
    title: 'Financial Statements',
    reports: [
      { name: 'Balance Sheet', icon: FileSpreadsheet, path: '/reports/balance-sheet', desc: 'Assets, Liabilities & Equity' },
      { name: 'Profit & Loss', icon: TrendingUp, path: '/reports/profit-loss', desc: 'Income & Expenses' },
    ]
  },
  {
    title: 'Transaction Reports',
    reports: [
      { name: 'Day Book', icon: Clock, path: '/reports/day-book', desc: 'All transactions for a day' },
      { name: 'Ledger', icon: Calculator, path: '/reports/ledger', desc: 'Account-wise transactions' },
      { name: 'By Ledger', icon: ArrowRightLeft, path: '/reports/by-ledger', desc: 'Cross-ledger report' },
    ]
  },
  {
    title: 'Item Reports',
    reports: [
      { name: 'By Item', icon: Package, path: '/reports/by-item', desc: 'Item-wise summary' },
      { name: 'Top Report', icon: TrendingUp, path: '/reports/top', desc: 'Top selling items' },
    ]
  },
  {
    title: 'Pending Orders',
    reports: [
      { name: 'Pending Purchase', icon: ShoppingBag, path: '/reports/pending-purchase', desc: 'Purchase orders pending' },
      { name: 'Pending Sales', icon: UserCheck, path: '/reports/pending-sales', desc: 'Sales orders pending' },
    ]
  },
  {
    title: 'Others',
    reports: [
      { name: 'Expenses', icon: Receipt, path: '/reports/expenses', desc: 'Expense breakdown' },
      { name: 'Customer Report', icon: UserCheck, path: '/reports/customer', desc: 'Customer-wise analysis' },
    ]
  },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      {reportCategories.map((category) => (
        <div key={category.title}>
          <h3 className="text-sm font-semibold text-ink-600 mb-3">{category.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.reports.map((report) => (
              <Card key={report.name} className="cursor-pointer hover:border-brand-300 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <report.icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900">{report.name}</div>
                    <div className="text-xs text-ink-600 mt-1">{report.desc}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
