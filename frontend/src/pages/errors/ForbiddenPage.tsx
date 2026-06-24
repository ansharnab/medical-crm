import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <Typography variant="h1" sx={{ fontSize: 48 }}>
        403
      </Typography>
      <Typography color="text.secondary">You do not have permission to access this page.</Typography>
      <Button variant="contained" component={RouterLink} to="/login">
        Go to Login
      </Button>
    </Box>
  );
}
