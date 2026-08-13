import React from 'react';

const OutstandingList = ({ 
  parties, 
  activeTab, 
  onPartyClick, 
  onRecordPayment,
  onSendReminder 
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const getDaysOverdue = (party) => {
    if (party.notDue > 0) return 'Not Due';
    if (party.overdue0to30 > 0) return '0-30 days';
    if (party.overdue31to60 > 0) return '31-60 days';
    if (party.overdue61to90 > 0) return '61-90 days';
    if (party.over90 > 0) return '>90 days';
    return '—';
  };

  const getStatusColor = (party) => {
    if (party.notDue > 0 && party.totalOutstanding === party.notDue) {
      return 'bg-ink-50 border-ink-200';
    }
    if (party.over90 > 0) return 'bg-rose-light border-rose-200';
    if (party.overdue61to90 > 0) return 'bg-rose-100 border-rose-200';
    if (party.overdue31to60 > 0) return 'bg-amber-100 border-amber-200';
    if (party.overdue0to30 > 0) return 'bg-amber-light border-amber-200';
    return 'bg-white border-canvas-faint';
  };

  if (parties.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-canvas-faint p-12 text-center">
        <svg className="w-12 h-12 text-ink-faint mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-ink-muted">No outstanding {activeTab === 'receivable' ? 'receivables' : 'payables'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-ink-muted">
          {parties.length} {activeTab === 'receivable' ? 'debtor' : 'creditor'}{parties.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="hidden md:block bg-white rounded-lg border border-canvas-faint overflow-hidden">
        <table className="w-full">
          <thead className="bg-canvas-subtle">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Party</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Not Due</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">0-30</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">31-60</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">61-90</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">&gt;90</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-ink-muted uppercase">Total</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-ink-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-canvas-faint">
            {parties.map(party => (
              <tr 
                key={party.partyId}
                className="hover:bg-canvas-subtle"
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-ink-default">{party.partyName}</p>
                </td>
                <td className="px-4 py-3 text-sm font-mono text-ink-muted">
                  {party.notDue > 0 ? `₹${party.notDue.toLocaleString('en-IN')}` : '—'}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-amber-600">
                  {party.overdue0to30 > 0 ? `₹${party.overdue0to30.toLocaleString('en-IN')}` : '—'}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-amber-700">
                  {party.overdue31to60 > 0 ? `₹${party.overdue31to60.toLocaleString('en-IN')}` : '—'}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-rose-600">
                  {party.overdue61to90 > 0 ? `₹${party.overdue61to90.toLocaleString('en-IN')}` : '—'}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-rose-700 font-medium">
                  {party.over90 > 0 ? `₹${party.over90.toLocaleString('en-IN')}` : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-ink-default font-mono">
                  ₹{party.totalOutstanding.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {activeTab === 'receivable' && onSendReminder && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendReminder(party);
                        }}
                        className="px-2 py-1 text-xs text-amber-700 bg-amber-light hover:bg-amber-100 rounded transition-colors"
                        title="Send Reminder"
                      >
                        📧
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRecordPayment(party);
                      }}
                      className="px-2 py-1 text-xs text-teal-700 bg-teal-light hover:bg-teal-100 rounded transition-colors"
                      title="Record Payment"
                    >
                        ₹
                    </button>
                    <button
                      onClick={() => onPartyClick(party)}
                      className="px-2 py-1 text-xs text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded transition-colors"
                      title="View Details"
                    >
                      →
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {parties.map(party => (
          <div 
            key={party.partyId}
            className={`bg-white rounded-lg border p-4 ${getStatusColor(party)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-ink-default">{party.partyName}</p>
                <p className="text-xs text-ink-faint mt-1">{getDaysOverdue(party)}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-ink-default font-mono">
                  ₹{party.totalOutstanding.toLocaleString('en-IN')}
                </p>
                {party.totalOutstanding > party.notDue && (
                  <p className="text-xs text-rose-600 font-mono mt-1">
                    Overdue: ₹{(party.totalOutstanding - party.notDue).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-canvas-faint">
              {activeTab === 'receivable' && onSendReminder && (
                <button
                  onClick={() => onSendReminder(party)}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-light hover:bg-amber-100 rounded-lg transition-colors"
                >
                  📧 Remind
                </button>
              )}
              <button
                onClick={() => onRecordPayment(party)}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-light hover:bg-teal-100 rounded-lg transition-colors"
              >
                ₹ Record Payment
              </button>
              <button
                onClick={() => onPartyClick(party)}
                className="px-3 py-1.5 text-xs font-medium text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg transition-colors"
              >
                View →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutstandingList;
