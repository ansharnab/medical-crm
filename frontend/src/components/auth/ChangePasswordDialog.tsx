import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/utils/apiError';

export function ChangePasswordDialog() {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const open = Boolean(
    user?.mustChangePassword &&
      (user.role === 'client_admin' || user.role === 'doctor' || user.role === 'receptionist')
  );

  if (!open) return null;

  const handleSubmit = async () => {
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to change password.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      onClose={(_, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
      }}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(15, 23, 42, 0.72)' } },
      }}
    >
      <DialogTitle>Change your password</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          For security, you must set a new password before using the clinic dashboard.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoFocus
          />
          <TextField
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            helperText="Minimum 8 characters"
          />
          <TextField
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              isSubmitting || !currentPassword || !newPassword || !confirmPassword
            }
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
