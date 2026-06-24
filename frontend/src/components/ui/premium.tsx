import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { premium, kpiIconColors } from '@/theme/premium';

type KpiTone = keyof typeof kpiIconColors;

export function NewModuleBadge() {
  return (
    <Chip
      label="NEW"
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.04em',
        background: 'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(139,92,246,0.12))',
        color: '#2563eb',
        border: '1px solid rgba(37,99,235,0.2)',
      }}
    />
  );
}

export function PremiumPageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  isNew,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  actions?: ReactNode;
  isNew?: boolean;
}) {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumb && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.75 }}>
          {breadcrumb}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography
              sx={{ fontFamily: premium.displayFont, fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}
            >
              {title}
            </Typography>
            {isNew && <NewModuleBadge />}
          </Box>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</Box>}
      </Box>
    </Box>
  );
}

export function PremiumKpiCard({
  label,
  value,
  trend,
  icon,
  tone = 'blue',
}: {
  label: string;
  value: string | number;
  trend?: string;
  icon: ReactNode;
  tone?: KpiTone;
}) {
  const c = kpiIconColors[tone];
  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: '1px solid rgba(148,163,184,0.22)',
        boxShadow: premium.cardShadow,
        transition: 'transform 0.25s, box-shadow 0.25s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: premium.cardShadowHover },
      }}
    >
      <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            bgcolor: c.bg,
            color: c.color,
            display: 'grid',
            placeItems: 'center',
            fontSize: 18,
            mb: 1.5,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontFamily: premium.displayFont, fontSize: 28, fontWeight: 800, lineHeight: 1.2, my: 0.5 }}>
          {value}
        </Typography>
        {trend && (
          <Typography variant="caption" sx={{ fontWeight: 700, color: trend.startsWith('↓') ? 'error.main' : 'success.main' }}>
            {trend}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function PremiumDataCard({
  title,
  badge,
  actions,
  children,
}: {
  title: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: '1px solid rgba(148,163,184,0.22)',
        boxShadow: premium.cardShadow,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography sx={{ fontFamily: premium.displayFont, fontWeight: 700, fontSize: 14 }}>{title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {badge}
          {actions}
        </Box>
      </Box>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>{children}</CardContent>
    </Card>
  );
}

export function StatusPill({ label, variant }: { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }) {
  const map = {
    success: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    warning: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    danger: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    info: { bg: 'rgba(37,99,235,0.12)', color: '#2563eb' },
  };
  const s = map[variant];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 1.25,
        py: 0.25,
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 700,
        bgcolor: s.bg,
        color: s.color,
      }}
    >
      {label}
    </Box>
  );
}

export function GradientButton({
  children,
  onClick,
  size = 'medium',
}: {
  children: ReactNode;
  onClick?: () => void;
  size?: 'small' | 'medium';
}) {
  return (
    <Button
      variant="contained"
      size={size}
      onClick={onClick}
      sx={{
        background: premium.primaryButtonGradient,
        boxShadow: '0 4px 18px rgba(37,99,235,0.35)',
        fontWeight: 700,
        borderRadius: '10px',
        '&:hover': {
          background: premium.primaryButtonGradient,
          boxShadow: '0 8px 28px rgba(37,99,235,0.4)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      {children}
    </Button>
  );
}
