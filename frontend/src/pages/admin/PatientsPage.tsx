import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { fetchPatients } from '@/api/patients';
import {
  CrmBadge,
  CrmEmpty,
  CrmHint,
  CrmKpi,
  CrmListLoading,
  CrmPagination,
  CrmPanel,
  CrmSearch,
  FigmaScreen,
} from '@/components/app';

const PAGE_SIZE = 10;

export function AdminPatientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-patients', search, page],
    queryFn: () => fetchPatients({ search: search || undefined, page, limit: PAGE_SIZE }),
  });

  const patients = data?.data ?? [];

  return (
    <FigmaScreen>
      <CrmHint>Clinic patients — read-only oversight · search by name or phone</CrmHint>
      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <CrmKpi label="Total" value={data?.meta.total ?? 0} icon="👥" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Page" value={page} icon="📄" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
        <CrmKpi label="Showing" value={patients.length} icon="✓" iconColor="#10b981" sparkColor="#10b981" />
      </div>
      <CrmPanel title="Patients">
        <CrmSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search patients…" />
        {isLoading ? (
          <CrmListLoading />
        ) : patients.length === 0 ? (
          <CrmEmpty message="No patients found." />
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Gender</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.firstName} {p.lastName}</td>
                  <td>{p.phone}</td>
                  <td><CrmBadge label={p.gender || '—'} variant="info" /></td>
                  <td>
                    <RouterLink to={`/admin/patients/${p.id}`} className="crm-link">View</RouterLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data?.meta && (
          <CrmPagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        )}
      </CrmPanel>
    </FigmaScreen>
  );
}
