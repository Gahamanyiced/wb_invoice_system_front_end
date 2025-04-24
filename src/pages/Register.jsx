import { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  AppBar,
  Toolbar,
  Grid,
  Box,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  Link as MuiLink,
  MenuItem,
  InputAdornment,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import Logo from '../assets/images/logo.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import NumbersIcon from '@mui/icons-material/Numbers';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentsIcon from '@mui/icons-material/Payments';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArticleIcon from '@mui/icons-material/Article';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// List of common currencies
const currencies = [
  { value: 'RWF', label: 'Rwandan Franc (RWF)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'KES', label: 'Kenyan Shilling (KES)' },
  { value: 'UGX', label: 'Ugandan Shilling (UGX)' },
  { value: 'TZS', label: 'Tanzanian Shilling (TZS)' },
];

// Payment terms options
const paymentTerms = [
  { value: 'Net 30', label: 'Net 30 days' },
  { value: 'Net 45', label: 'Net 45 days' },
  { value: 'Net 60', label: 'Net 60 days' },
  { value: 'Net 90', label: 'Net 90 days' },
  { value: 'Due on Receipt', label: 'Due on Receipt' },
  { value: 'EOM', label: 'End of Month' },
];

function SupplierRegister() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    profile: {
      company_name: '',
      supplier_number: '',
      tax_id: '',
      service_category: '',
      contact_name: '',
      phone_number: '',
      street_address: '',
      city: '',
      country: '',
      bank_name: '',
      account_name: '',
      account_number: '',
      iban: '',
      swift_code: '',
      sort_code: '',
      payment_currency: 'RWF',
      payment_terms: 'Net 30',
    },
  });

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if the field is part of the profile object
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(register(form)).unwrap();
      toast.success(
        'Registration successful! Please check your email for verification.'
      );
      navigate('/login');
    } catch (error) {
      toast.error(error.toString());
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const goToNextTab = () => {
    if (tabValue < 3) {
      setTabValue(tabValue + 1);
    }
  };

  const goToPrevTab = () => {
    if (tabValue > 0) {
      setTabValue(tabValue - 1);
    }
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
            variant="text"
            startIcon={<ArrowBackIcon />}
            sx={{
              color: '#FFF',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
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
            maxWidth: { xs: '90%', sm: '700px' },
            borderRadius: '12px',
            overflow: 'hidden',
            mb: 4,
            mt: 4,
          }}
        >
          <Box
            sx={{
              height: '8px',
              background: 'linear-gradient(90deg, #00529B 0%, #0077cc 100%)',
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
                  mb: 1,
                }}
              >
                Supplier Registration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Register as a supplier for RwandAir Invoice Management System
              </Typography>
              <Divider />
            </Box>

            {/* Tabs Navigation */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3 }}
            >
              <Tab
                label="Account Information"
                icon={<PersonIcon />}
                iconPosition="start"
              />
              <Tab
                label="Company Information"
                icon={<BusinessIcon />}
                iconPosition="start"
              />
              <Tab
                label="Address Information"
                icon={<LocationOnIcon />}
                iconPosition="start"
              />
              <Tab
                label="Payment Information"
                icon={<AccountBalanceIcon />}
                iconPosition="start"
              />
            </Tabs>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Account Information Tab */}
              {tabValue === 0 && (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="firstname"
                        label="First Name"
                        value={form.firstname}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="lastname"
                        label="Last Name"
                        value={form.lastname}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="email"
                        label="Email Address"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
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
                                onClick={handlePasswordVisibility}
                                edge="end"
                                aria-label="toggle password visibility"
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button 
                      variant="contained" 
                      onClick={goToNextTab}
                      sx={{ bgcolor: '#00529B' }}
                    >
                      Next
                    </Button>
                  </Box>
                </>
              )}

              {/* Company Information Tab */}
              {tabValue === 1 && (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.company_name"
                        label="Company Name"
                        value={form.profile.company_name}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.supplier_number"
                        label="Supplier Number"
                        value={form.profile.supplier_number}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <NumbersIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.tax_id"
                        label="Tax ID / VAT Number"
                        value={form.profile.tax_id}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <NumbersIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.service_category"
                        label="Service Category"
                        value={form.profile.service_category}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.contact_name"
                        label="Primary Contact Name"
                        value={form.profile.contact_name}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.phone_number"
                        label="Phone Number"
                        value={form.profile.phone_number}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocalPhoneIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button 
                      variant="outlined" 
                      onClick={goToPrevTab}
                    >
                      Back
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={goToNextTab}
                      sx={{ bgcolor: '#00529B' }}
                    >
                      Next
                    </Button>
                  </Box>
                </>
              )}

              {/* Address Information Tab */}
              {tabValue === 2 && (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        name="profile.street_address"
                        label="Street Address"
                        value={form.profile.street_address}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.city"
                        label="City"
                        value={form.profile.city}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.country"
                        label="Country"
                        value={form.profile.country}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button 
                      variant="outlined" 
                      onClick={goToPrevTab}
                    >
                      Back
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={goToNextTab}
                      sx={{ bgcolor: '#00529B' }}
                    >
                      Next
                    </Button>
                  </Box>
                </>
              )}

              {/* Payment Information Tab */}
              {tabValue === 3 && (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.bank_name"
                        label="Bank Name"
                        value={form.profile.bank_name}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccountBalanceIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.account_name"
                        label="Account Name"
                        value={form.profile.account_name}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.account_number"
                        label="Account Number"
                        value={form.profile.account_number}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CreditCardIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.iban"
                        label="IBAN"
                        value={form.profile.iban}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CreditCardIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.swift_code"
                        label="SWIFT Code"
                        value={form.profile.swift_code}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PaymentsIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="profile.sort_code"
                        label="Sort Code"
                        value={form.profile.sort_code}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PaymentsIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        name="profile.payment_currency"
                        label="Payment Currency"
                        value={form.profile.payment_currency}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoneyIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      >
                        {currencies.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        name="profile.payment_terms"
                        label="Payment Terms"
                        value={form.profile.payment_terms}
                        onChange={handleChange}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ArticleIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      >
                        {paymentTerms.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button 
                      variant="outlined" 
                      onClick={goToPrevTab}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        bgcolor: '#00529B',
                        padding: '0.75rem 1.5rem',
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
                        'Register as Supplier'
                      )}
                    </Button>
                  </Box>
                </>
              )}
            </form>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already registered?{' '}
                <MuiLink
                  component={Link}
                  to="/login"
                  sx={{
                    fontWeight: 500,
                    color: '#00529B',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign in
                </MuiLink>
              </Typography>
            </Box>
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
              <MuiLink
                href="#"
                color="inherit"
                sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}
              >
                Privacy Policy
              </MuiLink>
              <MuiLink
                href="#"
                color="inherit"
                sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}
              >
                Terms of Service
              </MuiLink>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default SupplierRegister;