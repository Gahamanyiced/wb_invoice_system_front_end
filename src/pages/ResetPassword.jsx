import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  AppBar,
  Toolbar,
  InputAdornment,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Link,
  Alert,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { supplierPasswordResetConfirm } from '../features/auth/authSlice';
import Logo from '../assets/images/logo.jpg';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validToken, setValidToken] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const { token } = useParams();

  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setError('Invalid or missing password reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    const result = await dispatch(
      supplierPasswordResetConfirm({
        token,
        new_password: password,
        confirm_password: confirmPassword,
      }),
    );

    if (supplierPasswordResetConfirm.fulfilled.match(result)) {
      setResetSuccess(true);
    } else {
      setError(result.payload || 'Something went wrong. Please try again.');
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
            {!validToken ? (
              <Box textAlign="center">
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{ color: '#00529B', fontWeight: 600, mb: 1 }}
                >
                  Invalid Link
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  The password reset link is invalid or has expired. Please
                  request a new password reset link.
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
                  onClick={() => navigate('/forgot-password')}
                >
                  Request New Link
                </Button>
              </Box>
            ) : resetSuccess ? (
              <Box textAlign="center">
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{ color: '#00529B', fontWeight: 600, mb: 1 }}
                >
                  Password Reset Successful
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Your password has been reset successfully. You can now log in
                  with your new password.
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
                  Go to Login
                </Button>
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
                    Reset Password
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Enter your new password below.
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
                    id="password"
                    label="New Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mt: 0 }}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="confirmPassword"
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleToggleConfirmPasswordVisibility}
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOffIcon />
                            ) : (
                              <VisibilityIcon />
                            )}
                          </IconButton>
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
                      'Reset Password'
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

export default ResetPassword;
