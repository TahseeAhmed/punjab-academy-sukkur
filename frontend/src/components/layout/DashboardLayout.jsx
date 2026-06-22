import { Sidebar } from './Sidebar';

export const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {(title || subtitle) && (
          <header className="px-8 pt-8 pb-2">
            {title && <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>}
            {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
          </header>
        )}
        <div className="px-8 pb-10 pt-4">{children}</div>
      </main>
    </div>
  );
};
