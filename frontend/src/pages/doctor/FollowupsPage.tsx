import { Box, Button, Card, CardContent, Chip, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFollowups, updateFollowup } from '@/api/followups';
import { PageHeader } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiError';

export function DoctorFollowupsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['followups', 'doctor'],
    queryFn: () => fetchFollowups({ filter: 'pending', page: 1, limit: 50 }),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => updateFollowup(id, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      showToast('Follow-up completed.');
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Failed.'), 'error'),
  });

  return (
    <Box>
      <PageHeader title="Follow-ups" subtitle="Your pending follow-ups" />
      <Card>
        <CardContent sx={{ p: 0 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.data || []).map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.patient?.name}</TableCell>
                    <TableCell>{f.dueDate}</TableCell>
                    <TableCell>{f.notes || '—'}</TableCell>
                    <TableCell>
                      <Chip label={f.status} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => completeMutation.mutate(f.id)}>
                        Complete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
