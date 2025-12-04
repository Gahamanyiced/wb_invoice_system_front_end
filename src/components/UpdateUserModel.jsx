import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Modal from '@mui/material/Modal';
import { updateUser } from '../features/user/userSlice';

import {
  Grid,
  FormControl,
  InputLabel,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';

const style = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    maxWidth: '95%',
    bgcolor: '#f5f5f5',
    borderRadius: '12px',
    boxShadow: 24,
    p: 0,
    overflow: 'hidden',
    maxHeight: '90vh',
  },
  header: {
    bgcolor: '#00529B',
    color: 'white',
    py: 2,
    px: 3,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    p: 0,
    overflowY: 'auto',
    maxHeight: 'calc(90vh - 130px)',
  },
  section: {
    p: 3,
    mb: 2,
    bgcolor: 'white',
  },
  footer: {
    p: 2,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    bgcolor: 'white',
  },
  readOnlyField: {
    '& .MuiInputBase-input': {
      bgcolor: '#f5f5f5',
    },
  },
  sectionDivider: {
    my: 2,
    borderColor: 'rgba(0, 82, 155, 0.2)',
  },
  bankingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 2,
  },
};

function UpdateUserModel({
  defaultValues,
  open,
  handleClose,
  setUpdateTrigger,
}) {
  console.log('defaultValues', defaultValues);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    department: '',
    section: '',
    role: '',
    is_approved: false,
    is_petty_cash_user: false,
  });

  const [supplierData, setSupplierData] = useState({
    company_name: '',
    supplier_number: '',
    tax_id: '',
    service_category: '',
    contact_name: '',
    phone_number: '',
    street_address: '',
    city: '',
    country: '',
    // Banking information fields
    bank_name: '',
    account_name: '',
    account_number: '',
    payment_currency: '',
    iban: '',
    swift_code: '',
    sort_code: '',
  });

  const hasSupplierProfile = defaultValues?.supplier_profile;

  // Use useEffect to update formData when defaultValues changes
  useEffect(() => {
    if (defaultValues) {
      setFormData({
        firstname: defaultValues.firstname || '',
        lastname: defaultValues.lastname || '',
        email: defaultValues.email || '',
        department: defaultValues.department || '',
        section: defaultValues.section || '',
        role: defaultValues.role || '',
        is_approved: defaultValues.is_approved || false,
        is_petty_cash_user: defaultValues.is_petty_cash_user || false,
      });

      if (defaultValues.supplier_profile) {
        setSupplierData({
          company_name: defaultValues.supplier_profile.company_name || '',
          supplier_number: defaultValues.supplier_profile.supplier_number || '',
          tax_id: defaultValues.supplier_profile.tax_id || '',
          service_category:
            defaultValues.supplier_profile.service_category || '',
          contact_name: defaultValues.supplier_profile.contact_name || '',
          phone_number: defaultValues.supplier_profile.phone_number || '',
          street_address: defaultValues.supplier_profile.street_address || '',
          city: defaultValues.supplier_profile.city || '',
          country: defaultValues.supplier_profile.country || '',
          // Include banking information
          bank_name: defaultValues.supplier_profile.bank_name || '',
          account_name: defaultValues.supplier_profile.account_name || '',
          account_number: defaultValues.supplier_profile.account_number || '',
          payment_currency:
            defaultValues.supplier_profile.payment_currency || '',
          iban: defaultValues.supplier_profile.iban || '',
          swift_code: defaultValues.supplier_profile.swift_code || '',
          sort_code: defaultValues.supplier_profile.sort_code || '',
        });
      }
    }
  }, [defaultValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setSupplierData((prevData) => ({ ...prevData, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();

    // Combine formData with supplierData if supplier profile exists
    const dataToSubmit = {
      ...formData,
      ...(hasSupplierProfile && { supplier_profile: supplierData }),
    };

    await dispatch(
      updateUser({ id: defaultValues?.id, formData: dataToSubmit })
    );
    handleClose();
    setUpdateTrigger((prev) => !prev);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="update-user-modal-title"
    >
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" id="update-user-modal-title">
            Update User
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={style.content}>
          {/* Personal Information Section */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Personal Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Name"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Last Name"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Work Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="email"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Work Information Section */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Work Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* System Access Section */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              System Access & Permissions
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="signer">Signer</MenuItem>
                    <MenuItem value="signer_admin">Signer Admin</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                    <MenuItem value="supplier">Supplier</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Approval Status</InputLabel>
                  <Select
                    label="Approval Status"
                    name="is_approved"
                    value={formData.is_approved}
                    onChange={handleChange}
                  >
                    <MenuItem value={true}>Approved</MenuItem>
                    <MenuItem value={false}>Not Approved</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Petty Cash Access</InputLabel>
                  <Select
                    label="Petty Cash Access"
                    name="is_petty_cash_user"
                    value={formData.is_petty_cash_user}
                    onChange={handleChange}
                  >
                    <MenuItem value={true}>Enabled</MenuItem>
                    <MenuItem value={false}>Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Supplier Profile Section - Only shown if supplier profile exists */}
          {hasSupplierProfile && (
            <Paper elevation={0} sx={style.section}>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="#00529B"
                sx={{ mb: 3 }}
              >
                Supplier Profile
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Company Name"
                    name="company_name"
                    value={supplierData.company_name}
                    onChange={handleSupplierChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Supplier Number"
                    name="supplier_number"
                    value={supplierData.supplier_number}
                    onChange={handleSupplierChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Tax ID"
                    name="tax_id"
                    value={supplierData.tax_id}
                    onChange={handleSupplierChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Service Category"
                    name="service_category"
                    value={supplierData.service_category}
                    onChange={handleSupplierChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Contact Name"
                    name="contact_name"
                    value={supplierData.contact_name}
                    onChange={handleSupplierChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Phone Number"
                    name="phone_number"
                    value={supplierData.phone_number}
                    onChange={handleSupplierChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Street Address"
                    name="street_address"
                    value={supplierData.street_address}
                    onChange={handleSupplierChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="City"
                    name="city"
                    value={supplierData.city}
                    onChange={handleSupplierChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Country"
                    name="country"
                    value={supplierData.country}
                    onChange={handleSupplierChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                {/* Banking Information Section */}
                <Grid item xs={12}>
                  <Divider sx={style.sectionDivider} />
                  <Box sx={style.bankingHeader}>
                    <LockIcon sx={{ fontSize: 18, color: '#666' }} />
                    <Typography
                      variant="subtitle2"
                      fontWeight="600"
                      color="#00529B"
                    >
                      Banking Information (Read Only)
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Bank Name"
                    value={supplierData.bank_name}
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={style.readOnlyField}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Account Name"
                    value={supplierData.account_name}
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={style.readOnlyField}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Account Number"
                    value={supplierData.account_number}
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={style.readOnlyField}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Payment Currency"
                    name="payment_currency"
                    value={supplierData.payment_currency}
                    onChange={handleSupplierChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="IBAN"
                    value={supplierData.iban}
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={style.readOnlyField}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="SWIFT Code"
                    value={supplierData.swift_code}
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={style.readOnlyField}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Sort Code"
                    value={supplierData.sort_code}
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{ readOnly: true }}
                    sx={style.readOnlyField}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>

        {/* Footer */}
        <Box sx={style.footer}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submit}
            sx={{
              bgcolor: '#00529B',
              '&:hover': {
                bgcolor: '#003a6d',
              },
              borderRadius: '8px',
            }}
          >
            Update User
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default UpdateUserModel;
