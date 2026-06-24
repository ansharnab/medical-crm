import { Box, Tab, Tabs } from '@mui/material';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/ui';

const tabs = [
  { label: 'Clinic Info', path: '/admin/settings/clinic' },
  { label: 'Working Hours', path: '/admin/settings/working-hours' },
  { label: 'Doctor Fees', path: '/admin/settings/doctor-fees' },
];

export function SettingsLayout() {
  const location = useLocation();
  const currentTab =
    tabs.find((tab) => location.pathname.startsWith(tab.path))?.path || tabs[0].path;

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Configure your clinic profile and fees" />
      <Tabs value={currentTab} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        {tabs.map((tab) => (
          <Tab
            key={tab.path}
            label={tab.label}
            value={tab.path}
            component={RouterLink}
            to={tab.path}
          />
        ))}
      </Tabs>
      <Outlet />
    </Box>
  );
}
