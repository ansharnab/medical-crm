import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import { CrmCard, CrmHero, CrmHintBar, CrmKpiCard, CrmKpiGrid, CrmPageHeader } from '@/components/crm';
import { mockAuditLog } from '@/data/mockModules';

export function AuditLogPage() {
  return (
    <Box>
      <CrmHero title="Audit Log" subtitle="Compliance trail · who did what when" />
      <CrmPageHeader title="Activity" breadcrumb="Demo / Audit" isNew />
      <CrmHintBar text="Filter by user/action · export CSV for compliance" />

      <CrmKpiGrid>
        <CrmKpiCard label="Events (7d)" value={mockAuditLog.length} icon={<HistoryIcon fontSize="small" />} />
        <CrmKpiCard label="Users Active" value={3} icon={<PeopleIcon fontSize="small" />} tone="cyan" />
        <CrmKpiCard label="Critical Actions" value={1} icon={<SecurityIcon fontSize="small" />} tone="amber" />
      </CrmKpiGrid>

      <CrmCard title="Recent Activity">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Detail</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockAuditLog.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ color: 'text.secondary', fontSize: 12, fontFamily: 'monospace' }}>{row.at}</TableCell>
                <TableCell sx={{ color: 'primary.main', fontWeight: 600, fontSize: 13 }}>{row.user}</TableCell>
                <TableCell>{row.action}</TableCell>
                <TableCell>{row.detail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CrmCard>
    </Box>
  );
}
