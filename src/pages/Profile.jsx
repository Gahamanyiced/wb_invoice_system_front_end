import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RootLayout from '../layouts/RootLayout';
import {
  Typography,
  Box,
  Container,
  Grid,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { toast } from 'react-toastify';
import { updateSupplier } from '../features/user/userSlice';

// For the payment currencies dropdown
const currencies = [
  { value: 'RWF', label: 'Rwandan Franc (RWF)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'KES', label: 'Kenyan Shilling (KES)' },
  { value: 'UGX', label: 'Ugandan Shilling (UGX)' },
  { value: 'TZS', label: 'Tanzanian Shilling (TZS)' },
];

// For the payment terms dropdown
const paymentTerms = [
  { value: 'Net 30', label: 'Net 30 days' },
  { value: 'Net 45', label: 'Net 45 days' },
  { value: 'Net 60', label: 'Net 60 days' },
  { value: 'Net 90', label: 'Net 90 days' },
  { value: 'Due on Receipt', label: 'Due on Receipt' },
  { value: 'EOM', label: 'End of Month' },
];

function Profile() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.user);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
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
    }
  });
  const [tabValue, setTabValue] = useState(0);

  // Get the user from localStorage when the component mounts
  useEffect(() => {
    const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userFromStorage);

    // Initialize the form with the user data
    setFormData({
      firstname: userFromStorage.firstname || '',
      lastname: userFromStorage.lastname || '',
      email: userFromStorage.email || '',
      profile: {
        company_name: userFromStorage.profile?.company_name || '',
        supplier_number: userFromStorage.profile?.supplier_number || '',
        tax_id: userFromStorage.profile?.tax_id || '',
        service_category: userFromStorage.profile?.service_category || '',
        contact_name: userFromStorage.profile?.contact_name || '',
        phone_number: userFromStorage.profile?.phone_number || '',
        street_address: userFromStorage.profile?.street_address || '',
        city: userFromStorage.profile?.city || '',
        country: userFromStorage.profile?.country || '',
        bank_name: userFromStorage.profile?.bank_name || '',
        account_name: userFromStorage.profile?.account_name || '',
        account_number: userFromStorage.profile?.account_number || '',
        iban: userFromStorage.profile?.iban || '',
        swift_code: userFromStorage.profile?.swift_code || '',
        sort_code: userFromStorage.profile?.sort_code || '',
        payment_currency: userFromStorage.profile?.payment_currency || 'RWF',
        payment_terms: userFromStorage.profile?.payment_terms || 'Net 30',
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if the field is part of the profile
    if (name.includes('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Dispatch the updateSupplier action
      await dispatch(updateSupplier(formData)).unwrap();
      
      // Update the user in localStorage after successful API call
      localStorage.setItem('user', JSON.stringify({
        ...user,
        ...formData
      }));
      
      setUser({
        ...user,
        ...formData
      });
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!user) {
    return (
      <RootLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
          }}
        >
          <CircularProgress />
        </Box>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Card elevation={3}>
          <CardHeader
            title="User Profile"
            subheader={`Role: ${user.role || 'N/A'}`}
            action={
              !isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{ bgcolor: '#00529B' }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Box>
              )
            }
            avatar={
              <Avatar sx={{ bgcolor: '#00529B', width: 56, height: 56 }}>
                {user.firstname?.charAt(0) || 'U'}
              </Avatar>
            }
          />

          <Divider />

          <CardContent>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3 }}
            >
              <Tab
                label="Personal Information"
                icon={<PersonIcon />}
                iconPosition="start"
              />
              <Tab
                label="Company Information"
                icon={<BusinessIcon />}
                iconPosition="start"
              />
              <Tab
                label="Payment Information"
                icon={<AccountBalanceIcon />}
                iconPosition="start"
              />
            </Tabs>

            <form onSubmit={handleSubmit}>
              {/* Personal Information Tab */}
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              )}

              {/* Company Information Tab */}
              {tabValue === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      name="profile.company_name"
                      value={formData.profile.company_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Supplier Number"
                      name="profile.supplier_number"
                      value={formData.profile.supplier_number}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tax ID / VAT Number"
                      name="profile.tax_id"
                      value={formData.profile.tax_id}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Service Category"
                      name="profile.service_category"
                      value={formData.profile.service_category}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Name"
                      name="profile.contact_name"
                      value={formData.profile.contact_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="profile.phone_number"
                      value={formData.profile.phone_number}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      name="profile.street_address"
                      value={formData.profile.street_address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="profile.city"
                      value={formData.profile.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="profile.country"
                      value={formData.profile.country}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              )}

              {/* Payment Information Tab */}
              {tabValue === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Bank Name"
                      name="profile.bank_name"
                      value={formData.profile.bank_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Account Name"
                      name="profile.account_name"
                      value={formData.profile.account_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      name="profile.account_number"
                      value={formData.profile.account_number}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="IBAN"
                      name="profile.iban"
                      value={formData.profile.iban}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SWIFT Code"
                      name="profile.swift_code"
                      value={formData.profile.swift_code}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Sort Code"
                      name="profile.sort_code"
                      value={formData.profile.sort_code}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Payment Currency"
                      name="profile.payment_currency"
                      value={formData.profile.payment_currency}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    >
                      {currencies.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      label="Payment Terms"
                      name="profile.payment_terms"
                      value={formData.profile.payment_terms}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'filled'}
                      margin="normal"
                    >
                      {paymentTerms.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              )}
            </form>
          </CardContent>
        </Card>
      </Container>
    </RootLayout>
  );
}

export default Profile;