import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { forgotPassword } from '@/api/auth';
import { getApiErrorMessage } from '@/utils/apiError';
import { colors } from '@/theme/tokens';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Request failed. Try again.'));
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: colors.neutral[50], p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h2" sx={{ fontSize: 22, mb: 1 }}>Forgot password</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your email — we&apos;ll send a reset link (valid 1 hour).
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {sent ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              If an account exists for {email}, a reset link has been sent. Check backend logs in dev if SMTP is not configured.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
              <Button type="submit" variant="contained" fullWidth>Send reset link</Button>
            </Box>
          )}
          <Button component={RouterLink} to="/login" fullWidth sx={{ mt: 2 }}>← Back to login</Button>
        </CardContent>
      </Card>
    </Box>
  );
}
