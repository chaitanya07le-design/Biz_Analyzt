import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReportPageHeader from '../components/report/ReportPageHeader';
import ReportSummaryStrip from '../components/report/ReportSummaryStrip';
import ReportList from '../components/report/ReportList';
import GroupByToggle from '../components/shared/GroupByToggle';
import DonutChart from '../components/shared/DonutChart';
import ReportChart from '../components/shared/ReportChart';
import useGoogleSheetsData from '../hooks/useGoogleSheetsData';
import { useCompany } from '../context/CompanyContext';
import { useDateRange } from '../context/DateRangeContext';

const moduleConfig = {
  sales: {
    title: 'Sales',
    voucherType: 'Sales',
    basePath: '/sales',
    summaryItems: (data) => [
      { label: 'Total Bills', value: data.length, isCurrency: false },
      { label: 'Gross Total', value: data.reduce((sum, v) => sum + (v.grossTotal || v.GrossTotal || 0), 0), isCurrency: true },
      { label: 'Outstanding', value: data.reduce((sum, v) => sum + (v.outstanding || v.Outstanding || 0), 0), isCurrency: true, color: 'text-red-600' },
    ],
    columns: [
      { header: 'Party', key: 'partyName', align: 'left' },
      { header: 'Voucher No', key: 'voucherNo', align: 'left', monospace: true },
      { header: 'Date', key: 'date', type: 'date', align: 'left' },
      { header: 'Amount', key: 'netAmount', type: 'currency', align: 'right' },
      { header: 'Outstanding', key: 'outstanding', type: 'currency', align: 'right' },
    ],
  },
  purchase: {
    title: 'Purchase',
    voucherType: 'Purchase',
    basePath: '/purchase',
    summaryItems: (data) => [
      { label: 'Total Bills', value: data.length, isCurrency: false },
      { label: 'Gross Total', value: data.reduce((sum, v) => sum + (v.grossTotal || v.GrossTotal || 0), 0), isCurrency: true },
      { label: 'Outstanding', value: data.reduce((sum, v) => sum + (v.outstanding || v.Outstanding || 0), 0), isCurrency: true, color: 'text-red-600' },
    ],
    columns: [
      { header: 'Party', key: 'partyName', align: 'left' },
      { header: 'Voucher No', key: 'voucherNo', align: 'left', monospace: true },
      { header: 'Date', key: 'date', type: 'date', align: 'left' },
      { header: 'Amount', key: 'netAmount', type: 'currency', align: 'right' },
      { header: 'Outstanding', key: 'outstanding', type: 'currency', align: 'right' },
    ],
  },
  receipt: {
    title: 'Receipt',
    voucherType: 'Receipt',
    basePath: '/receipt',
    summaryItems: (data) => [
      { label: 'Total Receipts', value: data.length, isCurrency: false },
      { label: 'Total Amount', value: data.reduce((sum, v) => sum + (v.grossTotal || v.GrossTotal || 0), 0), isCurrency: true },
    ],
    columns: [
      { header: 'Party', key: 'partyName', align: 'left' },
      { header: 'Voucher No', key: 'voucherNo', align: 'left', monospace: true },
      { header: 'Date', key: 'date', type: 'date', align: 'left' },
      { header: 'Amount', key: 'grossTotal', type: 'currency', align: 'right' },
    ],
  },
  payment: {
    title: 'Payment',
    voucherType: 'Payment',
    basePath: '/payment',
    summaryItems: (data) => [
      { label: 'Total Payments', value: data.length, isCurrency: false },
      { label: 'Total Amount', value: data.reduce((sum, v) => sum + (v.grossTotal || v.GrossTotal || 0), 0), isCurrency: true },
    ],
    columns: [
      { header: 'Party', key: 'partyName', align: 'left' },
      { header: 'Voucher No', key: 'voucherNo', align: 'left', monospace: true },
      { header: 'Date', key: 'date', type: 'date', align: 'left' },
      { header: 'Amount', key: 'grossTotal', type: 'currency', align: 'right' },
    ],
  },
  'sales-order': {
    title: 'Sales Orders',
    voucherType: 'Sales Order',
    basePath: '/sales-order',
    summaryItems: (data) => [
      { label: 'Total Orders', value: data.length, isCurrency: false },
      { label: 'Total Value', value: data.reduce((sum, v) => sum + (v.grossTotal || v.GrossTotal || 0), 0), isCurrency: true },
    ],
    columns: [
      { header: 'Party', key: 'partyName', align: 'left' },
      { header: 'Order No', key: 'voucherNo', align: 'left', monospace: true },
      { header: 'Date', key: 'date', type: 'date', align: 'left' },
      { header: 'Amount', key: 'grossTotal', type: 'currency', align: 'right' },
      { header: 'Status', key: 'status', align: 'left' },
    ],
  },
  'purchase-order': {
    title: 'Purchase Orders',
    voucherType: 'Purchase Order',
    basePath: '/purchase-order',
    summaryItems: (data) => [
      { label: 'Total Orders', value: data.length, isCurrency: false },
      { label: 'Total Value', value: data.reduce((sum, v) => sum + (v.grossTotal || v.GrossTotal || 0), 0), isCurrency: true },
    ],
    columns: [
      { header: 'Party', key: 'partyName', align: 'left' },
      { header: 'Order No', key: 'voucherNo', align: 'left', monospace: true },
      { header: 'Date', key: 'date', type: 'date', align: 'left' },
      { header: 'Amount', key: 'grossTotal', type: 'currency', align: 'right' },
      { header: 'Status', key: 'status', align: 'left' },
    ],
  },
  'delivery-note': {
    title: 'Delivery Notes',
    voucherType: 'Delivery Note',
    basePath: '/delivery-note',
    summaryItems: (data) => [
      { label: 'Total Notes', value: data.length, isCurrency: false },
    ],
    columns: [
      { header: 'Party', key: 'partyName', align: 'left' },
      { header: 'Note No', key: 'voucherNo', align: 'left', monospace: true },
      { header: 'Date', key: 'date', type: 'date', align: 'left' },
      { header: 'Status', key: 'status', align: 'left' },
    ],
  },
  'receipt-note': {
    title: 'Receipt Notes',
    voucherType: 'Receipt Note',
    basePath: '/receipt-note',
    summaryItems: (data) => [
      { label: 'Total Notes', value: data.length, isCurrency: false },
    ],
    columns: [
      { header: 'Party', key: 'partyName', align: 'left' },
      { header: 'Note No', key: 'voucherNo', align: 'left', monospace: true },
      { header: 'Date', key: 'date', type: 'date', align: 'left' },
      { header: 'Status', key: 'status', align: 'left' },
    ],
  },
};

const ReportPage = () => {
  const { module } = useParams();
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { dateRange, setCustomDateRange } = useDateRange();
  const [viewMode, setViewMode] = useState('ledger');

  const config = moduleConfig[module];
  const { vouchers, parties, loading } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const filteredData = useMemo(() => {
    if (!config) return [];
    
    if (!vouchers || vouchers.length === 0) {
      return [];
    }
    
    const voucherData = vouchers.filter(v => 
      (v.VoucherType === config.voucherType || v.voucherType === config.voucherType)
    );
    
    let dateFilteredVouchers = voucherData;
    if (dateRange.startDate && dateRange.endDate) {
      dateFilteredVouchers = voucherData.filter(v => {
        const voucherDate = new Date(v.VoucherDate || v.date);
        return voucherDate >= new Date(dateRange.startDate) && voucherDate <= new Date(dateRange.endDate);
      });
    }
    
    return dateFilteredVouchers.map(v => ({
      id: v.VoucherID || v.id,
      voucherNo: v.VoucherNo || v.voucherNo || '',
      date: v.VoucherDate || v.date,
      partyId: v.PartyID || v.partyId,
      partyName: v.PartyName || v.partyName || '',
      grossTotal: parseFloat(v.GrossTotal || v.grossTotal || 0),
      netAmount: parseFloat(v.NetAmount || v.netAmount || v.GrandTotal || v.grossTotal || 0),
      outstanding: parseFloat(v.Outstanding || v.outstanding || 0),
      status: v.Status || v.status || '',
    }));
  }, [config, vouchers, module, dateRange]);

  const ledgerViewData = useMemo(() => {
    const partyMap = new Map();
    
    filteredData.forEach(v => {
      if (!partyMap.has(v.partyId)) {
        partyMap.set(v.partyId, {
          id: v.partyId,
          partyName: v.partyName,
          totalAmount: 0,
          totalOutstanding: 0,
          billCount: 0,
        });
      }
      
      const party = partyMap.get(v.partyId);
      party.totalAmount += v.netAmount;
      party.totalOutstanding += v.outstanding;
      party.billCount += 1;
    });
    
    return Array.from(partyMap.values()).sort((a, b) => 
      a.partyName.localeCompare(b.partyName)
    );
  }, [filteredData]);

  const billsViewData = useMemo(() => {
    return filteredData.map(v => ({
      id: v.id,
      partyName: v.partyName,
      voucherNo: v.voucherNo,
      date: v.date,
      netAmount: v.netAmount,
      outstanding: v.outstanding,
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredData]);

  const handleDateChange = (start, end) => {
    setCustomDateRange(start, end);
  };

  const handleItemClick = (item) => {
    if (viewMode === 'ledger') {
      navigate(`${config.basePath}/${item.id}`);
    } else {
      navigate(`/voucher/${item.id}`);
    }
  };

  if (!config) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-default pb-20 md:pb-6">
        <div className="p-4 md:p-6">
          <p className="text-ink-muted">Loading {config.title}...</p>
        </div>
      </div>
    );
  }

  const displayData = viewMode === 'ledger' ? ledgerViewData : billsViewData;
  
  const columns = viewMode === 'ledger' 
    ? [
        { header: 'Party', key: 'partyName', align: 'left' },
        { header: 'Bills', key: 'billCount', align: 'left' },
        { header: 'Total Amount', key: 'totalAmount', type: 'currency', align: 'right' },
        { header: 'Outstanding', key: 'totalOutstanding', type: 'currency', align: 'right' },
      ]
    : config.columns;

  const chartData = [
    { name: 'Paid', value: filteredData.reduce((sum, v) => sum + (v.netAmount - v.outstanding), 0), color: '#10B981' },
    { name: 'Outstanding', value: filteredData.reduce((sum, v) => sum + v.outstanding, 0), color: '#EF4444' },
  ];

  const monthlyChartData = useMemo(() => {
    const months = {};
    filteredData.forEach(v => {
      const date = new Date(v.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = (months[monthKey] || 0) + v.netAmount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }));
  }, [filteredData]);

  if (!config) {
    return null;
  }

  return (
    <div className="min-h-screen bg-canvas-default pb-20 md:pb-6">
      <ReportPageHeader 
        title={config.title}
        startDate={dateRange.startDate || '2025-04-01'}
        endDate={dateRange.endDate || new Date().toISOString().split('T')[0]}
        onDateChange={handleDateChange}
      />
      
      <ReportSummaryStrip items={config.summaryItems(filteredData)} />

      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-canvas-faint p-4">
            <p className="text-xs text-ink-faint uppercase tracking-wider mb-3">Monthly Trend</p>
            <ReportChart data={monthlyChartData} height={180} />
          </div>
          
          <div className="bg-white rounded-lg border border-canvas-faint p-4">
            <p className="text-xs text-ink-faint uppercase tracking-wider mb-3">Payment Status</p>
            <DonutChart data={chartData} height={180} />
          </div>
          
          <div className="md:col-span-2 bg-white rounded-lg border border-canvas-faint p-4">
            <p className="text-xs text-ink-faint uppercase tracking-wider mb-3">By Party</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {ledgerViewData.slice(0, 5).map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between py-2 hover:bg-canvas-subtle px-2 rounded cursor-pointer"
                  onClick={() => navigate(`${config.basePath}/${item.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][idx % 5] }}
                    />
                    <span className="text-sm text-ink-default">{item.partyName}</span>
                  </div>
                  <span className="text-sm font-medium text-ink-default">
                    ₹{item.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-muted uppercase tracking-wider">
            {viewMode === 'ledger' ? 'By Party' : 'By Bills'}
          </h2>
          <GroupByToggle view={viewMode} onViewChange={setViewMode} />
        </div>

        <ReportList 
          items={displayData}
          columns={columns}
          viewMode={viewMode}
          basePath={config.basePath}
          onItemClick={handleItemClick}
        />
      </div>
    </div>
  );
};

export default ReportPage;
