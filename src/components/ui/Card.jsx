import clsx from 'clsx';

const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={clsx(
      'bg-white rounded-2xl border border-line shadow-card p-5 transition-shadow',
      onClick && 'cursor-pointer hover:shadow-card-hover',
      className
    )}
  >
    {children}
  </div>
);

export default Card;
