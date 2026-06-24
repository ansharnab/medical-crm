import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Sparkline } from '@/components/ui/charts';
import { premium, kpiIconColors } from '@/theme/premium';

type KpiTone = keyof typeof kpiIconColors;

export function CrmHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        borderRadius: '18px',
        background: premium.heroGradient,
        color: '#fff',
        boxShadow: '0 12px 40px rgba(37,99,235,0.25)',
      }}
    >
      <Typography sx={{ fontFamily: premium.displayFont, fontSize: 22, fontWeight: 800, mb: subtitle ? 0.5 : 0 }}>
        {title}
      </Typography>
      {subtitle && <Typography sx={{ fontSize: 13, opacity: 0.9 }}>{subtitle}</Typography>}
    </Box>
  );
}

export function CrmPageHeader({
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
            <Typography sx={{ fontFamily: premium.displayFont, fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>
              {title}
            </Typography>
            {isNew && (
              <Chip label="NEW" size="small" sx={{ fontWeight: 700, fontSize: 10, bgcolor: 'rgba(37,99,235,0.12)', color: '#2563eb' }} />
            )}
          </Box>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
      </Box>
    </Box>
  );
}

export function CrmKpiCard({
  label,
  value,
  trend,
  icon,
  tone = 'blue',
  sparkData,
}: {
  label: string;
  value: string | number;
  trend?: string;
  icon?: ReactNode;
  tone?: KpiTone;
  sparkData?: number[];
}) {
  const c = kpiIconColors[tone];
  const spark = sparkData || [4, 6, 5, 8, 7, 9, 8, 10];
  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: '1px solid rgba(148,163,184,0.22)',
        boxShadow: premium.cardShadow,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.25s, box-shadow 0.25s',
        '&:hover': { transform: 'translateY(-5px)', boxShadow: premium.cardShadowHover },
      }}
    >
      <CardContent sx={{ py: 2, px: 2, '&:last-child': { pb: 2 } }}>
        {icon && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: c.bg,
              color: c.color,
              display: 'grid',
              placeItems: 'center',
              mb: 1.25,
            }}
          >
            {icon}
          </Box>
        )}
        <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </Typography>
        <Typography sx={{ fontFamily: premium.displayFont, fontSize: 26, fontWeight: 800, my: 0.5, letterSpacing: '-0.03em' }}>
          {value}
        </Typography>
        {trend && (
          <Typography variant="caption" sx={{ fontWeight: 700, color: trend.startsWith('↓') ? 'error.main' : 'success.main' }}>
            {trend}
          </Typography>
        )}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.55, pointerEvents: 'none' }}>
          <Sparkline data={spark} color={c.color} width={200} height={40} />
        </Box>
      </CardContent>
    </Card>
  );
}

export function CrmKpiGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(auto-fit, minmax(150px, 1fr))' },
        gap: 1.5,
        mb: 2,
      }}
    >
      {children}
    </Box>
  );
}

export function CrmCard({ title, badge, actions, children }: { title: string; badge?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <Card sx={{ borderRadius: '16px', border: '1px solid rgba(148,163,184,0.22)', boxShadow: premium.cardShadow, overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography sx={{ fontFamily: premium.displayFont, fontWeight: 700, fontSize: 13 }}>{title}</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {badge}
          {actions}
        </Box>
      </Box>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>{children}</CardContent>
    </Card>
  );
}

export function CrmChartGrid({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.75, mb: 2 }}>
      {children}
    </Box>
  );
}

export function CrmHintBar({ text }: { text: string }) {
  return (
    <Box
      sx={{
        mb: 2,
        px: 1.5,
        py: 1,
        borderRadius: '10px',
        fontSize: 12,
        bgcolor: 'rgba(37,99,235,0.06)',
        border: '1px solid rgba(37,99,235,0.12)',
        color: 'text.secondary',
      }}
    >
      Try it → <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>{text}</Box>
    </Box>
  );
}

export function CrmSearchBox({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 2,
        px: 1.5,
        py: 1,
        borderRadius: '12px',
        border: '1px solid rgba(148,163,184,0.22)',
        bgcolor: 'background.paper',
        boxShadow: premium.cardShadow,
      }}
    >
      <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
      <Box
        component="input"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{
          flex: 1,
          border: 'none',
          outline: 'none',
          fontSize: 13,
          fontFamily: 'inherit',
          bgcolor: 'transparent',
        }}
      />
    </Box>
  );
}

export function CrmFilterPills({
  options,
  value,
  onChange,
  trailing,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  trailing?: ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
      {options.map((o) => (
        <Button
          key={o.id}
          size="small"
          onClick={() => onChange(o.id)}
          sx={{
            borderRadius: 99,
            fontWeight: 700,
            fontSize: 11,
            px: 1.5,
            py: 0.5,
            minWidth: 0,
            bgcolor: value === o.id ? 'primary.main' : 'background.paper',
            color: value === o.id ? '#fff' : 'text.secondary',
            border: '1px solid',
            borderColor: value === o.id ? 'primary.main' : 'divider',
            boxShadow: value === o.id ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
            '&:hover': { bgcolor: value === o.id ? 'primary.dark' : 'action.hover' },
          }}
        >
          {o.label}
        </Button>
      ))}
      {trailing && <Box sx={{ ml: 'auto' }}>{trailing}</Box>}
    </Box>
  );
}

export function CrmQuickActions({ actions }: { actions: { label: string; onClick?: () => void; primary?: boolean }[] }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
      {actions.map((a) => (
        <Button
          key={a.label}
          size="small"
          variant={a.primary ? 'contained' : 'outlined'}
          onClick={a.onClick}
          sx={{
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: 11,
            ...(a.primary && { background: premium.primaryButtonGradient, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }),
          }}
        >
          {a.label}
        </Button>
      ))}
    </Box>
  );
}

export function CrmActivityFeed({ items }: { items: { time: string; message: string }[] }) {
  return (
    <CrmCard
      title="Live Activity"
      badge={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px #10b981' }} />}
    >
      {items.length === 0 ? (
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Actions appear here in real time</Typography>
      ) : (
        items.map((a, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, py: 0.75, borderBottom: i < items.length - 1 ? '1px solid' : 'none', borderColor: 'divider', fontSize: 12 }}>
            <Typography sx={{ fontSize: 10, color: 'text.secondary', minWidth: 64, fontFamily: 'monospace' }}>{a.time}</Typography>
            <Typography>{a.message}</Typography>
          </Box>
        ))
      )}
    </CrmCard>
  );
}

export function CrmDataTable({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        '& table': { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
        '& th': {
          textAlign: 'left',
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'text.secondary',
          py: 1,
          px: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
        '& td': { py: 1.25, px: 1.5, borderBottom: '1px solid', borderColor: 'divider' },
        '& tr:hover td': { bgcolor: 'rgba(37,99,235,0.03)' },
      }}
    >
      {children}
    </Box>
  );
}
