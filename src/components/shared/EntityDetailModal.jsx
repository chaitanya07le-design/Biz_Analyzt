import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Mail, FileText, Package, Tags, Building2, Wallet, Calculator, TrendingUp, TrendingDown, FolderOpen } from 'lucide-react';
import api from '../../services/api';
import { useCompany } from '../../context/CompanyContext';

const formatCurrency = (amount) => `₹${Math.abs(amount || 0).toLocaleString('en-IN')}`;

const EntityDetailModal = ({ isOpen, onClose, entityType, entityId, companyId: propCompanyId }) => {
  const { currentCompany } = useCompany();
  const companyId = propCompanyId || currentCompany?.id || 'COMP-0001';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !entityId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let result;
        switch (entityType) {
          case 'party':
            result = await api.getPartyById(entityId, companyId);
            break;
          case 'item':
            result = await api.getItemById(entityId, companyId);
            break;
          case 'category':
            result = await api.getCategoryById(entityId, companyId);
            break;
          case 'group':
            result = await api.getLedgersByGroupId(entityId, companyId);
            break;
          case 'bank':
            result = await api.getBankAccountById(entityId, companyId);
            break;
          case 'cash':
            result = await api.getCashAccountById(entityId, companyId);
            break;
          default:
            throw new Error(`Unknown entity type: ${entityType}`);
        }
        setData(result);
      } catch (err) {
        console.error('Error fetching entity detail:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, entityId, entityType, companyId]);

  if (!isOpen) return null;

  const getTitle = () => {
    switch (entityType) {
      case 'party': return data?.PartyName || 'Party Details';
      case 'item': return data?.ItemName || 'Item Details';
      case 'category': return data?.CategoryName || 'Category Details';
      case 'group': return data?.[0]?.GroupName || data?.GroupName || 'Group Details';
      case 'bank': return data?.BankName || 'Bank Account';
      case 'cash': return data?.AccountName || 'Cash Account';
      default: return 'Details';
    }
  };

  const renderPartyContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-ink-muted mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-ink-default">{data.Address || '—'}</p>
              <p className="text-sm text-ink-muted">{data.City}, {data.State} - {data.PIN}</p>
            </div>
          </div>
          {data.Phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-ink-muted" />
              <p className="text-sm text-ink-default">{data.Phone}</p>
            </div>
          )}
          {data.Email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-ink-muted" />
              <p className="text-sm text-ink-default">{data.Email}</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-ink-muted" />
            <p className="text-sm"><span className="text-ink-muted">GSTIN:</span> {data.GSTIN || '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-muted">Type:</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              data.PartyType === 'Customer' ? 'bg-green-50 text-green-700' :
              data.PartyType === 'Supplier' ? 'bg-amber-50 text-amber-700' :
              'bg-purple-50 text-purple-700'
            }`}>
              {data.PartyType}
            </span>
          </div>
          <p className="text-sm"><span className="text-ink-muted">Credit Limit:</span> {formatCurrency(data.CreditLimit)}</p>
          <p className="text-sm"><span className="text-ink-muted">Credit Days:</span> {data.CreditDays || 0} days</p>
          <p className="text-sm"><span className="text-ink-muted">Balance:</span> <span className={parseFloat(data.OpeningBalance) >= 0 ? 'text-green-700' : 'text-red-600'}>{formatCurrency(data.OpeningBalance)}</span></p>
        </div>
      </div>

      {data.transactions?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-ink-muted uppercase tracking-wider mb-2">Transaction History</h3>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-canvas-faint">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted">Voucher</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted">Type</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {data.transactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-canvas-subtle">
                    <td className="px-3 py-2 text-ink-default">{txn.date}</td>
                    <td className="px-3 py-2 text-ink-muted font-mono">{txn.voucherNo}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        txn.voucherType === 'Sales' ? 'bg-blue-50 text-blue-700' :
                        txn.voucherType === 'Purchase' ? 'bg-orange-50 text-orange-700' :
                        txn.voucherType === 'Receipt' ? 'bg-green-50 text-green-700' :
                        txn.voucherType === 'Payment' ? 'bg-red-50 text-red-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {txn.voucherType}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-ink-default">{formatCurrency(txn.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderItemContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-ink-muted" />
            <p className="text-sm"><span className="text-ink-muted">Unit:</span> {data.Unit || 'Pcs'}</p>
          </div>
          <p className="text-sm"><span className="text-ink-muted">HSN:</span> {data.HSN || '—'}</p>
          <p className="text-sm"><span className="text-ink-muted">GST:</span> {data.GST || 0}%</p>
          <p className="text-sm"><span className="text-ink-muted">Stock:</span> {data.OpeningStock || 0} {data.Unit || 'Pcs'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm"><span className="text-ink-muted">Sale Rate:</span> {formatCurrency(data.SaleRate)}</p>
          <p className="text-sm"><span className="text-ink-muted">Purchase Rate:</span> {formatCurrency(data.PurchaseRate)}</p>
          <p className="text-sm"><span className="text-ink-muted">MRP:</span> {formatCurrency(data.MRP)}</p>
          <p className="text-sm"><span className="text-ink-muted">Location:</span> {data.Location || '—'}</p>
        </div>
      </div>

      {data.purchaseHistory?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> Purchase History
          </h3>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-canvas-faint">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted">Voucher</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Qty</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Rate</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {data.purchaseHistory.map((p, idx) => (
                  <tr key={idx} className="hover:bg-canvas-subtle">
                    <td className="px-3 py-2 text-ink-default">{p.date}</td>
                    <td className="px-3 py-2 text-ink-muted font-mono">{p.voucherNo}</td>
                    <td className="px-3 py-2 text-right text-ink-default">{p.qty}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(p.rate)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.salesHistory?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Sales History
          </h3>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-canvas-faint">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted">Voucher</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Qty</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Rate</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {data.salesHistory.map((s, idx) => (
                  <tr key={idx} className="hover:bg-canvas-subtle">
                    <td className="px-3 py-2 text-ink-default">{s.date}</td>
                    <td className="px-3 py-2 text-ink-muted font-mono">{s.voucherNo}</td>
                    <td className="px-3 py-2 text-right text-ink-default">{s.qty}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(s.rate)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(s.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderCategoryContent = () => (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">{data.Description || 'No description'}</p>

      {data.items?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-2">
            <Package className="w-4 h-4" /> Items ({data.items.length})
          </h3>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-canvas-faint">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted">Name</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Stock</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Rate</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">GST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {data.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-canvas-subtle">
                    <td className="px-3 py-2 text-ink-default">{item.name}</td>
                    <td className="px-3 py-2 text-right text-ink-default">{item.stock} {item.unit}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(item.saleRate)}</td>
                    <td className="px-3 py-2 text-right text-ink-muted">{item.gst}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderGroupContent = () => {
    const ledgers = Array.isArray(data) ? data : [];
    return (
      <div className="space-y-4">
        {ledgers.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-2">
              <FolderOpen className="w-4 h-4" /> Ledgers ({ledgers.length})
            </h3>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-canvas-faint">
              <table className="w-full text-sm">
                <thead className="bg-canvas-subtle sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted">Name</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-faint">
                  {ledgers.map((ledger, idx) => (
                    <tr key={idx} className="hover:bg-canvas-subtle">
                      <td className="px-3 py-2 text-ink-default">{ledger.LedgerName || ledger.name || 'Unknown'}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        <span className={parseFloat(ledger.OpeningBalance || 0) >= 0 ? 'text-green-700' : 'text-red-600'}>
                          {formatCurrency(ledger.OpeningBalance || 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-ink-muted">No ledgers in this group</div>
        )}
      </div>
    );
  };

  const renderBankContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-ink-muted" />
            <p className="text-sm"><span className="text-ink-muted">Bank:</span> {data.BankName}</p>
          </div>
          <p className="text-sm"><span className="text-ink-muted">A/C No:</span> {data.AccountNumber || '—'}</p>
          <p className="text-sm"><span className="text-ink-muted">IFSC:</span> {data.IFSC || '—'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm"><span className="text-ink-muted">Branch:</span> {data.BranchName || '—'}</p>
          <p className="text-sm"><span className="text-ink-muted">Type:</span> {data.AccountType || '—'}</p>
          <p className="text-sm"><span className="text-ink-muted">Balance:</span> <span className="font-semibold text-green-700">{formatCurrency(data.OpeningBalance)}</span></p>
        </div>
      </div>

      {data.transactions?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Transactions
          </h3>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-canvas-faint">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted">Voucher</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Debit</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {data.transactions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-canvas-subtle">
                    <td className="px-3 py-2 text-ink-default">{t.date}</td>
                    <td className="px-3 py-2 text-ink-muted font-mono">{t.voucherNo}</td>
                    <td className="px-3 py-2 text-right font-mono text-red-600">{t.debit > 0 ? formatCurrency(t.debit) : '—'}</td>
                    <td className="px-3 py-2 text-right font-mono text-green-600">{t.credit > 0 ? formatCurrency(t.credit) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderCashContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-ink-muted" />
            <p className="text-sm"><span className="text-ink-muted">Account:</span> {data.AccountName}</p>
          </div>
          <p className="text-sm"><span className="text-ink-muted">Location:</span> {data.Location || '—'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm"><span className="text-ink-muted">Balance:</span> <span className="font-semibold text-green-700">{formatCurrency(data.OpeningBalance)}</span></p>
        </div>
      </div>

      {data.transactions?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Transactions
          </h3>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-canvas-faint">
            <table className="w-full text-sm">
              <thead className="bg-canvas-subtle sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-ink-muted">Voucher</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Debit</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-ink-muted">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-faint">
                {data.transactions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-canvas-subtle">
                    <td className="px-3 py-2 text-ink-default">{t.date}</td>
                    <td className="px-3 py-2 text-ink-muted font-mono">{t.voucherNo}</td>
                    <td className="px-3 py-2 text-right font-mono text-red-600">{t.debit > 0 ? formatCurrency(t.debit) : '—'}</td>
                    <td className="px-3 py-2 text-right font-mono text-green-600">{t.credit > 0 ? formatCurrency(t.credit) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-8 text-ink-muted">Loading...</div>;
    }
    if (error) {
      return <div className="text-center py-8 text-red-500">{error}</div>;
    }
    if (!data) {
      return <div className="text-center py-8 text-ink-muted">No data found</div>;
    }

    switch (entityType) {
      case 'party': return renderPartyContent();
      case 'item': return renderItemContent();
      case 'category': return renderCategoryContent();
      case 'group': return renderGroupContent();
      case 'bank': return renderBankContent();
      case 'cash': return renderCashContent();
      default: return <div className="text-ink-muted">Unknown entity type</div>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-line flex-shrink-0">
              <h2 className="text-lg font-semibold text-ink-900">{getTitle()}</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-canvas-default transition-colors"
              >
                <X className="w-5 h-5 text-ink-600" />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto">
              {renderContent()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EntityDetailModal;
