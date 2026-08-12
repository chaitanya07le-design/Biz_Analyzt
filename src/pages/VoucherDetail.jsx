import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { withErrorBoundary } from '../components/shared/ErrorBoundary';
import { useCompany } from '../context/CompanyContext';
import api from '../services/api';
import VoucherHeader from '../components/voucher/VoucherHeader';
import VoucherItemsTable from '../components/voucher/VoucherItemsTable';
import VoucherTaxSummary from '../components/voucher/VoucherTaxSummary';
import VoucherNarration from '../components/voucher/VoucherNarration';
import VoucherBillsSection from '../components/voucher/VoucherBillsSection';
import VoucherPaymentDetails from '../components/voucher/VoucherPaymentDetails';
import VoucherJournalEntries from '../components/voucher/VoucherJournalEntries';
import EInvoiceWarningBanner from '../components/voucher/EInvoiceWarningBanner';
import VoucherActionBar from '../components/voucher/VoucherActionBar';

const VoucherDetail = () => {
  const { voucherId } = useParams();
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id || 'COMP-0001';
  
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVoucher = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getVoucherById(voucherId, companyId);
        setVoucher(data);
      } catch (err) {
        console.error('Error fetching voucher:', err);
        setError(err.message || 'Failed to load voucher');
      } finally {
        setLoading(false);
      }
    };

    if (voucherId) {
      fetchVoucher();
    }
  }, [voucherId, companyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-default flex items-center justify-center">
        <div className="text-ink-muted">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas-default flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-brand-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="min-h-screen bg-canvas-default flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-muted mb-4">Voucher not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-brand-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate(-1);
  };

  const voucherType = voucher?.VoucherType || voucher?.type || 'Sales';
  const voucherStatus = voucher?.Status || voucher?.status || 'UNPAID';

  const renderVoucherBody = () => {
    switch (voucherType) {
      case 'Sales':
      case 'Purchase':
        return (
          <div className="space-y-4">
            {(voucher?.EInvoiceStatus !== 'generated' || voucher?.eInvoiceStatus !== 'generated') && (voucherType === 'Sales' || voucherType === 'Purchase') && (
              <EInvoiceWarningBanner 
                voucherType={voucherType} 
                eInvoiceStatus={voucher?.EInvoiceStatus || voucher?.eInvoiceStatus || 'not_generated'} 
              />
            )}
            <VoucherItemsTable items={voucher?.Items || []} showTax={true} />
            <VoucherTaxSummary 
              taxSummary={voucher?.TaxSummary || {}}
              grossTotal={parseFloat(voucher?.GrossTotal) || parseFloat(voucher?.SubTotal) || 0}
              roundOff={parseFloat(voucher?.TaxSummary?.RoundOff || 0)}
              netAmount={parseFloat(voucher?.GrandTotal || voucher?.NetAmount) || 0}
            />
            {(voucher?.Narration) && <VoucherNarration narration={voucher?.Narration} />}
          </div>
        );

      case 'Receipt':
      case 'Payment':
        return (
          <div className="space-y-4">
            <VoucherBillsSection bills={voucher?.Bills || []} />
            <VoucherPaymentDetails paymentDetails={voucher?.PaymentDetails || {}} />
            {(voucher?.Narration) && <VoucherNarration narration={voucher?.Narration} />}
          </div>
        );

      case 'Journal':
        return (
          <div className="space-y-4">
            <VoucherJournalEntries entries={voucher?.Entries || []} />
            {(voucher?.Narration) && <VoucherNarration narration={voucher?.Narration} />}
          </div>
        );

      case 'Sales Order':
      case 'Purchase Order':
      case 'Delivery Note':
      case 'Receipt Note':
        return (
          <div className="space-y-4">
            <VoucherItemsTable items={voucher?.Items || []} showTax={false} />
            {(voucher?.Narration) && <VoucherNarration narration={voucher?.Narration} />}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-canvas-default pb-20 md:pb-6">
      <VoucherHeader voucher={{ ...voucher, type: voucherType, status: voucherStatus }} onBack={handleBack} />
      
      <div className="p-4 md:p-6">
        {renderVoucherBody()}
      </div>

      {(voucherType === 'Sales' || voucherType === 'Receipt') && voucherStatus !== 'PAID' && (
        <VoucherActionBar 
          onRecordPayment={() => console.log('Record payment')}
          onShare={() => console.log('Share')}
          onDownload={() => console.log('Download')}
        />
      )}
    </div>
  );
};

export default withErrorBoundary(VoucherDetail);
