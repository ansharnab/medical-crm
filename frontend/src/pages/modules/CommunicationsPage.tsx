import { useState } from 'react';
import { Box, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArticleIcon from '@mui/icons-material/Article';
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
import { mockMessages } from '@/data/mockModules';
import { useToast } from '@/context/ToastContext';

export function CommunicationsPage() {
  const { showToast } = useToast();
  const [channel, setChannel] = useState('WhatsApp');
  const [template, setTemplate] = useState('appointment_reminder');

  const send = () => {
    showToast(`${channel} message queued`, 'success');
  };

  const delivered = mockMessages.filter((m) => m.status === 'delivered').length;
  const queued = mockMessages.filter((m) => m.status === 'queued').length;

  return (
    <Box>
      <CrmHero title="Communications Center" subtitle="WhatsApp · SMS · Email templates & delivery logs" />
      <CrmPageHeader title="Send & Track" breadcrumb="Demo / Communications" isNew />
      <CrmHintBar text="Pick channel + template · send bulk · see delivery log" />

      <CrmKpiGrid>
        <CrmKpiCard label="Sent Today" value={mockMessages.length} icon={<SendIcon fontSize="small" />} />
        <CrmKpiCard label="Delivered" value={delivered} icon={<MarkEmailReadIcon fontSize="small" />} tone="green" />
        <CrmKpiCard label="Queued" value={queued} icon={<ScheduleIcon fontSize="small" />} tone="amber" />
        <CrmKpiCard label="Templates" value={8} icon={<ArticleIcon fontSize="small" />} tone="purple" />
      </CrmKpiGrid>

      <CrmChartGrid>
        <CrmCard title="Send Message">
          <TextField select fullWidth label="Channel" value={channel} onChange={(e) => setChannel(e.target.value)} sx={{ mb: 2 }} size="small">
            <MenuItem value="WhatsApp">WhatsApp</MenuItem>
            <MenuItem value="SMS">SMS</MenuItem>
            <MenuItem value="Email">Email</MenuItem>
          </TextField>
          <TextField select fullWidth label="Template" value={template} onChange={(e) => setTemplate(e.target.value)} sx={{ mb: 2 }} size="small">
            <MenuItem value="appointment_reminder">Appointment reminder</MenuItem>
            <MenuItem value="followup">Follow-up reminder</MenuItem>
            <MenuItem value="invoice">Invoice notification</MenuItem>
          </TextField>
          <GradientButton onClick={send}>Send to 24 patients</GradientButton>
        </CrmCard>

        <CrmCard title="Channel Mix">
          <DonutChart
            segments={[
              { value: mockMessages.filter((m) => m.channel === 'WhatsApp').length, color: '#10b981', label: 'WhatsApp' },
              { value: mockMessages.filter((m) => m.channel === 'SMS').length, color: '#2563eb', label: 'SMS' },
              { value: mockMessages.filter((m) => m.channel === 'Email').length, color: '#8b5cf6', label: 'Email' },
            ]}
          />
        </CrmCard>
      </CrmChartGrid>

      <CrmCard title="Recent Log">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Channel</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Template</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockMessages.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell>{m.channel}</TableCell>
                <TableCell>{m.to}</TableCell>
                <TableCell>{m.template}</TableCell>
                <TableCell>
                  <StatusPill label={m.status} variant={m.status === 'delivered' ? 'success' : m.status === 'sent' ? 'info' : 'warning'} />
                </TableCell>
                <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{m.at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CrmCard>
    </Box>
  );
}
