export const Card = ({ children, className = '' }) => (
  <div className={`bg-surface border border-border rounded-xl shadow-sm ${className}`}>{children}</div>
);

export const CardHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-border">
    <div>
      <h3 className="font-display text-lg text-ink font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };
  const variants = {
    primary: 'bg-forest text-white hover:bg-forest-dark',
    secondary: 'bg-forest-50 text-forest hover:bg-forest/10',
    gold: 'bg-gold text-white hover:bg-gold-light',
    outline: 'border border-border-strong text-ink hover:bg-paper',
    danger: 'bg-danger-50 text-danger hover:bg-danger hover:text-white',
    ghost: 'text-ink-muted hover:bg-paper hover:text-ink',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge = ({ children, tone = 'neutral' }) => {
  const tones = {
    neutral: 'bg-paper text-ink-muted border-border',
    success: 'bg-success-50 text-success border-success/20',
    warning: 'bg-warning-50 text-warning border-warning/20',
    danger: 'bg-danger-50 text-danger border-danger/20',
    gold: 'bg-gold-50 text-gold border-gold/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tones[tone]}`}>
      {children}
    </span>
  );
};

export const Input = ({ label, error, className = '', ...props }) => (
  <label className="block">
    {label && <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>}
    <input
      className={`w-full px-3 py-2 rounded-lg border ${error ? 'border-danger' : 'border-border-strong'} bg-surface text-ink placeholder:text-ink-muted/60 focus:border-forest outline-none transition-colors ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-danger mt-1 block">{error}</span>}
  </label>
);

export const Select = ({ label, error, children, className = '', ...props }) => (
  <label className="block">
    {label && <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>}
    <select
      className={`w-full px-3 py-2 rounded-lg border ${error ? 'border-danger' : 'border-border-strong'} bg-surface text-ink focus:border-forest outline-none transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <span className="text-xs text-danger mt-1 block">{error}</span>}
  </label>
);

export const Textarea = ({ label, error, className = '', ...props }) => (
  <label className="block">
    {label && <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>}
    <textarea
      className={`w-full px-3 py-2 rounded-lg border ${error ? 'border-danger' : 'border-border-strong'} bg-surface text-ink placeholder:text-ink-muted/60 focus:border-forest outline-none transition-colors ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-danger mt-1 block">{error}</span>}
  </label>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-14 px-6">
    {Icon && (
      <div className="w-12 h-12 rounded-full bg-forest-50 flex items-center justify-center mb-4">
        <Icon size={22} className="text-forest" />
      </div>
    )}
    <p className="font-display text-base font-semibold text-ink">{title}</p>
    {description && <p className="text-sm text-ink-muted mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Spinner = ({ className = '' }) => (
  <div className={`animate-spin rounded-full border-2 border-border-strong border-t-forest ${className}`} />
);
