import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  AppBar,
  Toolbar,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Link,
  Alert,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { supplierPasswordReset } from '../features/auth/authSlice';
import Logo from '../assets/images/logo.jpg';
import EmailIcon from '@mui/icons-material/Email';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    const result = await dispatch(supplierPasswordReset({ email }));

    if (supplierPasswordReset.fulfilled.match(result)) {
      setEmailSent(true);
    } else {
      setError(result.payload || 'Something went wrong. Please try again.');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/user_manual.pdf';
    link.download = 'user_manual.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
      }}
    >
      {/* App Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: '#00529B',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: { xs: '0.5rem 1rem', md: '0.5rem 2rem' },
          }}
        >
          <Box
            component="img"
            src={Logo}
            alt="RwandAir Logo"
            sx={{
              height: { xs: 40, md: 50 },
              objectFit: 'contain',
            }}
          />
          <Button
            variant="outlined"
            startIcon={<CloudDownloadOutlinedIcon />}
            sx={{
              color: '#FFF',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: '#fff',
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
            onClick={handleDownload}
          >
            User Manual
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1,
          padding: { xs: '1rem', md: '2rem' },
        }}
      >
        <Card
          elevation={6}
          sx={{
            width: '100%',
            maxWidth: { xs: '90%', sm: '450px' },
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '8px',
              background: 'linear-gradient(90deg, #00529B 0%, #0077cc 100%)',
            }}
          />

          <CardContent sx={{ padding: '2rem' }}>
            {emailSent ? (
              <Box textAlign="center">
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{ color: '#00529B', fontWeight: 600, mb: 1 }}
                >
                  Check Your Email
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  We've sent a password reset link to{' '}
                  <strong>{email}</strong>. Please check your email and follow
                  the instructions to reset your password.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 2,
                    mb: 2,
                    bgcolor: '#00529B',
                    '&:hover': { bgcolor: '#003a6d' },
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontWeight: 600,
                  }}
                  onClick={() => navigate('/login')}
                >
                  Return to Login
                </Button>
                <Typography variant="body2" sx={{ mt: 3 }}>
                  Didn't receive the email?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                      setEmailSent(false);
                      setError('');
                    }}
                    sx={{ fontWeight: 500, color: '#00529B' }}
                  >
                    Try again
                  </Link>
                </Typography>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h5"
                    component="h1"
                    sx={{ color: '#00529B', fontWeight: 600, mb: 1 }}
                  >
                    Forgot Password
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Enter your email address and we'll send you a link to reset
                    your password.
                  </Typography>
                  <Divider />
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mt: 0 }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      mt: 1,
                      mb: 2,
                      bgcolor: '#00529B',
                      '&:hover': { bgcolor: '#003a6d' },
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Link
                      component={RouterLink}
                      to="/login"
                      variant="body2"
                      sx={{
                        color: '#00529B',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                        fontSize: '0.875rem',
                      }}
                    >
                      Back to login
                    </Link>
                  </Box>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#00529B',
          py: 2,
          width: '100%',
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 },
            }}
          >
            <Typography
              variant="body2"
              align="center"
              sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              Copyright © {new Date().getFullYear()} RwandAir. All rights
              reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link
                href="#"
                color="inherit"
                sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                color="inherit"
                sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}
              >
                Terms of Service
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ForgotPassword;