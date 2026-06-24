import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { premium } from '@/theme/premium';

/** Matches wireframe-demo.html mock-app shell (Figma import) */
export function DeviceFrame({
  title,
  nav,
  activeNav,
  onNav,
  children,
}: {
  title: string;
  nav: string[];
  activeNav: string;
  onNav?: (item: string) => void;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        borderRadius: '18px',
        border: '1px solid rgba(148,163,184,0.22)',
        boxShadow: premium.cardShadowHover,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {/* Browser chrome */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.25,
          bgcolor: '#f1f5f9',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {['#ef4444', '#eab308', '#22c55e'].map((c) => (
          <Box key={c} sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: c }} />
        ))}
        <Box
          sx={{
            flex: 1,
            ml: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: '7px',
            bgcolor: 'background.paper',
            fontSize: 11,
            color: 'text.secondary',
            fontFamily: 'monospace',
          }}
        >
          localhost:5173/{title}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', minHeight: 480 }}>
        {/* Inner dark sidebar — Figma wireframe style */}
        <Box
          sx={{
            width: 185,
            flexShrink: 0,
            background: 'linear-gradient(180deg,#0f172a,#1e293b)',
            p: 1.5,
          }}
        >
          <Box sx={{ color: '#fff', fontWeight: 800, fontSize: 13, px: 1.25, py: 1, mb: 2, fontFamily: premium.displayFont }}>
            ⚕ Demo Clinic
          </Box>
          {nav.map((item) => {
            const on = item === activeNav;
            return (
              <Box
                key={item}
                component="button"
                onClick={() => onNav?.(item)}
                sx={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  cursor: onNav ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  fontSize: 11,
                  px: 1.25,
                  py: 1,
                  mb: 0.4,
                  borderRadius: '8px',
                  color: on ? '#fff' : '#64748b',
                  background: on ? premium.navActiveGradient : 'transparent',
                  boxShadow: on ? '0 4px 20px rgba(37,99,235,0.35)' : 'none',
                  '&:hover': onNav && !on ? { bgcolor: 'rgba(255,255,255,0.08)', color: '#e2e8f0' } : {},
                }}
              >
                {item}
              </Box>
            );
          })}
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1, p: 2, bgcolor: premium.pageBg, backgroundImage: premium.meshBackground }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
