import type { ReactNode } from 'react';

export function CrmStat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="crm-stat">
      <label>{label}</label>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

export function CrmStats({ children }: { children: ReactNode }) {
  return <div className="crm-stats">{children}</div>;
}

export function CrmPanel({ title, badge, children }: { title: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <div className="crm-panel">
      <div className="crm-panel-head">
        <span>{title}</span>
        {badge}
      </div>
      <div className="crm-panel-body">{children}</div>
    </div>
  );
}

export function CrmGrid2({ children }: { children: ReactNode }) {
  return <div className="crm-grid-2">{children}</div>;
}

export function CrmBadge({
  label,
  variant = 'info',
}: {
  label: string;
  variant?: 'success' | 'warning' | 'info' | 'danger';
}) {
  return <span className={`crm-badge crm-badge-${variant}`}>{label}</span>;
}

export function CrmSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="crm-search">
      <span aria-hidden>🔍</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
