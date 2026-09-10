import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import VoucherHeader from '../components/voucher/VoucherHeader';
import VoucherItemsTable from '../components/voucher/VoucherItemsTable';
import VoucherTaxSummary from '../components/voucher/VoucherTaxSummary';
import VoucherNarration from '../components/voucher/VoucherNarration';
import VoucherJournalEntries from '../components/voucher/VoucherJournalEntries';

const TallyVoucherDetail = () => {
  const params = useParams();
  const navigate = useNavigate();

  // React Router splat (*) captures everything after /tally-voucher/Sales/
  // e.g., "Sales/25-26/1451" or "Payment/NEFT/abc123-voucher-id"
  const voucherType = params.voucherType || 'Sales';
  const rawSplat = params['*'] || '';
  const decodedSplat = decodeURIComponent(rawSplat);

  // voucherId is only present in URLs from ExpensesReport (composite key with |) or as a UUID
  // URLs like "Purchase/78/24-25" have no voucherId — the / is part of the voucher number
  const lastSlash = decodedSplat.lastIndexOf('/');
  let voucherNo, voucherId;
  if (lastSlash > 0) {
    const lastPart = decodedSplat.slice(lastSlash + 1);
    // A voucherId is either a composite key (contains |) or a UUID (contains -)
    const looksLikeVoucherId = lastPart.includes('|') || (lastPart.includes('-') && lastPart.length > 30);
    if (looksLikeVoucherId) {
      voucherNo = decodedSplat.slice(0, lastSlash);
      voucherId = lastPart;
    } else {
      voucherNo = decodedSplat;
      voucherId = null;
    }
  } else {
    voucherNo = decodedSplat;
    voucherId = null;
  }

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!voucherNo) return;
    setLoading(true);
    api.getTallyVoucherDetail(voucherNo, voucherType, voucherId)
      .then((data) => {
        if (active) {
          setVoucher(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Failed to load voucher');
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [voucherNo, voucherType, voucherId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-default flex items-center justify-center">
        <div className="text-ink-muted">Loading...</div>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="min-h-screen bg-canvas-default flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-muted mb-4">{error || 'Voucher not found'}</p>
          <button onClick={() => navigate(-1)} className="text-brand-primary hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const hasTax = ['Sales', 'Purchase'].includes(voucherType);
  const netAmount = voucher.netAmount || 0;

  return (
    <div className="min-h-screen bg-canvas-default pb-20 md:pb-6">
      <VoucherHeader
        voucher={{
          type: voucherType,
          voucherNo: voucher.voucherNo,
          date: voucher.date,
          partyName: voucher.party || '—',
          status: voucher.status || 'POSTED',
          amount: netAmount,
        }}
        onBack={() => navigate(-1)}
      />

      <div className="p-4 md:p-6 space-y-4">
        {/* Line Items (Sales/Purchase with inventory items) */}
        {(voucher.lineItems || []).length > 0 && (
          <VoucherItemsTable items={voucher.lineItems.map((li, idx) => ({
            name: li.itemName || '—',
            hsnSac: voucher.hsnCode || '—',
            qty: li.quantity || 0,
            unit: li.unit || '',
            rate: li.rate || 0,
            amount: li.amount || 0,
            tax: li.gstRate > 0 ? [{ type: (voucher.igst || 0) > 0 ? 'IGST' : 'GST', percent: li.gstRate, amount: li.gstAmount || 0 }] : [],
          }))} showTax={hasTax} />
        )}

        {/* Ledger Entries (Debit Note / Credit Note — Template 54 ledger-level debits/credits) */}
        {(voucher.ledgerEntries || []).length > 0 && (
          <VoucherJournalEntries entries={voucher.ledgerEntries} />
        )}

        {/* Tax Summary for Sales/Purchase */}
        {hasTax && (
          <VoucherTaxSummary
            taxSummary={{
              TaxableValue: voucher.taxableAmount || voucher.grossTotal || 0,
              CGST: voucher.cgst || 0,
              SGST: voucher.sgst || 0,
              IGST: voucher.igst || 0,
              CESS: voucher.cess || 0,
            }}
            grossTotal={voucher.grossTotal || voucher.taxableAmount || 0}
            roundOff={voucher.roundOff || 0}
            netAmount={netAmount}
          />
        )}

        {/* Narration */}
        {voucher.narration && <VoucherNarration narration={voucher.narration} />}

        {/* Extra details */}
        <div className="bg-white rounded-lg border border-canvas-faint p-4">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">Voucher Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-ink-muted">Voucher Number</p>
              <p className="text-sm font-medium text-ink-default">{voucher.voucherNo || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Date</p>
              <p className="text-sm font-medium text-ink-default">{formatDate(voucher.date)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Type</p>
              <p className="text-sm font-medium text-ink-default">{voucherType}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Party</p>
              <p className="text-sm font-medium text-ink-default">{voucher.party || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Status</p>
              <p className="text-sm font-medium text-ink-default">{voucher.status || 'POSTED'}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Net Amount</p>
              <p className="text-sm font-medium text-brand-primary">{formatCurrency(netAmount)}</p>
            </div>
            {voucher.placeOfSupply && (
              <div>
                <p className="text-xs text-ink-muted">Place of Supply</p>
                <p className="text-sm font-medium text-ink-default">{voucher.placeOfSupply}</p>
              </div>
            )}
            {voucher.gstin && (
              <div>
                <p className="text-xs text-ink-muted">GSTIN</p>
                <p className="text-sm font-medium text-ink-default">{voucher.gstin}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TallyVoucherDetail;