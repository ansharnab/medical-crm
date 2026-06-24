import type { ReactNode } from 'react';

export function CrmHint({ children }: { children: ReactNode }) {
  return <div className="crm-hint-bar">{children}</div>;
}

export function CrmListActions({ children }: { children: ReactNode }) {
  return <div className="crm-actions">{children}</div>;
}

export function CrmListFilters({ children }: { children: ReactNode }) {
  return <div className="crm-filter-bar">{children}</div>;
}

export function CrmListLoading() {
  return (
    <div className="crm-loading">
      <div className="crm-spinner" />
    </div>
  );
}

export function CrmAlert({ variant, children, onClose }: { variant: 'warning' | 'info' | 'error' | 'success'; children: ReactNode; onClose?: () => void }) {
  const cls = variant === 'error' ? 'crm-login-error' : variant === 'success' ? 'crm-alert crm-alert-info' : `crm-alert crm-alert-${variant === 'warning' ? 'warning' : 'info'}`;
  return (
    <div className={cls} style={{ marginBottom: 16 }}>
      <span>{children}</span>
      {onClose && (
        <button type="button" className="crm-btn crm-btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={onClose}>
          Dismiss
        </button>
      )}
    </div>
  );
}

export function CrmPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const safeTotal = Math.max(totalPages, 1);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="crm-pagination">
      <span>{total === 0 ? '0 records' : `Showing ${start}–${end} of ${total}`}</span>
      <div className="crm-pagination-btns">
        <button type="button" className="crm-btn crm-btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} disabled={page <= 1 || total === 0} onClick={() => onPageChange(page - 1)}>
          ← Prev
        </button>
        <span style={{ fontSize: 12, padding: '0 8px' }}>
          {page} / {safeTotal}
        </span>
        <button type="button" className="crm-btn crm-btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} disabled={page >= safeTotal || total === 0} onClick={() => onPageChange(page + 1)}>
          Next →
        </button>
      </div>
    </div>
  );
}

export function CrmTabs({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div className="crm-tabs">
      {tabs.map((t, i) => (
        <button key={t} type="button" className={`crm-tab${active === i ? ' active' : ''}`} onClick={() => onChange(i)}>
          {t}
        </button>
      ))}
    </div>
  );
}

export function CrmEmpty({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={99} style={{ textAlign: 'center', color: 'var(--app-muted)', padding: 32 }}>
        {message}
      </td>
    </tr>
  );
}
