import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import SettingsDetailLayout from '../../components/Settings/SettingsDetailLayout';
import { useCompany } from '../../context/CompanyContext';
import { settingsService } from '../../services/settingsService';

export default function StockItemSettings() {
  const { currentCompany } = useCompany();
  const [isSaving, setIsSaving] = useState(false);
  
  const [defaultUOM, setDefaultUOM] = useState('Pcs');
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [syncBatch, setSyncBatch] = useState(true);
  const [syncGodown, setSyncGodown] = useState(true);
  const [syncValuation, setSyncValuation] = useState(false);
  const [defaultGrouping, setDefaultGrouping] = useState('group');

  useEffect(() => {
    if (currentCompany?.id) {
      settingsService.getAllSettings(currentCompany.id).then(data => {
        if (data.StockItem) {
          setDefaultUOM(data.StockItem.defaultUOM ?? 'Pcs');
          setLowStockAlert(data.StockItem.lowStockAlert ?? true);
          setLowStockThreshold(data.StockItem.lowStockThreshold ?? 10);
          setSyncBatch(data.StockItem.syncBatch ?? true);
          setSyncGodown(data.StockItem.syncGodown ?? true);
          setSyncValuation(data.StockItem.syncValuation ?? false);
          setDefaultGrouping(data.StockItem.defaultGrouping ?? 'group');
        }
      });
    }
  }, [currentCompany?.id]);

  const handleSave = async () => {
    if (!currentCompany?.id) return;
    setIsSaving(true);
    await settingsService.updateSettings(currentCompany.id, 'StockItem', {
      defaultUOM,
      lowStockAlert,
      lowStockThreshold,
      syncBatch,
      syncGodown,
      syncValuation,
      defaultGrouping,
    });
    setIsSaving(false);
  };

  return (
    <SettingsDetailLayout
      title="Stock Item"
      description="Configure stock and inventory settings"
      icon={Package}
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">Default Unit of Measure</label>
            <input
              type="text"
              placeholder="e.g. Pcs, Kgs, Box"
              className="w-full rounded-lg border-slate-200 border p-2 text-sm focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
              value={defaultUOM}
              onChange={(e) => setDefaultUOM(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-2">Default Report Grouping</label>
            <select
              className="w-full rounded-lg border-slate-200 border p-2 text-sm bg-white focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
              value={defaultGrouping}
              onChange={(e) => setDefaultGrouping(e.target.value)}
            >
              <option value="group">By Stock Group</option>
              <option value="category">By Category</option>
              <option value="godown">By Godown / Location</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-ink-900 mb-3">Low Stock Alerts</h3>
          
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={lowStockAlert}
              onChange={(e) => setLowStockAlert(e.target.checked)}
              className="w-4 h-4 text-kinetic-primary rounded border-slate-300 focus:ring-kinetic-primary"
            />
            <span className="text-sm font-medium text-ink-900">Enable Low Stock / Reorder Alerts</span>
          </label>

          {lowStockAlert && (
            <div>
              <label className="block text-xs font-medium text-kinetic-neutral mb-1">Global Low Stock Threshold (Qty)</label>
              <input
                type="number"
                className="w-32 rounded-lg border-slate-200 border p-2 text-sm focus:ring-2 focus:ring-kinetic-primary/20 outline-none"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
              />
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-ink-900 mb-3">Tally Sync Preferences</h3>
          <p className="text-xs text-kinetic-neutral mb-4">Select which optional stock fields should be synced from Tally.</p>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={syncBatch}
                onChange={(e) => setSyncBatch(e.target.checked)}
                className="w-4 h-4 text-kinetic-primary rounded border-slate-300 focus:ring-kinetic-primary"
              />
              <span className="text-sm font-medium text-ink-900">Sync Batch details</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={syncGodown}
                onChange={(e) => setSyncGodown(e.target.checked)}
                className="w-4 h-4 text-kinetic-primary rounded border-slate-300 focus:ring-kinetic-primary"
              />
              <span className="text-sm font-medium text-ink-900">Sync Godown / Location details</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={syncValuation}
                onChange={(e) => setSyncValuation(e.target.checked)}
                className="w-4 h-4 text-kinetic-primary rounded border-slate-300 focus:ring-kinetic-primary"
              />
              <span className="text-sm font-medium text-ink-900">Sync Valuation Method details</span>
            </label>
          </div>
        </div>
      </div>
    </SettingsDetailLayout>
  );
}
