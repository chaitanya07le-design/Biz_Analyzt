import clsx from 'clsx';

const Button = ({ children, variant = 'primary', icon: Icon, className = '', ...props }) => {
  const base = 'h-10 px-4 inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all disabled:opacity-60';
  const styles = {
    primary: 'text-white shadow-soft hover:brightness-105',
    secondary: 'bg-white border border-gray-200 text-ink-900 hover:bg-ink-100',
    ghost: 'text-ink-600 hover:bg-ink-100',
  };
  
  const style = variant === 'primary'
    ? { background: 'linear-gradient(180deg,#5833EF 0%,#3A10CE 100%)', boxShadow: '0 4px 9px rgba(58,16,206,0.25)' }
    : undefined;
    
  return (
    <button className={clsx(base, styles[variant], className)} style={style} {...props}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export default Button;
