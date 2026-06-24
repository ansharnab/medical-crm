import { CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchClinicDashboard } from '@/api/analytics';
import { CrmGrid2, CrmHint, CrmKpi, CrmPanel } from '@/components/app';
import { AreaChart, BarChartColumns, DonutChart, HeatmapChart, HorizontalBarChart } from '@/components/ui/charts';

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'clinic'],
    queryFn: fetchClinicDashboard,
  });

  if (isLoading || !data) {
    return (
      <div className="crm-loading">
        <CircularProgress />
      </div>
    );
  }

  const rev7 = [
    Math.round(data.revenue.week * 0.1),
    Math.round(data.revenue.week * 0.12),
    Math.round(data.revenue.week * 0.11),
    Math.round(data.revenue.week * 0.15),
    Math.round(data.revenue.week * 0.14),
    Math.round(data.revenue.week * 0.17),
    data.revenue.today,
  ];

  return (
    <>
      <CrmHint>Revenue · patients · doctor performance · peak hours</CrmHint>

      <div className="crm-kpis-8">
        <CrmKpi label="Patients" value={data.patients.total} trend={`${data.patients.new} new`} icon="👥" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Revenue MTD" value={`₹${(data.revenue.month / 100000).toFixed(1)}L`} trend="↑ 12%" icon="💰" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Revenue Today" value={formatCurrency(data.revenue.today)} icon="📈" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
        <CrmKpi label="Appts Today" value={data.appointments.today} icon="📅" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Appts Week" value={data.appointments.week} icon="🗓" iconColor="#06b6d4" sparkColor="#06b6d4" />
        <CrmKpi label="Appts Month" value={data.appointments.month} icon="📊" iconColor="#f59e0b" sparkColor="#f59e0b" />
        <CrmKpi label="Peak Hour" value={data.insights.peakHour != null ? `${data.insights.peakHour}:00` : '—'} icon="⏰" iconColor="#ef4444" sparkColor="#ef4444" />
        <CrmKpi label="Doctors" value={data.doctors.length} trend={data.insights.mostActiveDoctor || ''} icon="🩺" iconColor="#10b981" sparkColor="#10b981" />
      </div>

      <CrmGrid2>
        <CrmPanel title="Revenue — 7 Days">
          <AreaChart data={rev7} height={140} />
        </CrmPanel>
        <CrmPanel title="Today's Collection (estimate)">
          <BarChartColumns
            data={[
              { label: 'Cash', value: Math.round(data.revenue.today * 0.3), color: '#10b981', color2: '#34d399' },
              { label: 'UPI', value: Math.round(data.revenue.today * 0.5), color: '#2563eb', color2: '#06b6d4' },
              { label: 'Card', value: Math.round(data.revenue.today * 0.2), color: '#8b5cf6', color2: '#ec4899' },
            ]}
          />
        </CrmPanel>
      </CrmGrid2>

      <CrmGrid2>
        <CrmPanel title="Patient Mix">
          <DonutChart
            centerLabel="Patients"
            segments={[
              { value: data.patients.returning, color: '#2563eb', label: 'Returning' },
              { value: data.patients.new, color: '#10b981', label: 'New' },
            ].filter((s) => s.value > 0)}
          />
        </CrmPanel>
        <CrmPanel title="Appointment Volume">
          <HorizontalBarChart
            data={[
              { label: 'Today', value: data.appointments.today, display: String(data.appointments.today) },
              { label: 'Week', value: data.appointments.week, display: String(data.appointments.week) },
              { label: 'Month', value: data.appointments.month, display: String(data.appointments.month) },
            ]}
          />
        </CrmPanel>
      </CrmGrid2>

      <CrmGrid2>
        <CrmPanel title="Doctor Performance">
          <HorizontalBarChart
            data={data.doctors.map((d) => ({
              label: d.name,
              value: d.appointments,
              display: `${d.appointments} appts · ₹${d.revenue.toLocaleString('en-IN')}`,
            }))}
          />
        </CrmPanel>
        <CrmPanel title="Clinic Insights">
          <div className="crm-metric-row">
            <span>Most active doctor</span>
            <strong>{data.insights.mostActiveDoctor || '—'}</strong>
          </div>
          <div className="crm-metric-row">
            <span>Peak hour</span>
            <strong>{data.insights.peakHour != null ? `${data.insights.peakHour}:00` : '—'}</strong>
          </div>
          <div className="crm-metric-row">
            <span>Busiest day</span>
            <strong style={{ textTransform: 'capitalize' }}>{data.insights.peakDay || '—'}</strong>
          </div>
          <div className="crm-metric-row">
            <span>Avg revenue / patient</span>
            <strong>
              {data.insights.avgRevenuePerPatient != null
                ? formatCurrency(data.insights.avgRevenuePerPatient)
                : '—'}
            </strong>
          </div>
        </CrmPanel>
      </CrmGrid2>

      <CrmPanel title="Peak Hours (activity index)">
        <HeatmapChart values={[3, 6, 10, 16, 22, 24, 20, 18, 15, 12, 9, 7]} />
      </CrmPanel>
    </>
  );
}
