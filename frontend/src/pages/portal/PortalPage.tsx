import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Box } from '@mui/material';
import { AreaChart } from '@/components/ui/charts';
import { CrmDashboardHero, CrmFigmaCard, CrmModuleGrid, FigmaScreen } from '@/components/app';
import { FigmaPortalFrame } from '@/components/figma';
import { PLATFORM_OWNER } from '@/config/roleNavigation';

const SUPPORT_PHONE = '9211611187';
const SUPPORT_EMAIL = 'info@maatridev.com';

export function PortalPage() {
  const [booked, setBooked] = useState(false);
  const [paid, setPaid] = useState(false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0f172a',
        backgroundImage: `
          radial-gradient(ellipse 100% 80% at 10% 0%, rgba(37,99,235,0.15), transparent 50%),
          radial-gradient(ellipse 80% 60% at 90% 10%, rgba(6,182,212,0.12), transparent 45%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <FigmaScreen>
        <CrmDashboardHero
          variant="blue"
          title="Patient Portal"
          subtitle={`Book appointments · pay bills · view prescriptions — ${PLATFORM_OWNER}`}
          chips={[
            { label: 'Support', value: SUPPORT_PHONE, accent: '#60a5fa' },
            { label: 'Email', value: 'info@', accent: '#34d399' },
            { label: 'Visits', value: '12', accent: '#a78bfa' },
            { label: 'Rx', value: '2 active', accent: '#fbbf24' },
          ]}
        />

        <FigmaPortalFrame url={`portal.doctorcrm.com · Demo Patient`}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span className="crm-pill crm-pill-b">Patient Portal</span>
            <h2 style={{ fontFamily: 'var(--crm-font-display)', fontSize: 20, margin: '12px 0 4px' }}>Welcome, Rajesh</h2>
            <p style={{ fontSize: 12, color: 'var(--crm-text-muted)' }}>Demo Clinic · Mumbai</p>
          </div>

          <CrmModuleGrid
            items={[
              {
                icon: '📅',
                title: 'Book Appointment',
                sub: booked ? 'Booked ✓ Today 2 PM' : 'Tap to book',
                color: '#2563eb',
                onClick: () => setBooked(true),
              },
              { icon: '📋', title: 'My Visits', sub: '12 total visits', color: '#10b981' },
              {
                icon: '💊',
                title: 'Download Rx',
                sub: '2 active prescriptions',
                color: '#8b5cf6',
                onClick: () => window.print(),
              },
              {
                icon: '₹',
                title: 'Pay Bill',
                sub: paid ? 'All paid ✓' : '₹500 pending',
                color: '#f59e0b',
                onClick: () => setPaid(true),
              },
            ]}
          />

          <Box sx={{ mt: 2 }}>
            <CrmFigmaCard title="Your Health Trend">
              <AreaChart data={[5.8, 5.9, 6.1, 6.0, 6.2, 6.4]} color="#8b5cf6" height={100} />
            </CrmFigmaCard>
          </Box>

          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--crm-text-muted)', textAlign: 'center' }}>
            Need help? Call <strong>{SUPPORT_PHONE}</strong> or email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--crm-primary)' }}>
              {SUPPORT_EMAIL}
            </a>
          </div>
        </FigmaPortalFrame>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" style={{ fontSize: 13, color: '#60a5fa', fontWeight: 600 }}>
            Staff login →
          </Link>
        </div>
      </FigmaScreen>
    </Box>
  );
}
