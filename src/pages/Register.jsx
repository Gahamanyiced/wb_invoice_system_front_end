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
  FormControlLabel,
  Switch,
  FormHelperText,
} from '@mui/material';
import Logo from '../assets/images/logo.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { supplierRegistrationValidation } from '../validations/auth';
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
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import countries from '../utils/countries';
import currencies from '../utils/currencies';

function SupplierRegister() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [ibanNotApplicable, setIbanNotApplicable] = useState(false);
  const [swiftNotApplicable, setSwiftNotApplicable] = useState(false);

  // Initialize form with react-hook-form and validation
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    watch,
    setError,
    trigger,
  } = useForm({
    resolver: yupResolver(supplierRegistrationValidation),
    mode: 'onBlur',
    context: { ibanNotApplicable, swiftNotApplicable },
    defaultValues: {
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
      },
    },
  });

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValue(name, value, { shouldValidate: true });
  };

  const handleIbanNotApplicable = (e) => {
    setIbanNotApplicable(e.target.checked);
    if (e.target.checked) {
      setValue('profile.iban', 'N/A');
      clearErrors('profile.iban');
    } else {
      setValue('profile.iban', '');
    }
  };

  const handleSwiftNotApplicable = (e) => {
    setSwiftNotApplicable(e.target.checked);
    if (e.target.checked) {
      setValue('profile.swift_code', 'N/A');
      clearErrors('profile.swift_code');
    } else {
      setValue('profile.swift_code', '');
    }
  };

  const onSubmit = async (data) => {
    try {
      await dispatch(register(data)).unwrap();
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

  const goToNextTab = async () => {
    // Validate the current tab fields before proceeding
    let isValid = false;

    switch (tabValue) {
      case 0:
        isValid = await trigger(['firstname', 'lastname', 'email', 'password']);
        break;
      case 1:
        isValid = await trigger([
          'profile.company_name',
          'profile.supplier_number',
          'profile.tax_id',
          'profile.service_category',
          'profile.contact_name',
          'profile.phone_number',
        ]);
        break;
      case 2:
        isValid = await trigger([
          'profile.street_address',
          'profile.city',
          'profile.country',
        ]);
        break;
      default:
        isValid = true;
    }

    if (isValid && tabValue < 3) {
      setTabValue(tabValue + 1);
    }
  };

  const goToPrevTab = () => {
    if (tabValue > 0) {
      setTabValue(tabValue - 1);
    }
  };

  // Check if current tab has validation errors
  const hasTabErrors = (tabIndex) => {
    switch (tabIndex) {
      case 0: // Account Information
        return !!(
          errors.email ||
          errors.password ||
          errors.firstname ||
          errors.lastname
        );
      case 1: // Company Information
        return !!(
          errors.profile?.company_name ||
          errors.profile?.supplier_number ||
          errors.profile?.tax_id ||
          errors.profile?.service_category ||
          errors.profile?.contact_name ||
          errors.profile?.phone_number
        );
      case 2: // Address Information
        return !!(
          errors.profile?.street_address ||
          errors.profile?.city ||
          errors.profile?.country
        );
      case 3: // Payment Information
        return !!(
          errors.profile?.bank_name ||
          errors.profile?.account_name ||
          errors.profile?.account_number ||
          (!ibanNotApplicable && errors.profile?.iban) ||
          (!swiftNotApplicable && errors.profile?.swift_code) ||
          errors.profile?.payment_currency
        );
      default:
        return false;
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
                sx={{
                  color: hasTabErrors(0) ? 'error.main' : 'inherit',
                  '& .MuiSvgIcon-root': {
                    color: hasTabErrors(0) ? 'error.main' : 'inherit',
                  },
                }}
              />
              <Tab
                label="Company Information"
                icon={<BusinessIcon />}
                iconPosition="start"
                sx={{
                  color: hasTabErrors(1) ? 'error.main' : 'inherit',
                  '& .MuiSvgIcon-root': {
                    color: hasTabErrors(1) ? 'error.main' : 'inherit',
                  },
                }}
              />
              <Tab
                label="Address Information"
                icon={<LocationOnIcon />}
                iconPosition="start"
                sx={{
                  color: hasTabErrors(2) ? 'error.main' : 'inherit',
                  '& .MuiSvgIcon-root': {
                    color: hasTabErrors(2) ? 'error.main' : 'inherit',
                  },
                }}
              />
              <Tab
                label="Payment Information"
                icon={<AccountBalanceIcon />}
                iconPosition="start"
                sx={{
                  color: hasTabErrors(3) ? 'error.main' : 'inherit',
                  '& .MuiSvgIcon-root': {
                    color: hasTabErrors(3) ? 'error.main' : 'inherit',
                  },
                }}
              />
            </Tabs>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Account Information Tab */}
              {tabValue === 0 && (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('firstname')}
                        name="firstname"
                        label="First Name"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.firstname}
                        helperText={errors.firstname?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon
                                color={errors.firstname ? 'error' : 'action'}
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('lastname')}
                        name="lastname"
                        label="Last Name"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.lastname}
                        helperText={errors.lastname?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon
                                color={errors.lastname ? 'error' : 'action'}
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        {...registerField('email')}
                        name="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon
                                color={errors.email ? 'error' : 'action'}
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        {...registerField('password')}
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlinedIcon
                                color={errors.password ? 'error' : 'action'}
                              />
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
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}
                  >
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
                        {...registerField('profile.company_name')}
                        name="profile.company_name"
                        label="Company Name"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.company_name}
                        helperText={errors.profile?.company_name?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessIcon
                                color={
                                  errors.profile?.company_name
                                    ? 'error'
                                    : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('profile.supplier_number')}
                        name="profile.supplier_number"
                        label="Supplier Number"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.supplier_number}
                        helperText={errors.profile?.supplier_number?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <NumbersIcon
                                color={
                                  errors.profile?.supplier_number
                                    ? 'error'
                                    : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('profile.tax_id')}
                        name="profile.tax_id"
                        label="Tax ID / VAT Number"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.tax_id}
                        helperText={errors.profile?.tax_id?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <NumbersIcon
                                color={
                                  errors.profile?.tax_id ? 'error' : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('profile.service_category')}
                        name="profile.service_category"
                        label="Service Category"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.service_category}
                        helperText={errors.profile?.service_category?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessIcon
                                color={
                                  errors.profile?.service_category
                                    ? 'error'
                                    : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('profile.contact_name')}
                        name="profile.contact_name"
                        label="Primary Contact Name"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.contact_name}
                        helperText={errors.profile?.contact_name?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon
                                color={
                                  errors.profile?.contact_name
                                    ? 'error'
                                    : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('profile.phone_number')}
                        name="profile.phone_number"
                        label="Phone Number"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.phone_number}
                        helperText={errors.profile?.phone_number?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocalPhoneIcon
                                color={
                                  errors.profile?.phone_number
                                    ? 'error'
                                    : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 3,
                    }}
                  >
                    <Button variant="outlined" onClick={goToPrevTab}>
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
                    {/* Country field - now first in the form */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        {...registerField('profile.country')}
                        name="profile.country"
                        label="Country"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.country}
                        helperText={errors.profile?.country?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon
                                color={
                                  errors.profile?.country ? 'error' : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                        defaultValue=""
                      >
                        <MenuItem value="" disabled>
                          <em>Select a country</em>
                        </MenuItem>
                        {countries.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Street Address */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('profile.street_address')}
                        name="profile.street_address"
                        label="Address"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.street_address}
                        helperText={errors.profile?.street_address?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon
                                color={
                                  errors.profile?.street_address
                                    ? 'error'
                                    : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>

                    {/* City */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('profile.city')}
                        name="profile.city"
                        label="City"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.city}
                        helperText={errors.profile?.city?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon
                                color={
                                  errors.profile?.city ? 'error' : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 3,
                    }}
                  >
                    <Button variant="outlined" onClick={goToPrevTab}>
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
                        {...registerField('profile.bank_name')}
                        name="profile.bank_name"
                        label="Bank Name"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.bank_name}
                        helperText={errors.profile?.bank_name?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccountBalanceIcon
                                color={
                                  errors.profile?.bank_name ? 'error' : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('profile.account_name')}
                        name="profile.account_name"
                        label="Account Name"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.account_name}
                        helperText={errors.profile?.account_name?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon
                                color={
                                  errors.profile?.account_name
                                    ? 'error'
                                    : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('profile.account_number')}
                        name="profile.account_number"
                        label="Account Number"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.account_number}
                        helperText={errors.profile?.account_number?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CreditCardIcon
                                color={
                                  errors.profile?.account_number
                                    ? 'error'
                                    : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>

                    {/* Payment Currency */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        {...registerField('profile.payment_currency')}
                        name="profile.payment_currency"
                        label="Payment Currency"
                        fullWidth
                        required
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.payment_currency}
                        helperText={errors.profile?.payment_currency?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoneyIcon
                                color={
                                  errors.profile?.payment_currency
                                    ? 'error'
                                    : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                        defaultValue="RWF"
                      >
                        {currencies.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* IBAN Field with N/A Toggle */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('profile.iban')}
                        name="profile.iban"
                        label="IBAN"
                        fullWidth
                        required={!ibanNotApplicable}
                        margin="normal"
                        variant="outlined"
                        disabled={ibanNotApplicable}
                        error={!ibanNotApplicable && !!errors.profile?.iban}
                        helperText={
                          !ibanNotApplicable
                            ? errors.profile?.iban?.message
                            : ''
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CreditCardIcon
                                color={
                                  !ibanNotApplicable && errors.profile?.iban
                                    ? 'error'
                                    : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                          endAdornment: ibanNotApplicable && (
                            <InputAdornment position="end">
                              <Typography
                                variant="body2"
                                sx={{
                                  bgcolor: '#f0f0f0',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  color: 'text.secondary',
                                  fontWeight: 'medium',
                                }}
                              >
                                N/A
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mt: 1,
                        }}
                      >
                        <Switch
                          checked={ibanNotApplicable}
                          onChange={handleIbanNotApplicable}
                          color="primary"
                          size="small"
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          IBAN not applicable
                        </Typography>
                      </Box>
                    </Grid>

                    {/* SWIFT Code Field with N/A Toggle */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('profile.swift_code')}
                        name="profile.swift_code"
                        label="SWIFT Code"
                        fullWidth
                        required={!swiftNotApplicable}
                        margin="normal"
                        variant="outlined"
                        disabled={swiftNotApplicable}
                        error={
                          !swiftNotApplicable && !!errors.profile?.swift_code
                        }
                        helperText={
                          !swiftNotApplicable
                            ? errors.profile?.swift_code?.message
                            : ''
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PaymentsIcon
                                color={
                                  !swiftNotApplicable &&
                                  errors.profile?.swift_code
                                    ? 'error'
                                    : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                          endAdornment: swiftNotApplicable && (
                            <InputAdornment position="end">
                              <Typography
                                variant="body2"
                                sx={{
                                  bgcolor: '#f0f0f0',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  color: 'text.secondary',
                                  fontWeight: 'medium',
                                }}
                              >
                                N/A
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mt: 1,
                        }}
                      >
                        <Switch
                          checked={swiftNotApplicable}
                          onChange={handleSwiftNotApplicable}
                          color="primary"
                          size="small"
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          SWIFT Code not applicable
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Sort Code */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        {...registerField('profile.sort_code')}
                        name="profile.sort_code"
                        label="Sort Code"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        error={!!errors.profile?.sort_code}
                        helperText={errors.profile?.sort_code?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PaymentsIcon
                                color={
                                  errors.profile?.sort_code ? 'error' : 'action'
                                }
                              />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 3,
                    }}
                  >
                    <Button variant="outlined" onClick={goToPrevTab}>
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading || hasTabErrors(3)}
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
