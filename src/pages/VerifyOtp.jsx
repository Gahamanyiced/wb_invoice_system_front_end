import {useState} from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp } from '../features/auth/authSlice';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { otpValidation } from '../validations/auth';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  Container,
  Typography,
  TextField,
  Button,
  AppBar,
  Toolbar,
  Box,
  InputAdornment,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Link,
  Paper,
} from '@mui/material';
import Logo from '../assets/images/logo.jpg';
import KeyIcon from '@mui/icons-material/Key';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function VerifyOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const [showOtp, setShowOtp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(otpValidation),
  });

  const handleClickShowOtp = () => {
    setShowOtp(!showOtp);
  };

  const onSubmit = async (data) => {
    try {
      await dispatch(verifyOtp(data.otp)).unwrap();
      toast.success(`OTP verification successful`);
      navigate('/');
    } catch (error) {
      toast.error(error);
      navigate('/login');
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
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
              objectFit: 'contain' 
            }}
          />
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            sx={{ 
              color: '#FFF',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
            onClick={handleBackToLogin}
          >
            Back to Login
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
              background: 'linear-gradient(90deg, #00529B 0%, #0077cc 100%)'
            }} 
          />
          
          <CardContent sx={{ padding: '2rem' }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h5"
                sx={{ 
                  color: '#00529B', 
                  fontWeight: 600,
                  mb: 1
                }}
              >
                OTP Verification
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Enter the one-time password sent to your email
              </Typography>
              <Divider />
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* OTP Field */}
                <TextField
                  {...register('otp')}
                  label="One-Time Password"
                  placeholder="Enter your OTP"
                  type={showOtp ? 'text' : 'password'}
                  variant="outlined"
                  fullWidth
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowOtp}
                          edge="end"
                          aria-label="toggle otp visibility"
                        >
                          {showOtp ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.otp}
                  helperText={errors.otp?.message}
                />

                {/* Resend OTP Link */}
                {/* <Box sx={{ textAlign: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Didn't receive the code?{' '}
                    <Link
                      href="#"
                      underline="hover"
                      sx={{ 
                        fontWeight: 500,
                        color: '#00529B'
                      }}
                    >
                      Resend OTP
                    </Link>
                  </Typography>
                </Box> */}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    bgcolor: '#00529B',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#003a6d',
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Verify & Proceed'
                  )}
                </Button>
              </Box>
            </form>
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
            <Typography variant="body2" align="center" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Copyright © {new Date().getFullYear()} RwandAir. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link href="#" color="inherit" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                Privacy Policy
              </Link>
              <Link href="#" color="inherit" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                Terms of Service
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default VerifyOtp;