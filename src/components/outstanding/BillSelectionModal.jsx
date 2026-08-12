import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BillSelectionModal = ({ 
  isOpen, 
  onClose, 
  party, 
  type,
  onAllocate 
}) => {
  const [selectedBills, setSelectedBills] = useState(new Set());
  const [allocations, setAllocations] = useState({});
  const [totalPayment, setTotalPayment] = useState('');
  const [onAccount, setOnAccount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('bank');
  const [referenceNo, setReferenceNo] = useState('');

  const outstandingBills = useMemo(() => {
    if (!party) return [];
    
    return [
      {
        id: `BILL-${party.partyId}-1`,
        voucherId: `SV${Math.floor(Math.random() * 100)}`,
        voucherNo: `SI-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
        date: '2025-04-07',
        dueDate: '2025-04-22',
        amount: party.notDue || party.totalOutstanding,
        outstanding: party.notDue || party.totalOutstanding,
      },
      ...(party.overdue0to30 > 0 ? [{
        id: `BILL-${party.partyId}-2`,
        voucherId: `SV${Math.floor(Math.random() * 100)}`,
        voucherNo: `SI-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
        date: '2025-03-15',
        dueDate: '2025-04-01',
        amount: party.overdue0to30,
        outstanding: party.overdue0to30,
        daysOverdue: 15,
      }] : []),
      ...(party.overdue31to60 > 0 ? [{
        id: `BILL-${party.partyId}-3`,
        voucherId: `SV${Math.floor(Math.random() * 100)}`,
        voucherNo: `SI-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
        date: '2025-02-20',
        dueDate: '2025-03-07',
        amount: party.overdue31to60,
        outstanding: party.overdue31to60,
        daysOverdue: 45,
      }] : []),
      ...(party.overdue61to90 > 0 ? [{
        id: `BILL-${party.partyId}-4`,
        voucherId: `SV${Math.floor(Math.random() * 100)}`,
        voucherNo: `SI-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
        date: '2025-01-25',
        dueDate: '2025-02-09',
        amount: party.overdue61to90,
        outstanding: party.overdue61to90,
        daysOverdue: 75,
      }] : []),
      ...(party.over90 > 0 ? [{
        id: `BILL-${party.partyId}-5`,
        voucherId: `SV${Math.floor(Math.random() * 100)}`,
        voucherNo: `SI-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
        date: '2024-12-15',
        dueDate: '2024-12-30',
        amount: party.over90,
        outstanding: party.over90,
        daysOverdue: 125,
      }] : []),
    ];
  }, [party]);

  const totalAllocated = useMemo(() => {
    return Object.values(allocations).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [allocations]);

  const remaining = (parseFloat(totalPayment) || 0) - totalAllocated - onAccount;

  const handleBillToggle = (billId) => {
    const newSelected = new Set(selectedBills);
    if (newSelected.has(billId)) {
      newSelected.delete(billId);
      const newAllocations = { ...allocations };
      delete newAllocations[billId];
      setAllocations(newAllocations);
    } else {
      newSelected.add(billId);
      const bill = outstandingBills.find(b => b.id === billId);
      if (bill) {
        setAllocations(prev => ({
          ...prev,
          [billId]: bill.outstanding.toString()
        }));
      }
    }
    setSelectedBills(newSelected);
  };

  const handleAllocationChange = (billId, value) => {
    const bill = outstandingBills.find(b => b.id === billId);
    const maxAmount = bill ? bill.outstanding : 0;
    const newValue = Math.min(parseFloat(value) || 0, maxAmount);
    
    setAllocations(prev => ({
      ...prev,
      [billId]: newValue.toString()
    }));
  };

  const handleAllocateAll = () => {
    if (outstandingBills.length > 0) {
      setTotalPayment(party.totalOutstanding.toString());
      const allSelected = new Set(outstandingBills.map(b => b.id));
      setSelectedBills(allSelected);
      const newAllocations = {};
      outstandingBills.forEach(bill => {
        newAllocations[bill.id] = bill.outstanding.toString();
      });
      setAllocations(newAllocations);
      setOnAccount(0);
    }
  };

  const handleCreateVoucher = () => {
    const allocationData = {
      partyId: party.partyId,
      partyName: party.partyName,
      type: type === 'receivable' ? 'Receipt' : 'Payment',
      amount: parseFloat(totalPayment) || totalAllocated,
      bills: outstandingBills
        .filter(b => selectedBills.has(b.id))
        .map(b => ({
          voucherId: b.voucherId,
          voucherNo: b.voucherNo,
          amount: parseFloat(allocations[b.id]) || 0,
        })),
      onAccount: onAccount,
      paymentMode: paymentMode,
      referenceNo: referenceNo,
      date: new Date().toISOString().split('T')[0],
    };
    
    onAllocate(allocationData);
    
    alert(`✅ ${allocationData.type} voucher created!\n\nAmount: ₹${allocationData.amount.toLocaleString('en-IN')}\nBills allocated: ${allocationData.bills.length}\nOn Account: ₹${allocationData.onAccount.toLocaleString('en-IN')}\n\nVoucher would be saved to backend in production.`);
    
    onClose();
  };

  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

  if (!isOpen || !party) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 border-b border-canvas-faint">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink-default">
                  Record {type === 'receivable' ? 'Receipt' : 'Payment'}
                </h2>
                <p className="text-sm text-ink-muted">{party.partyName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-canvas-subtle rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-ink-muted" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="bg-canvas-subtle rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-ink-muted">Total Outstanding</p>
                <p className="text-lg font-semibold text-ink-default font-mono">
                  {formatCurrency(party.totalOutstanding)}
                </p>
              </div>
              <button
                onClick={handleAllocateAll}
                className="w-full text-sm text-brand-primary hover:text-brand-secondary font-medium"
              >
                Allocate full amount →
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-default mb-2">
                Payment Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">₹</span>
                <input
                  type="number"
                  value={totalPayment}
                  onChange={(e) => setTotalPayment(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-2 border border-canvas-faint rounded-lg text-ink-default focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-ink-default">Outstanding Bills</p>
                <p className="text-xs text-ink-faint">{outstandingBills.length} bills</p>
              </div>
              
              <div className="border border-canvas-faint rounded-lg overflow-hidden">
                <div className="bg-canvas-subtle px-4 py-2">
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-ink-muted">
                    <div className="col-span-1">
                      <input type="checkbox" disabled />
                    </div>
                    <div className="col-span-2">Voucher</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-2 text-right">Outstanding</div>
                    <div className="col-span-2 text-right">Allocate</div>
                    <div className="col-span-1"></div>
                  </div>
                </div>
                
                <div className="divide-y divide-canvas-faint">
                  {outstandingBills.map((bill) => (
                    <div 
                      key={bill.id} 
                      className={`px-4 py-3 hover:bg-canvas-subtle transition-colors ${
                        bill.daysOverdue ? 'bg-red-50' : ''
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={selectedBills.has(bill.id)}
                            onChange={() => handleBillToggle(bill.id)}
                            className="w-4 h-4 text-brand-primary border-canvas-faint rounded focus:ring-brand-primary"
                          />
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm font-mono text-ink-default">{bill.voucherNo}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-ink-muted">{new Date(bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                          {bill.daysOverdue && (
                            <p className="text-xs text-red-600">{bill.daysOverdue}d overdue</p>
                          )}
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="text-sm font-mono text-ink-muted">{formatCurrency(bill.amount)}</p>
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="text-sm font-medium font-mono text-ink-default">
                            {formatCurrency(bill.outstanding)}
                          </p>
                        </div>
                        <div className="col-span-2 text-right">
                          {selectedBills.has(bill.id) && (
                            <input
                              type="number"
                              value={allocations[bill.id] || ''}
                              onChange={(e) => handleAllocationChange(bill.id, e.target.value)}
                              className="w-full px-2 py-1 border border-canvas-faint rounded text-sm font-mono text-right focus:outline-none focus:ring-1 focus:ring-brand-primary"
                              max={bill.outstanding}
                            />
                          )}
                        </div>
                        <div className="col-span-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-ink-faint mb-1">Allocated</p>
                <p className={`text-sm font-semibold font-mono ${totalAllocated > 0 ? 'text-green-600' : 'text-ink-muted'}`}>
                  {formatCurrency(totalAllocated)}
                </p>
              </div>
              <div>
                <label className="text-xs text-ink-faint mb-1">On Account</label>
                <input
                  type="number"
                  value={onAccount}
                  onChange={(e) => setOnAccount(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-canvas-faint rounded text-sm font-mono text-right focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <div>
                <p className="text-xs text-ink-faint mb-1">Remaining</p>
                <p className={`text-sm font-semibold font-mono ${remaining < 0 ? 'text-red-600' : 'text-ink-default'}`}>
                  {formatCurrency(Math.abs(remaining))}
                  {remaining < 0 ? ' excess' : ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink-default mb-2">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 border border-canvas-faint rounded-lg text-ink-default focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-default mb-2">
                  Reference No
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder={paymentMode === 'bank' ? 'NEFT/UTR No' : paymentMode === 'cheque' ? 'Cheque No' : paymentMode === 'upi' ? 'UPI Ref' : ''}
                  className="w-full px-3 py-2 border border-canvas-faint rounded-lg text-ink-default focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-canvas-faint bg-canvas-subtle">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-canvas-faint rounded-lg text-sm font-medium text-ink-muted hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVoucher}
                disabled={totalAllocated === 0 && onAccount === 0}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  totalAllocated === 0 && onAccount === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-brand-primary text-white hover:bg-brand-secondary'
                }`}
              >
                Create {type === 'receivable' ? 'Receipt' : 'Payment'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BillSelectionModal;
