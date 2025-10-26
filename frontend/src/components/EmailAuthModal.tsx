import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Email, Lock } from '@mui/icons-material';

interface EmailAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}

const EmailAuthModal: React.FC<EmailAuthModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSubmit(email.trim().toLowerCase());
    } catch (err) {
      setError('Failed to save your preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          border: '1px solid #333333',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Email sx={{ color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Customize Your Analytics
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
          Enter your email to customize the analytics charts with your own data.
          Your preferences will be saved for future visits.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          placeholder="your.email@example.com"
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#333333',
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
          InputProps={{
            startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />

        <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0, 212, 255, 0.1)', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>
            What happens next?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            • Your email will be used to save your custom chart configurations<br/>
            • You can edit chart values and they'll be saved automatically<br/>
            • Next time you visit, your custom data will be loaded<br/>
            • We'll ask for confirmation before overwriting existing data
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{ color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || !email.trim()}
          startIcon={isLoading ? <CircularProgress size={16} /> : <Lock />}
          sx={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b35 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #00a3cc 0%, #c53d00 100%)',
            },
          }}
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailAuthModal;
