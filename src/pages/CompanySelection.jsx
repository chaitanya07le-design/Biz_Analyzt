import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useCompany } from '../context/CompanyContext';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';

export default function CompanySelection() {
  const { companies, selectCompany, loading } = useCompany();
  const navigate = useNavigate();

  const handleSelect = (company) => {
    selectCompany(company);
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto text-brand-600 animate-spin mb-4" />
            <p className="text-ink-600">Loading companies...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <Building2 className="w-12 h-12 mx-auto text-brand-600 mb-3" />
          <h1 className="text-2xl font-bold text-ink-900">Select Company</h1>
          <p className="text-sm text-ink-600 mt-2">{companies.length} companies available</p>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => handleSelect(company)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-line hover:border-brand-500 hover:bg-brand-50 transition-all group"
            >
              <div className="flex-1 text-left">
                <div className="font-semibold text-ink-900">{company.name}</div>
                <div className="text-xs text-ink-600 mt-1">
                  {company.city} • {company.type}
                </div>
                <div className="text-xs text-ink-500 mt-1 font-mono">{company.gstin}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-ink-400 group-hover:text-brand-600 transition-colors" />
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
