import { Box, Typography } from '@mui/material';
import { premium } from '@/theme/premium';

function toPoints(data: number[], w = 320, h = 90) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * w;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');
}

export function Sparkline({ data, color = '#2563eb', width = 80, height = 32 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const pts = toPoints(data, width, height);
  const gradId = `sg-${color.replace('#', '')}`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function AreaChart({
  data = [12, 18, 14, 22, 19, 28, 24, 32],
  color = '#2563eb',
  height = 100,
}: {
  data?: number[];
  color?: string;
  height?: number;
}) {
  const w = 320;
  const h = 90;
  const points = toPoints(data, w, h);
  const gradId = `area-${color.replace('#', '')}`;
  return (
    <Box sx={{ width: '100%', height }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`${points} ${w},${h} 0,${h}`} fill={`url(#${gradId})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </Box>
  );
}

export function DonutChart({
  segments,
  centerLabel,
}: {
  segments: { value: number; color: string; label?: string }[];
  centerLabel?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, flexWrap: 'wrap', py: 1 }}>
      <Box sx={{ position: 'relative', width: 130, height: 130 }}>
        <svg width="130" height="130" viewBox="0 0 100 100">
          {segments.map((seg, i) => {
            const dash = (seg.value / total) * c;
            const el = (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 50 50)"
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <Box
          sx={{
            position: 'absolute',
            inset: '22px',
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontFamily: premium.displayFont, fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
            {total}
          </Typography>
          {centerLabel && (
            <Typography sx={{ fontSize: 9, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {centerLabel}
            </Typography>
          )}
        </Box>
      </Box>
      {segments.some((s) => s.label) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {segments.map((s) => (
            <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 11, fontWeight: 600, color: 'text.secondary' }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: s.color, flexShrink: 0 }} />
              {s.label} · {s.value}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export function BarChartColumns({
  data,
}: {
  data: { label: string; value: number; color?: string; color2?: string }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 130, px: 0.5 }}>
      {data.map((d, i) => (
        <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, height: '100%', justifyContent: 'flex-end' }}>
          <Box
            sx={{
              width: '100%',
              height: `${(d.value / max) * 100}%`,
              minHeight: 4,
              borderRadius: '6px 6px 2px 2px',
              background: `linear-gradient(180deg, ${d.color || '#2563eb'}, ${d.color2 || '#06b6d4'})`,
            }}
          />
          <Typography sx={{ fontSize: 9, fontWeight: 600, color: 'text.secondary' }}>{d.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export function HorizontalBarChart({
  data,
}: {
  data: { label: string; value: number; display?: string; color?: string; color2?: string }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <Box>
      {data.map((d, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25, fontSize: 11 }}>
          <Typography sx={{ width: 80, flexShrink: 0, fontWeight: 600, fontSize: 10, color: 'text.secondary' }}>
            {d.label}
          </Typography>
          <Box sx={{ flex: 1, height: 10, bgcolor: premium.pageBg, borderRadius: 99, overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${(d.value / max) * 100}%`,
                borderRadius: 99,
                background: `linear-gradient(90deg, ${d.color || '#2563eb'}, ${d.color2 || '#06b6d4'})`,
              }}
            />
          </Box>
          <Typography sx={{ width: 40, textAlign: 'right', fontWeight: 700, fontSize: 10 }}>{d.display ?? d.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export function HeatmapChart({ values, labels }: { values: number[]; labels?: string[] }) {
  const max = Math.max(...values, 1);
  const defaultLabels = ['8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p'];
  const lbls = labels || defaultLabels;
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${values.length}, 1fr)`, gap: 0.5 }}>
      {values.map((v, i) => {
        const intensity = v / max;
        const r = Math.round(37 + (1 - intensity) * 180);
        const g = Math.round(99 + (1 - intensity) * 100);
        const b = Math.round(235 - intensity * 80);
        return (
          <Box key={i} sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                height: 36,
                borderRadius: '6px',
                bgcolor: `rgb(${r},${g},${b})`,
                mb: 0.5,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
              title={`${lbls[i]}: ${v}`}
            />
            <Typography sx={{ fontSize: 8, color: 'text.secondary', fontWeight: 600 }}>{lbls[i]}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export function BarChartMini({ values, color = '#2563eb' }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 100, px: 0.5 }}>
      {values.map((v, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            minHeight: 4,
            borderRadius: '6px 6px 2px 2px',
            background: `linear-gradient(180deg, ${color}, ${color}88)`,
          }}
        />
      ))}
    </Box>
  );
}
