import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginValidation } from '../validations/auth';
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
  useTheme,
  useMediaQuery,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Divider,
  Link,
} from '@mui/material';
import Logo from '../assets/images/logo.jpg';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginValidation),
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    // Remove @rwandair.com from the username if it exists
    if (data.username.includes('@rwandair.com')) {
      data.username = data.username.replace('@rwandair.com', '');
    }
    try {
      await dispatch(login(data)).unwrap();
      toast.success(`Check your email for OTP`);
      navigate('/verify-otp');
    } catch (error) {
      toast.error(error);
      navigate('/');
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
              objectFit: 'contain' 
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
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
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
                Invoice Management System
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Sign in to access your account
              </Typography>
              <Divider />
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Username Field */}
                <TextField
                  {...register('username')}
                  label="Username"
                  placeholder="Enter your username without @rwandair.com"
                  type="text"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                />

                {/* Password Field */}
                <TextField
                  {...register('password')}
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 1 }}
                />

                {/* Account Links */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Link
                    component={RouterLink}
                    to="/register"
                    underline="hover"
                    sx={{ 
                      fontSize: '0.875rem',
                      color: '#00529B'
                    }}
                  >
                    Create account
                  </Link>
                  <Link
                    href="#"
                    underline="hover"
                    sx={{ 
                      fontSize: '0.875rem',
                      color: '#00529B'
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

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
                    'Sign In'
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

export default Login;