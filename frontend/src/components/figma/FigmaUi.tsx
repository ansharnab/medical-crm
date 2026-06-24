import type { ReactNode } from 'react';
import { Sparkline } from '@/components/ui/charts';
import { parseNumericDisplay, useAnimatedNumber } from '@/hooks/useLiveActivity';

export function FigmaScreen({ children }: { children: ReactNode }) {
  return <div className="crm-screen">{children}</div>;
}

export function FigmaHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="crm-hero-banner">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export function FigmaCard({ title, badge, children }: { title: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <div className="crm-card">
      <div className="crm-card-head">
        <span>{title}</span>
        {badge}
      </div>
      <div className="crm-card-body">{children}</div>
    </div>
  );
}

export function FigmaKpi({
  label,
  value,
  trend,
  icon,
  iconColor = '#2563eb',
  sparkColor = '#2563eb',
  sparkData,
  onClick,
  delay = 0,
  pulse,
}: {
  label: string;
  value: string | number;
  trend?: string;
  icon?: string;
  iconColor?: string;
  sparkColor?: string;
  sparkData?: number[];
  onClick?: () => void;
  delay?: number;
  pulse?: boolean;
}) {
  const spark = sparkData || [3, 5, 4, 7, 6, 8, 9, 7, 10, 12];
  const parsed = typeof value === 'number' ? { num: value, prefix: '', suffix: '' } : parseNumericDisplay(value);
  const animated = useAnimatedNumber(parsed.num ?? 0);
  const display =
    typeof value === 'number'
      ? animated.toLocaleString('en-IN')
      : parsed.num != null && !parsed.prefix && !parsed.suffix
        ? animated.toLocaleString('en-IN')
        : value;

  return (
    <div
      className={`crm-kpi crm-kpi-enter${onClick ? ' crm-kpi-click' : ''}${pulse ? ' crm-kpi-pulse' : ''}`}
      style={{ animationDelay: `${delay}ms`, ['--kpi-accent' as string]: iconColor }}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon && (
        <div className="crm-kpi-icon crm-kpi-icon-bounce" style={{ background: `${iconColor}18`, color: iconColor }}>
          {icon}
        </div>
      )}
      <label>{label}</label>
      <div className="val crm-count-up">{display}</div>
      {trend && <div className="trend">{trend}</div>}
      {onClick && <div className="crm-kpi-tap">Tap to open →</div>}
      <div className="crm-kpi-spark">
        <Sparkline data={spark} color={sparkColor} width={200} height={40} />
      </div>
    </div>
  );
}

export function FigmaKpiRow({ children }: { children: ReactNode }) {
  return <div className="crm-kpis">{children}</div>;
}

export function FigmaGrid2({ children }: { children: ReactNode }) {
  return <div className="crm-grid2">{children}</div>;
}

export function FigmaPill({ label, variant = 'b' }: { label: string; variant?: 'g' | 'b' | 'a' | 'r' }) {
  return <span className={`crm-pill crm-pill-${variant}`}>{label}</span>;
}

export function FigmaSearchBox({
  value,
  onChange,
  placeholder = 'Search...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="crm-search-box">
      <span>🔍</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function FigmaHint({ children }: { children: ReactNode }) {
  return <div className="crm-hint-bar">{children}</div>;
}

export function FigmaQuickActions({ children }: { children: ReactNode }) {
  return <div className="crm-quick-actions">{children}</div>;
}

export function FigmaQuickAction({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" className="crm-qa-btn crm-qa-pop" onClick={onClick}>
      {children}
    </button>
  );
}

export function FigmaActivityFeed({ items }: { items: { time: string; message: string }[] }) {
  return (
    <div className="crm-activity-feed">
      <div className="crm-act-head">
        <span className="crm-live-dot" />
        Live Activity
      </div>
      {items.length === 0 ? (
        <div className="crm-act-empty">Interact with the screen — actions appear here in real time</div>
      ) : (
        items.map((a, i) => (
          <div key={`${a.time}-${i}`} className="crm-act-item crm-act-enter" style={{ animationDelay: `${i * 40}ms` }}>
            <span className="crm-act-time">{a.time}</span>
            {a.message}
          </div>
        ))
      )}
    </div>
  );
}

export function FigmaGauge({ value, max, label, color = '#2563eb' }: { value: number; max: number; label: string; color?: string }) {
  const pct = Math.min(value / max, 1);
  const circ = 2 * Math.PI * 30;
  const offset = circ * (1 - pct);
  return (
    <div className="crm-gauge">
      <svg width="80" height="50" viewBox="0 0 80 50">
        <path d="M 10 45 A 30 30 0 0 1 70 45" fill="none" stroke="var(--crm-border)" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M 10 45 A 30 30 0 0 1 70 45"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ / 2}
          strokeDashoffset={offset / 2}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="40" y="42" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--crm-text)" fontFamily="Plus Jakarta Sans">
          {value}
        </text>
      </svg>
      <div className="crm-gauge-label">{label}</div>
    </div>
  );
}

export function FigmaGaugeRow({ children }: { children: ReactNode }) {
  return <div className="crm-gauge-row">{children}</div>;
}

export function FigmaQueueCard({
  token,
  name,
  wait,
  active,
  onCall,
}: {
  token: number;
  name: string;
  wait: string;
  active?: boolean;
  onCall?: () => void;
}) {
  return (
    <div className={`crm-qcard${active ? ' active' : ''}`}>
      <div className="token">#{token}</div>
      <div className="name">{name}</div>
      <div className="wait">{wait}</div>
      {active && onCall && (
        <button type="button" className="call-btn" onClick={onCall}>
          Call Next →
        </button>
      )}
    </div>
  );
}

export function FigmaQueueCards({ children }: { children: ReactNode }) {
  return <div className="crm-queue-cards">{children}</div>;
}

export function FigmaSlotGrid({
  slots,
  fullSlots,
  selected,
  onSelect,
}: {
  slots: string[];
  fullSlots?: string[];
  selected?: string;
  onSelect: (slot: string) => void;
}) {
  const full = new Set(fullSlots || []);
  return (
    <div className="crm-slot-grid">
      {slots.map((s) => (
        <button
          key={s}
          type="button"
          className={`crm-slot-btn${full.has(s) ? ' full' : ''}${selected === s ? ' picked' : ''}`}
          disabled={full.has(s)}
          onClick={() => onSelect(s)}
        >
          {s}
          {full.has(s) && (
            <>
              <br />
              <small>FULL</small>
            </>
          )}
        </button>
      ))}
    </div>
  );
}

export function FigmaSuccessBox({ title, detail, children }: { title: string; detail?: string; children?: ReactNode }) {
  return (
    <div className="crm-success-box">
      <div style={{ fontSize: 40, marginBottom: 8 }}>✓</div>
      <strong>{title}</strong>
      {detail && <p style={{ fontSize: 12, color: 'var(--crm-text-muted)', marginTop: 8 }}>{detail}</p>}
      {children}
    </div>
  );
}

export function FigmaModuleGrid({
  items,
}: {
  items: { icon: string; title: string; sub: string; onClick?: () => void; color?: string }[];
}) {
  return (
    <div className="crm-module-grid">
      {items.map((m, i) => (
        <div
          key={m.title}
          className="crm-module-card crm-module-enter"
          style={{ animationDelay: `${i * 60}ms`, ['--card-accent' as string]: m.color || '#2563eb' }}
          onClick={m.onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && m.onClick?.()}
        >
          <div className="crm-module-shine" />
          <div className="icon">{m.icon}</div>
          <strong>{m.title}</strong>
          <span>{m.sub}</span>
          <div className="crm-module-arrow">→</div>
        </div>
      ))}
    </div>
  );
}

export function FigmaPortalFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="crm-portal-frame">
      <div className="crm-device-bar">
        <span className="dd r" />
        <span className="dd y" />
        <span className="dd g" />
        <span className="durl">{url}</span>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}
