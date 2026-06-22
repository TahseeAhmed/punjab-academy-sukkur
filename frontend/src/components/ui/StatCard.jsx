export const StatCard = ({ label, value, sub, icon: Icon, tone = 'forest' }) => {
  const tones = {
    forest: 'bg-forest-50 text-forest',
    gold: 'bg-gold-50 text-gold',
    danger: 'bg-danger-50 text-danger',
  };
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-ink-muted">{label}</p>
        <p className="font-display text-3xl font-semibold text-ink mt-1.5">{value}</p>
        {sub && <p className="text-xs text-ink-muted mt-1.5">{sub}</p>}
      </div>
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
          <Icon size={18} />
        </div>
      )}
    </div>
  );
};
