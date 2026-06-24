import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '@/api/auth';
import { getApiErrorMessage } from '@/utils/apiError';
import { colors } from '@/theme/tokens';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid reset link.');
      return;
    }
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Reset failed.'));
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: colors.neutral[50], p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h2" sx={{ fontSize: 22, mb: 1 }}>Reset password</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {done ? (
            <Alert severity="success">Password updated. Redirecting to login…</Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField label="New password" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />
              <TextField label="Confirm password" type="password" fullWidth required value={confirm} onChange={(e) => setConfirm(e.target.value)} sx={{ mb: 2 }} />
              <Button type="submit" variant="contained" fullWidth disabled={!token}>Update password</Button>
            </Box>
          )}
          <Button component={RouterLink} to="/login" fullWidth sx={{ mt: 2 }}>← Back to login</Button>
        </CardContent>
      </Card>
    </Box>
  );
}
