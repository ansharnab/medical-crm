import { useState } from 'react';
import { Box, Button, Chip } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import {
  CrmCard,
  CrmChartGrid,
  CrmHero,
  CrmHintBar,
  CrmKpiCard,
  CrmKpiGrid,
  CrmPageHeader,
} from '@/components/crm';
import { GradientButton, StatusPill } from '@/components/ui';
import { DonutChart } from '@/components/ui/charts';
import { mockPharmacyStock } from '@/data/mockModules';

export function PharmacyPage() {
  const [stock, setStock] = useState(mockPharmacyStock);
  const low = stock.filter((s) => s.qty <= s.min && s.qty > 0).length;
  const out = stock.filter((s) => s.qty === 0).length;

  const dispense = (id: number) => {
    setStock((prev) => prev.map((s) => (s.id === id ? { ...s, qty: Math.max(0, s.qty - 1) } : s)));
  };

  const restock = (id: number) => {
    setStock((prev) => prev.map((s) => (s.id === id ? { ...s, qty: s.qty + 10 } : s)));
  };

  return (
    <Box>
      <CrmHero title="Pharmacy & Inventory" subtitle="Stock levels · dispense · low-stock alerts" />
      <CrmPageHeader title="Inventory" breadcrumb="Demo / Pharmacy" isNew actions={<GradientButton size="small">+ Add Stock</GradientButton>} />

      <CrmHintBar text="Dispense reduces stock · Restock adds qty · low/out alerts" />

      <CrmKpiGrid>
        <CrmKpiCard label="SKUs" value={stock.length} icon={<InventoryIcon fontSize="small" />} />
        <CrmKpiCard label="Low Stock" value={low} icon={<WarningAmberIcon fontSize="small" />} tone="amber" />
        <CrmKpiCard label="Out of Stock" value={out} icon={<RemoveShoppingCartIcon fontSize="small" />} tone="purple" />
        <CrmKpiCard label="Dispensed Today" value={12} trend="↑ 3" icon={<LocalPharmacyIcon fontSize="small" />} tone="green" />
      </CrmKpiGrid>

      <CrmChartGrid>
        <CrmCard title="Stock Levels" badge={<Chip label="Live" size="small" sx={{ fontSize: 10, fontWeight: 700, bgcolor: 'rgba(37,99,235,0.12)', color: '#2563eb' }} />}>
          {stock.map((item) => {
            const status = item.qty === 0 ? 'Out' : item.qty <= item.min ? 'Low' : 'OK';
            const variant = status === 'Out' ? 'danger' : status === 'Low' ? 'warning' : 'success';
            return (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { border: 0 },
                  ...(status !== 'OK' && { bgcolor: status === 'Out' ? 'rgba(239,68,68,0.04)' : 'rgba(245,158,11,0.04)' }),
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ fontWeight: 700, fontSize: 13 }}>{item.name}</Box>
                  <Box sx={{ fontSize: 10, color: 'text.secondary' }}>
                    {item.qty} units · {item.category}
                    {status !== 'OK' && ` · ${status.toUpperCase()}`}
                  </Box>
                </Box>
                <StatusPill label={status} variant={variant} />
                <Button size="small" variant="outlined" disabled={item.qty === 0} onClick={() => dispense(item.id)} sx={{ fontSize: 10, fontWeight: 700, borderRadius: '8px' }}>
                  Dispense
                </Button>
                <Button size="small" variant="contained" onClick={() => restock(item.id)} sx={{ fontSize: 10, fontWeight: 700, borderRadius: '8px' }}>
                  + Restock
                </Button>
              </Box>
            );
          })}
        </CrmCard>
        <CrmCard title="Category Mix">
          <DonutChart
            segments={[
              { value: 55, color: '#2563eb', label: 'Tablets' },
              { value: 25, color: '#06b6d4', label: 'Syrups' },
              { value: 12, color: '#8b5cf6', label: 'Injections' },
              { value: 8, color: '#f59e0b', label: 'Other' },
            ]}
          />
        </CrmCard>
      </CrmChartGrid>
    </Box>
  );
}
