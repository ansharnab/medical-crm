import { Alert, Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { verifyClinicEmail } from '@/api/organizations';

export function VerifyClinicEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const mutation = useMutation({
    mutationFn: () => verifyClinicEmail(token),
  });

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
        <Card sx={{ maxWidth: 480, width: '100%' }}>
          <CardContent>
            <Alert severity="error">Invalid verification link.</Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!mutation.isIdle && !mutation.isPending) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
        <Card sx={{ maxWidth: 480, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            {mutation.isSuccess ? (
              <>
                <Alert severity="success" sx={{ mb: 2 }}>
                  {mutation.data.message}
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {mutation.data.organization.name} is now active.
                </Typography>
                <Button variant="contained" component={RouterLink} to="/login">
                  Go to Login
                </Button>
              </>
            ) : (
              <Alert severity="error">
                Verification failed. The link may be invalid or expired.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontSize: 22, mb: 1 }}>
            Verify Clinic Email
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Confirm your clinic contact email to activate your account.
          </Typography>
          {mutation.isPending ? (
            <CircularProgress />
          ) : (
            <Button variant="contained" onClick={() => mutation.mutate()}>
              Verify Email
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
