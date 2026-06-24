import { useEffect, useState, type ReactNode } from 'react';

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export interface HeroChip {
  label: string;
  value: string;
  accent?: string;
}

export function CrmDashboardHero({
  title,
  subtitle,
  chips = [],
  actions,
  variant = 'blue',
}: {
  title: string;
  subtitle?: string;
  chips?: HeroChip[];
  actions?: ReactNode;
  variant?: 'blue' | 'purple' | 'teal' | 'amber';
}) {
  const now = useLiveClock();

  return (
    <div className={`crm-dash-hero crm-dash-hero-${variant}`}>
      <div className="crm-dash-hero-orb crm-dash-hero-orb-1" />
      <div className="crm-dash-hero-orb crm-dash-hero-orb-2" />
      <div className="crm-dash-hero-orb crm-dash-hero-orb-3" />
      <div className="crm-dash-hero-grid" />

      <div className="crm-dash-hero-top">
        <div>
          <p className="crm-dash-hero-greet">{greeting()}</p>
          <h2 className="crm-dash-hero-title">{title}</h2>
          {subtitle && <p className="crm-dash-hero-sub">{subtitle}</p>}
        </div>
        <div className="crm-dash-hero-clock">
          <span className="crm-dash-hero-time">
            {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="crm-dash-hero-date">
            {now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="crm-dash-hero-chips">
          {chips.map((c) => (
            <div key={c.label} className="crm-dash-chip" style={{ ['--chip-accent' as string]: c.accent || '#fff' }}>
              <span>{c.label}</span>
              <strong>{c.value}</strong>
            </div>
          ))}
        </div>
      )}

      {actions && <div className="crm-dash-hero-actions">{actions}</div>}
    </div>
  );
}

export function CrmSectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="crm-section-header">
      <h3>{title}</h3>
      {hint && <span>{hint}</span>}
    </div>
  );
}

export function CrmActivityPanel({
  items,
  side,
}: {
  items: { time: string; message: string }[];
  side?: ReactNode;
}) {
  return (
    <div className="crm-activity-panel">
      <div className="crm-activity-panel-main">
        <div className="crm-activity-feed crm-activity-feed-premium">
          <div className="crm-act-head">
            <span className="crm-live-dot" />
            Live Activity Stream
          </div>
          {items.length === 0 ? (
            <div className="crm-act-empty">Click any module card or KPI — your actions appear here in real time</div>
          ) : (
            <div className="crm-act-timeline">
              {items.map((a, i) => (
                <div key={`${a.time}-${i}`} className="crm-act-timeline-item crm-act-enter" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="crm-act-dot" />
                  <div className="crm-act-body">
                    <span className="crm-act-time">{a.time}</span>
                    <p>{a.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {side && <div className="crm-activity-panel-side">{side}</div>}
    </div>
  );
}
