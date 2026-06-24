import { Button } from '@mui/material';
import type { ReactNode } from 'react';
import { CrmHero, CrmKpiCard, CrmPageHeader } from '@/components/crm';
import { premium } from '@/theme/premium';
import type { ComponentProps } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  actions?: ReactNode;
  isNew?: boolean;
  hero?: { title: string; subtitle?: string };
}

/** All pages use Figma/wireframe header styling */
export function PageHeader({ hero, ...props }: PageHeaderProps) {
  return (
    <>
      {hero && <CrmHero title={hero.title} subtitle={hero.subtitle} />}
      <CrmPageHeader {...props} />
    </>
  );
}

type StatCardProps = ComponentProps<typeof CrmKpiCard>;

/** KPI cards with sparklines — matches Figma wireframe */
export function StatCard(props: StatCardProps) {
  return <CrmKpiCard {...props} />;
}

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
}

export function PrimaryButton({ children, onClick }: PrimaryButtonProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={onClick}
      sx={{
        px: 2.5,
        background: premium.primaryButtonGradient,
        fontWeight: 700,
        boxShadow: '0 4px 18px rgba(37,99,235,0.3)',
      }}
    >
      {children}
    </Button>
  );
}

export {
  PremiumPageHeader,
  PremiumKpiCard,
  PremiumDataCard,
  StatusPill,
  GradientButton,
  NewModuleBadge,
} from './premium';

export {
  CrmHero,
  CrmPageHeader,
  CrmKpiCard,
  CrmKpiGrid,
  CrmCard,
  CrmChartGrid,
  CrmHintBar,
  CrmSearchBox,
  CrmFilterPills,
  CrmQuickActions,
  CrmActivityFeed,
} from '@/components/crm';
