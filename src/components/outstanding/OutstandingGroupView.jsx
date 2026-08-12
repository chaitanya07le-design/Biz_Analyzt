import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpandableTree from '../shared/ExpandableTree';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { useCompany } from '../../context/CompanyContext';

const OutstandingGroupView = ({ activeTab }) => {
  const navigate = useNavigate();
  const { currentCompany } = useCompany();
  const { outstandingReceivables, outstandingPayables, parties, ledgers } = useGoogleSheetsData(currentCompany?.id || 'COMP-0001');

  const data = activeTab === 'receivable' ? outstandingReceivables : outstandingPayables;
  const groupType = activeTab === 'receivable' ? 'Sundry Debtors' : 'Sundry Creditors';

  const treeData = useMemo(() => {
    if (!ledgers || ledgers.length === 0) return [];
    
    const relevantLedgers = ledgers.filter(l => 
      l.group === groupType || 
      (l.type === 'asset' && groupType === 'Sundry Debtors') ||
      (l.type === 'liability' && groupType === 'Sundry Creditors')
    );

    const ledgerGroups = new Map();
    
    relevantLedgers.forEach(ledger => {
      const groupName = ledger.group;
      if (!ledgerGroups.has(groupName)) {
        ledgerGroups.set(groupName, {
          id: `group-${groupName}`,
          name: groupName,
          children: [],
        });
      }
      
      const partyOutstanding = data.find(p => {
        const party = parties.find(pt => pt.id === p.partyId);
        return party && party.name === ledger.name;
      });
      
      if (partyOutstanding) {
        ledgerGroups.get(groupName).children.push({
          id: partyOutstanding.partyId,
          name: partyOutstanding.partyName,
          data: partyOutstanding,
        });
      }
    });

    const result = Array.from(ledgerGroups.values()).map(group => {
      const totalOutstanding = group.children.reduce((sum, child) => 
        sum + (child.data?.totalOutstanding || 0), 0
      );
      const totalOverdue = group.children.reduce((sum, child) => 
        sum + (child.data?.totalOutstanding || 0) - (child.data?.notDue || 0), 0
      );
      
      return {
        ...group,
        totalOutstanding,
        totalOverdue,
        partyCount: group.children.length,
      };
    }).sort((a, b) => b.totalOutstanding - a.totalOutstanding);

    return result;
  }, [data, groupType, ledgers, parties]);

  const handlePartyClick = (node) => {
    if (node.data) {
      navigate(`/outstanding/${node.id}`);
    }
  };

  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

  const renderNode = (node, isExpanded) => {
    const isGroup = node.children && node.children.length > 0;
    
    if (isGroup) {
      return (
        <div className="flex items-center justify-between w-full">
          <div>
            <p className="text-sm font-medium text-ink-default">{node.name}</p>
            <p className="text-xs text-ink-faint">{node.partyCount} parties</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-ink-default font-mono">
              {formatCurrency(node.totalOutstanding)}
            </p>
            {node.totalOverdue > 0 && (
              <p className="text-xs text-red-600 font-mono">
                Overdue: {formatCurrency(node.totalOverdue)}
              </p>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-between w-full pr-4">
        <p className="text-sm text-ink-default">{node.name}</p>
        <div className="text-right">
          <p className="text-sm font-medium text-ink-default font-mono">
            {formatCurrency(node.data?.totalOutstanding || 0)}
          </p>
          {node.data && node.data.totalOutstanding > node.data.notDue && (
            <p className="text-xs text-red-600 font-mono">
              Overdue: {formatCurrency(node.data.totalOutstanding - node.data.notDue)}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (treeData.length === 0) {
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
          {treeData.length} group{treeData.length !== 1 ? 's' : ''}
        </p>
        <p className="text-sm font-semibold text-ink-default font-mono">
          Total: {formatCurrency(treeData.reduce((sum, g) => sum + g.totalOutstanding, 0))}
        </p>
      </div>
      
      <ExpandableTree
        data={treeData}
        renderNode={renderNode}
        onNodeClick={handlePartyClick}
      />
    </div>
  );
};

export default OutstandingGroupView;
