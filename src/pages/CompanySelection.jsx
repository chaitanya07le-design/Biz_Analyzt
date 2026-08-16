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
      <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto text-kinetic-primary animate-spin mb-4" />
            <p className="text-kinetic-neutral font-medium">Loading companies...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="bg-kinetic-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-kinetic-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-ink-900 tracking-tight">Select Company</h1>
          <p className="text-sm font-medium text-kinetic-neutral mt-2">{companies.length} companies available</p>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => handleSelect(company)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-kinetic-primary hover:bg-kinetic-primary/5 transition-all group shadow-sm"
            >
              <div className="flex-1 text-left">
                <div className="font-bold text-ink-900">{company.name}</div>
                <div className="text-xs font-medium text-kinetic-neutral mt-1">
                  {company.city} • {company.type}
                </div>
                <div className="text-xs font-semibold text-kinetic-neutral/70 mt-1 font-mono">{company.gstin}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-kinetic-neutral/50 group-hover:text-kinetic-primary transition-colors" />
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
