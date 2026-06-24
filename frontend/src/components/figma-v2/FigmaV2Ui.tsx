import type { ReactNode } from 'react';
import { AreaChart } from '@/components/ui/charts';

export function Fv2StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="fv2-stat">
      <label>{label}</label>
      <div className="val">{value}</div>
    </div>
  );
}

export function Fv2KpiRow({ children }: { children: ReactNode }) {
  return <div className="fv2-kpis">{children}</div>;
}

export function Fv2Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="fv2-panel">
      <div className="fv2-panel-head">{title}</div>
      <div className="fv2-panel-body">{children}</div>
    </div>
  );
}

export function Fv2Grid2({ children }: { children: ReactNode }) {
  return <div className="fv2-grid2">{children}</div>;
}

export function Fv2ChartPanel({ title, data }: { title: string; data: number[] }) {
  return (
    <Fv2Panel title={title}>
      <div className="fv2-chart-area">
        <AreaChart data={data} height={200} color="#2563eb" />
      </div>
    </Fv2Panel>
  );
}

export function Fv2ActivityPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <Fv2Panel title={title}>
      {items.length === 0 ? (
        <div className="fv2-activity-row">No recent activity</div>
      ) : (
        items.map((item, i) => (
          <div key={i} className="fv2-activity-row">
            {item}
          </div>
        ))
      )}
    </Fv2Panel>
  );
}

export function Fv2Badge({ label, variant = 'b' }: { label: string; variant?: 'g' | 'b' | 'a' | 'r' }) {
  return <span className={`fv2-badge fv2-badge-${variant}`}>{label}</span>;
}

export function Fv2DataTable({
  title,
  columns,
  rows,
  onRowClick,
}: {
  title: string;
  columns: string[];
  rows: { cells: ReactNode[]; key: string }[];
  onRowClick?: (key: string) => void;
}) {
  return (
    <div className="fv2-table-wrap">
      <div className="fv2-table-head">{title}</div>
      <table className="fv2-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--fv2-muted)', padding: 24 }}>
                No data
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.key} onClick={() => onRowClick?.(row.key)}>
                {row.cells.map((cell, i) => (
                  <td key={i}>{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Fv2Dashboard({
  kpis,
  chartData,
  activity,
  table,
}: {
  kpis: { label: string; value: string | number }[];
  chartData: number[];
  activity: string[];
  table: {
    title: string;
    columns: string[];
    rows: { cells: ReactNode[]; key: string }[];
    onRowClick?: (key: string) => void;
  };
}) {
  return (
    <>
      <Fv2KpiRow>
        {kpis.map((k) => (
          <Fv2StatCard key={k.label} label={k.label} value={k.value} />
        ))}
      </Fv2KpiRow>
      <Fv2Grid2>
        <Fv2ChartPanel title="Chart — Appointments trend" data={chartData} />
        <Fv2ActivityPanel title="Recent activity" items={activity} />
      </Fv2Grid2>
      <Fv2DataTable {...table} />
    </>
  );
}
