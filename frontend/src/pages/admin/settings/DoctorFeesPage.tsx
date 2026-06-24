import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchDoctorFees, updateDoctorFee } from '@/api/settings';
import { getApiErrorMessage } from '@/utils/apiError';
import type { DoctorFeeRow } from '@/types/user';

export function DoctorFeesPage() {
  const queryClient = useQueryClient();
  const [fees, setFees] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'doctor-fees'],
    queryFn: fetchDoctorFees,
  });

  useEffect(() => {
    if (data) {
      const next: Record<string, string> = {};
      data.forEach((row) => {
        next[row.doctorId] = row.consultationFee != null ? String(row.consultationFee) : '';
      });
      setFees(next);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (doctor: DoctorFeeRow) => {
      const value = Number(fees[doctor.doctorId]);
      if (Number.isNaN(value) || value < 0) {
        throw new Error('Enter a valid consultation fee.');
      }
      return updateDoctorFee(doctor.doctorId, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'doctor-fees'] });
      setInfo('Consultation fee updated.');
      setError('');
    },
    onError: (err) =>
      setError(
        err instanceof Error && err.message.includes('valid')
          ? err.message
          : getApiErrorMessage(err, 'Failed to update consultation fee.')
      ),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {info && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setInfo('')}>
          {info}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography variant="h3">Doctor Consultation Fees</Typography>
          </Box>
          {!data?.length ? (
            <Box sx={{ px: 2.5, pb: 3 }}>
              <Typography color="text.secondary">
                Add doctors from the Users page to configure consultation fees.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Specialization</TableCell>
                  <TableCell>Fee (₹)</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((doctor) => (
                  <TableRow key={doctor.doctorId}>
                    <TableCell>
                      {doctor.name}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {doctor.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{doctor.specialization || '—'}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={fees[doctor.doctorId] ?? ''}
                        onChange={(e) =>
                          setFees((prev) => ({ ...prev, [doctor.doctorId]: e.target.value }))
                        }
                        sx={{ width: 140 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => saveMutation.mutate(doctor)}
                        disabled={saveMutation.isPending}
                      >
                        Save
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
