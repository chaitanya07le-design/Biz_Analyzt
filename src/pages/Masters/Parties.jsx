import Card from '../../components/ui/Card';
import EntityDetailModal from '../../components/shared/EntityDetailModal';
import useGoogleSheetsData from '../../hooks/useGoogleSheetsData';
import { Search, Building2 } from 'lucide-react';
import { useState } from 'react';
import useTallyParties from '../../hooks/useTallyParties';
import useTallyPartyDetails from '../../hooks/useTallyPartyDetails';
import VoucherPagination, { DEFAULT_PAGE_SIZE } from '../../components/voucher/VoucherPagination';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
};

export default function Parties() {
  const { parties, loading } = useGoogleSheetsData();
const tallyParties = useTallyParties();
  const tallyPartyDetails = useTallyPartyDetails();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPartyId, setSelectedPartyId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;

  const partiesList = (tallyPartyDetails && tallyPartyDetails.length > 0)
    ? tallyPartyDetails.map((party) => {
        const matchingSheetParty = (parties || []).find(
          (sheetParty) => (sheetParty.PartyName || '').trim().toLowerCase() === (party.name || '').trim().toLowerCase(),
        );
        return {
          PartyID: matchingSheetParty?.PartyID || party.id,
          PartyName: party.name,
          PartyType: party.type,
          GSTIN: party.gstin,
          Address: party.address,
          Phone: party.mobile,
          Email: party.email,
          OpeningBalance: party.balance,
          City: party.city || '',
          State: party.state || '',
          PIN: party.pin || '',
          PAN: party.pan || '',
          CreditLimit: party.creditLimit || 0,
          CreditDays: party.creditDays || 0,
          SalesPerson: party.salesPerson || '',
          Status: party.status || 'Active',
          ContactPerson: party.contactPerson || '',
          IncomeTaxNumber: party.incomeTaxNumber || '',
          ParentGroup: party.parentGroup || '',
        };
      })
    : tallyParties
    ? tallyParties.map((party) => {
        const matchingSheetParty = (parties || []).find(
          (sheetParty) => (sheetParty.PartyName || '').trim().toLowerCase() === (party.name || '').trim().toLowerCase(),
        );

        return {
          PartyID: matchingSheetParty?.PartyID || party.id,
          PartyName: party.name,
          PartyType: party.type,
          GSTIN: party.gstin,
          Address: party.address,
          Phone: party.mobile,
          Email: party.email,
          OpeningBalance: party.balance,
        };
      })
    : (parties || []);

  const filtered = partiesList.filter(p => {
    const name = p.PartyName || p.name || '';
    const city = p.City || p.city || '';
    const type = p.PartyType || p.type || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      city.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handlePartyClick = (partyId) => {
    setSelectedPartyId(partyId);
    setModalOpen(true);
  };

  // Reset page on search/filter change
  const handleSearchChange = (e) => { setSearch(e.target.value); setCurrentPage(1); };
  const handleTypeFilter = (type) => { setTypeFilter(type); setCurrentPage(1); };

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedParties = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPartyId(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => handleTypeFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === 'all' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTypeFilter('Customer')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === 'Customer' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              Debtors
            </button>
            <button
              onClick={() => handleTypeFilter('Supplier')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === 'Supplier' ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              Creditors
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input
                type="text"
                placeholder="Search parties..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 h-10 bg-ink-50 border border-line rounded-xl text-sm outline-none focus:border-brand-500 focus:bg-white transition-all"
              />
            </div>
</div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedParties.map((party) => {
            const name = party.PartyName || party.name || '';
            const city = party.City || party.city || '';
            const state = party.State || party.state || '';
            const location = [city, state].filter(Boolean).join(', ') || '—';
            const gstin = party.GSTIN || party.gstin || '';
            const type = party.PartyType || party.type || '';
            const balance = parseFloat(party.OpeningBalance || 0) || 0;
            const pan = party.PAN || '';
            const creditLimit = party.CreditLimit || 0;
            const salesPerson = party.SalesPerson || '';
            const status = party.Status || 'Active';
            const creditDays = party.CreditDays || 0;

            return (
              <div
                key={party.PartyID || party.id}
                onClick={() => handlePartyClick(party.PartyID || party.id)}
                className="p-4 rounded-xl border border-line hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 truncate">{name}</div>
                    <div className="text-xs text-ink-600 mt-1">{location}</div>
                    <div className="text-xs text-ink-500 font-mono mt-1">{gstin}</div>
                    {pan && <div className="text-xs text-ink-500 mt-0.5">PAN: {pan}</div>}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          type === 'Customer' ? 'bg-green-50 text-green-700' : 
                          type === 'Supplier' ? 'bg-amber-50 text-amber-700' : 
                          type === 'Both' ? 'bg-purple-50 text-purple-700' : 
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {type === 'Customer' ? 'Debtor' : 
                           type === 'Supplier' ? 'Creditor' : 
                           type === 'Both' ? 'Both' : 'Unknown'}
                        </span>
                        {status !== 'Active' && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            status === 'Inactive' ? 'bg-rose-50 text-rose-700' : 'bg-gray-50 text-gray-600'
                          }`}>
                            {status}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${
                        balance >= 0 ? 'text-green-700' : 'text-red-600'
                      }`}>
                        {formatCurrency(balance)}
                      </span>
                    </div>
                    {creditLimit > 0 && (
                      <div className="text-xs text-ink-500 mt-2 pt-2 border-t border-canvas-faint">
                        Credit Limit: {formatCurrency(creditLimit)}
                        {creditDays > 0 ? ` · ${creditDays}d` : ''}
                        {salesPerson && ` · ${salesPerson}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length > pageSize && (
          <VoucherPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      <EntityDetailModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        entityType="party"
        entityId={selectedPartyId}
      />
    </div>
  );
}
