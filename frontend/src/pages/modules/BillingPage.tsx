import { useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import {
  CrmCard,
  CrmChartGrid,
  CrmFilterPills,
  CrmHero,
  CrmHintBar,
  CrmKpiCard,
  CrmKpiGrid,
  CrmPageHeader,
} from '@/components/crm';
import { GradientButton, StatusPill } from '@/components/ui';
import { BarChartColumns, DonutChart } from '@/components/ui/charts';
import { mockInvoices } from '@/data/mockModules';

export function BillingPage() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [filter, setFilter] = useState('all');

  const paid = invoices.filter((i) => i.status === 'paid').length;
  const pendingAmt = invoices.filter((i) => i.status === 'pending' || i.status === 'partial').reduce((a, i) => a + i.amount, 0);
  const todayTotal = invoices.filter((i) => i.status === 'paid').reduce((a, i) => a + i.amount, 0);

  const filtered = filter === 'all' ? invoices : invoices.filter((i) => i.status === filter);

  const markPaid = (id: string) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: 'paid' as const } : inv)));
  };

  const statusVariant = (s: string) => (s === 'paid' ? 'success' : s === 'partial' ? 'warning' : 'info');

  return (
    <Box>
      <CrmHero title="Billing & Invoices" subtitle="GST · partial payments · daily closing" />
      <CrmPageHeader title="Invoices" breadcrumb="Demo / Billing" isNew />

      <CrmHintBar text="Filter by status · click Mark Paid · charts update live" />

      <CrmFilterPills
        options={[
          { id: 'all', label: 'All' },
          { id: 'paid', label: 'Paid' },
          { id: 'partial', label: 'Partial' },
          { id: 'pending', label: 'Pending' },
        ]}
        value={filter}
        onChange={setFilter}
        trailing={<GradientButton size="small">+ Create Invoice</GradientButton>}
      />

      <CrmKpiGrid>
        <CrmKpiCard label="Today" value={`₹${todayTotal.toLocaleString('en-IN')}`} icon={<PaymentsIcon fontSize="small" />} />
        <CrmKpiCard label="Pending" value={`₹${pendingAmt.toLocaleString('en-IN')}`} icon={<PendingActionsIcon fontSize="small" />} tone="amber" />
        <CrmKpiCard label="Paid Count" value={`${paid}/${invoices.length}`} icon={<ReceiptLongIcon fontSize="small" />} tone="green" />
        <CrmKpiCard label="Daily Closing" value="Open" icon={<AccountBalanceIcon fontSize="small" />} tone="purple" />
      </CrmKpiGrid>

      <CrmChartGrid>
        <CrmCard title="Invoice Status">
          <DonutChart
            centerLabel="Total"
            segments={[
              { value: invoices.filter((i) => i.status === 'paid').length, color: '#10b981', label: 'Paid' },
              { value: invoices.filter((i) => i.status === 'partial').length, color: '#f59e0b', label: 'Partial' },
              { value: invoices.filter((i) => i.status === 'pending').length, color: '#2563eb', label: 'Pending' },
            ]}
          />
        </CrmCard>
        <CrmCard title="Monthly Revenue">
          <BarChartColumns
            data={[
              { label: 'Jan', value: 60 },
              { label: 'Feb', value: 72 },
              { label: 'Mar', value: 68 },
              { label: 'Apr', value: 85, color: '#10b981', color2: '#34d399' },
              { label: 'May', value: 90, color: '#10b981', color2: '#34d399' },
              { label: 'Jun', value: 95, color: '#10b981', color2: '#34d399' },
            ]}
          />
        </CrmCard>
      </CrmChartGrid>

      <CrmCard title={`Invoices · ${filtered.length} shown`}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Invoice</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>GST</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((inv) => (
              <TableRow key={inv.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{inv.id}</TableCell>
                <TableCell>{inv.patient}</TableCell>
                <TableCell>₹{inv.amount}</TableCell>
                <TableCell>₹{inv.gst}</TableCell>
                <TableCell>
                  <StatusPill label={inv.status} variant={statusVariant(inv.status)} />
                </TableCell>
                <TableCell align="right">
                  {inv.status !== 'paid' && (
                    <Button size="small" onClick={() => markPaid(inv.id)} sx={{ fontWeight: 700 }}>
                      Mark Paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CrmCard>
    </Box>
  );
}
