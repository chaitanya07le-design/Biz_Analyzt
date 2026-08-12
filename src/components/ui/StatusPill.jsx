import clsx from 'clsx';

const StatusPill = ({ status }) => {
  const map = {
    success: 'bg-green-50 text-green-700',
    completed: 'bg-green-50 text-green-700',
    running: 'bg-green-50 text-green-700',
    active: 'bg-green-50 text-green-700',
    error: 'bg-red-50 text-red-700',
    failed: 'bg-red-50 text-red-700',
    warning: 'bg-amber-50 text-amber-700',
    pending: 'bg-amber-50 text-amber-700',
    queued: 'bg-amber-50 text-amber-700',
    inactive: 'bg-gray-50 text-gray-700',
    idle: 'bg-gray-50 text-gray-700',
  };
  
  const k = String(status).toLowerCase();
  return (
    <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium', map[k] || 'bg-gray-50 text-gray-700')}>
      {status}
    </span>
  );
};

export default StatusPill;
