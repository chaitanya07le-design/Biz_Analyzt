import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function SettingsDetailLayout({
  title,
  description,
  icon: Icon,
  children,
  onSave,
  onCancel,
  isSaving = false,
}) {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    navigate('/settings');
  };

  const handleSave = async () => {
    if (onSave) {
      // The page's onSave already triggers persistence via settingsService
      await onSave();
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)] relative pb-24">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="flex items-center text-sm font-medium text-kinetic-neutral hover:text-ink-900 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Settings
        </button>

        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-12 h-12 rounded-xl bg-kinetic-primary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-kinetic-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
            <p className="text-sm font-medium text-kinetic-neutral mt-1">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="flex-1 mb-8">
        <div className="p-6">
          {children}
        </div>
      </Card>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 right-0 w-full md:w-[calc(100%-256px)] bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-3 px-4 md:px-8">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
