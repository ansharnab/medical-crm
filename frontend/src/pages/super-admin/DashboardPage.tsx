import { AppShell } from '@/components/layout/AppShell';
import { getRoleNav } from '@/config/roleNavigation';

export function SuperAdminLayout() {
  return <AppShell navItems={getRoleNav('super_admin')} role="super_admin" />;
}
