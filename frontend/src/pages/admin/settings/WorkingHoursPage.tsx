import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
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
import { fetchWorkingHours, updateWorkingHours } from '@/api/settings';
import { getApiErrorMessage } from '@/utils/apiError';
import type { DayHours, WorkingHours } from '@/types/user';

const DAYS: { key: string; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export function WorkingHoursPage() {
  const queryClient = useQueryClient();
  const [hours, setHours] = useState<WorkingHours>({});
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'working-hours'],
    queryFn: fetchWorkingHours,
  });

  useEffect(() => {
    if (data) setHours(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => updateWorkingHours(hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'working-hours'] });
      setInfo('Working hours updated successfully.');
      setError('');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to update working hours.')),
  });

  const updateDay = (day: string, patch: Partial<DayHours>) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...patch },
    }));
  };

  if (isLoading || !data) {
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
            <Typography variant="h3">Weekly Schedule</Typography>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                <TableCell>Open</TableCell>
                <TableCell>Close</TableCell>
                <TableCell>Closed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {DAYS.map(({ key, label }) => {
                const day = hours[key] || { open: '09:00', close: '18:00', closed: false };
                return (
                  <TableRow key={key}>
                    <TableCell>{label}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="time"
                        value={day.open}
                        disabled={day.closed}
                        onChange={(e) => updateDay(key, { open: e.target.value })}
                        inputProps={{ step: 300 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="time"
                        value={day.close}
                        disabled={day.closed}
                        onChange={(e) => updateDay(key, { close: e.target.value })}
                        inputProps={{ step: 300 }}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={day.closed}
                            onChange={(e) => updateDay(key, { closed: e.target.checked })}
                          />
                        }
                        label="Closed"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Box sx={{ p: 2.5 }}>
            <Button
              variant="contained"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Working Hours'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
