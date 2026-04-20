import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RootLayout from '../layouts/RootLayout';
import {
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  Avatar,
  MenuItem,
  CircularProgress,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import SecurityIcon from '@mui/icons-material/Security';
import { toast } from 'react-toastify';
import { updateSupplier } from '../features/user/userSlice';

// ── Constants ─────────────────────────────────────────────────────────────────
const currencies = [
  { value: 'RWF', label: 'Rwandan Franc (RWF)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'KES', label: 'Kenyan Shilling (KES)' },
  { value: 'UGX', label: 'Ugandan Shilling (UGX)' },
  { value: 'TZS', label: 'Tanzanian Shilling (TZS)' },
];
const paymentTerms = [
  { value: 'Net 30', label: 'Net 30 days' },
  { value: 'Net 45', label: 'Net 45 days' },
  { value: 'Net 60', label: 'Net 60 days' },
  { value: 'Net 90', label: 'Net 90 days' },
  { value: 'Due on Receipt', label: 'Due on Receipt' },
  { value: 'EOM', label: 'End of Month' },
];

// Human-readable permission labels
const PERMISSION_LABELS = {
  is_approver: 'Approver',
  is_custodian: 'Petty Cash Custodian',
  is_expense_creator: 'Expense Creator',
  is_first_approver: 'First Approver',
  is_invoice_user: 'Invoice User',
  is_invoice_verifier: 'Invoice Verifier',
  is_last_approver: 'Last Approver',
  is_petty_cash_user: 'Petty Cash User',
  is_pettycash_initiator: 'Petty Cash Initiator',
  is_second_approver: 'Second Approver',
  is_verifier: 'Verifier',
};

// ── Shared sub-components ─────────────────────────────────────────────────────
const SectionHeading = ({ icon, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: '7px',
        bgcolor: '#e3f2fd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 16, color: '#1565c0' } })}
    </Box>
    <Typography
      sx={{
        fontSize: '13px',
        fontWeight: 700,
        color: '#1565c0',
        letterSpacing: '0.3px',
      }}
    >
      {label}
    </Typography>
    <Box sx={{ flex: 1, height: '1px', bgcolor: '#e3f2fd', ml: 1 }} />
  </Box>
);

// Read-only info row used in the staff profile
const InfoRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
    <Typography
      sx={{
        fontSize: '10.5px',
        fontWeight: 700,
        color: '#aaa',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: '13px',
        color: value ? '#222' : '#bbb',
        fontWeight: value ? 500 : 400,
      }}
    >
      {value || '—'}
    </Typography>
  </Box>
);

const NavTab = ({ icon, label, active, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.25,
      px: 1.5,
      py: 1,
      borderRadius: '8px',
      cursor: 'pointer',
      mb: 0.5,
      transition: 'all 0.15s',
      backgroundColor: active ? '#e3f2fd' : 'transparent',
      color: active ? '#1565c0' : '#666',
      '&:hover': { backgroundColor: active ? '#e3f2fd' : '#f5f5f5' },
    }}
  >
    {React.cloneElement(icon, {
      sx: { fontSize: 17, color: active ? '#1565c0' : '#999' },
    })}
    <Typography sx={{ fontSize: '13px', fontWeight: active ? 700 : 400 }}>
      {label}
    </Typography>
    {active && (
      <Box
        sx={{
          ml: 'auto',
          width: 3,
          height: 18,
          borderRadius: '2px',
          bgcolor: '#1565c0',
        }}
      />
    )}
  </Box>
);

// Editable field used in supplier profile
const Field = ({
  label,
  name,
  value,
  onChange,
  disabled,
  select,
  children,
  ...rest
}) => (
  <TextField
    fullWidth
    size="small"
    label={label}
    name={name}
    value={value}
    onChange={onChange}
    disabled={disabled}
    select={select}
    variant="outlined"
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        fontSize: '13px',
        backgroundColor: disabled ? '#f8fafc' : '#fff',
        '& fieldset': { borderColor: '#e0e8f0' },
        '&:hover fieldset': { borderColor: '#90caf9' },
        '&.Mui-focused fieldset': {
          borderColor: '#00529B',
          borderWidth: '1.5px',
        },
        '&.Mui-disabled': { bgcolor: '#f8fafc' },
      },
      '& .MuiInputLabel-root': { fontSize: '12.5px' },
    }}
    {...rest}
  >
    {children}
  </TextField>
);

// ── Role color helper ─────────────────────────────────────────────────────────
const roleStyle = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'admin')
    return { bg: '#fce4ec', color: '#880e4f', border: '#f48fb1' };
  if (r === 'signer_admin')
    return { bg: '#e8eaf6', color: '#283593', border: '#9fa8da' };
  if (r === 'signer')
    return { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' };
  if (r === 'supplier')
    return { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' };
  if (r === 'staff')
    return { bg: '#fff8e1', color: '#f57f17', border: '#ffe082' };
  return { bg: '#f5f5f5', color: '#616161', border: '#e0e0e0' };
};

// ══════════════════════════════════════════════════════════════════════════════
// STAFF / NON-SUPPLIER PROFILE — read-only
// ══════════════════════════════════════════════════════════════════════════════
function StaffProfile({ user }) {
  const rs = roleStyle(user.role);
  const initials =
    `${user.firstname?.charAt(0) || ''}${user.lastname?.charAt(0) || ''}`.toUpperCase() ||
    'U';
  const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim();

  // Only permissions that are explicitly true
  const activePermissions = Object.entries(PERMISSION_LABELS)
    .filter(([key]) => user[key] === true)
    .map(([, label]) => label);

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#00529B',
            lineHeight: 1.2,
          }}
        >
          My Profile
        </Typography>
        <Typography sx={{ fontSize: '12px', color: '#888', mt: 0.25 }}>
          Your account information — read only
        </Typography>
      </Box>
      <Divider sx={{ mb: 2.5 }} />

      {/* Two-column layout */}
      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
        {/* Left — avatar card */}
        <Box sx={{ width: 220, flexShrink: 0 }}>
          <Box
            sx={{
              p: 2.5,
              border: '1px solid #e0e8f0',
              borderRadius: '12px',
              bgcolor: '#fff',
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                bgcolor: '#00529B',
                width: 64,
                height: 64,
                fontSize: '22px',
                fontWeight: 700,
                mx: 'auto',
                mb: 1.5,
              }}
            >
              {initials}
            </Avatar>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#222',
                mb: 0.25,
              }}
            >
              {fullName || '—'}
            </Typography>
            <Typography sx={{ fontSize: '11.5px', color: '#888', mb: 0.5 }}>
              {user.email || '—'}
            </Typography>
            {user.position && (
              <Typography sx={{ fontSize: '11.5px', color: '#666', mb: 1 }}>
                {user.position}
              </Typography>
            )}
            {/* Role pill */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                px: 1.25,
                py: 0.4,
                borderRadius: '20px',
                bgcolor: rs.bg,
                border: `1px solid ${rs.border}`,
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: rs.color,
                }}
              />
              <Typography
                sx={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: rs.color,
                  textTransform: 'capitalize',
                }}
              >
                {user.role?.replace('_', ' ') || '—'}
              </Typography>
            </Box>
            {/* Approved badge */}
            {user.is_approved && (
              <Box sx={{ mt: 0.5 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.3,
                    borderRadius: '20px',
                    bgcolor: '#e8f5e9',
                    border: '1px solid #a5d6a7',
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#2e7d32',
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: '#2e7d32',
                    }}
                  >
                    Approved
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right — info sections */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            border: '1px solid #e0e8f0',
            borderRadius: '12px',
            bgcolor: '#fff',
            overflow: 'hidden',
          }}
        >
          {/* Personal info section */}
          <Box sx={{ p: 3, borderBottom: '1px solid #f0f4f8' }}>
            <SectionHeading
              icon={<PersonIcon />}
              label="Personal Information"
            />
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <InfoRow label="First Name" value={user.firstname} />
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoRow label="Last Name" value={user.lastname} />
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoRow label="Work Email" value={user.email} />
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoRow label="Personal Email" value={user.personal_email} />
              </Grid>
            </Grid>
          </Box>

          {/* Work details section */}
          <Box sx={{ p: 3, borderBottom: '1px solid #f0f4f8' }}>
            <SectionHeading icon={<WorkIcon />} label="Work Details" />
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <InfoRow label="Position" value={user.position} />
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoRow label="Station" value={user.station} />
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoRow label="Department" value={user.department} />
              </Grid>
              <Grid item xs={12} md={6}>
                <InfoRow label="Section" value={user.section} />
              </Grid>
            </Grid>
          </Box>

          {/* Permissions — only show if user has at least one active */}
          {activePermissions.length > 0 && (
            <Box sx={{ p: 3 }}>
              <SectionHeading
                icon={<SecurityIcon />}
                label="Access & Permissions"
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {activePermissions.map((perm) => (
                  <Box
                    key={perm}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.6,
                      px: 1.25,
                      py: 0.5,
                      borderRadius: '20px',
                      bgcolor: '#e8f5e9',
                      border: '1px solid #a5d6a7',
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: '#2e7d32',
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#2e7d32',
                      }}
                    >
                      {perm}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SUPPLIER PROFILE — editable (previous design unchanged)
// ══════════════════════════════════════════════════════════════════════════════
function SupplierProfile({ user: initialUser }) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.user);
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    email: user.email || '',
    profile: {
      company_name: user.profile?.company_name || '',
      supplier_number: user.profile?.supplier_number || '',
      tax_id: user.profile?.tax_id || '',
      service_category: user.profile?.service_category || '',
      contact_name: user.profile?.contact_name || '',
      phone_number: user.profile?.phone_number || '',
      street_address: user.profile?.street_address || '',
      city: user.profile?.city || '',
      country: user.profile?.country || '',
      bank_name: user.profile?.bank_name || '',
      account_name: user.profile?.account_name || '',
      account_number: user.profile?.account_number || '',
      iban: user.profile?.iban || '',
      swift_code: user.profile?.swift_code || '',
      sort_code: user.profile?.sort_code || '',
      payment_currency: user.profile?.payment_currency || 'RWF',
      payment_terms: user.profile?.payment_terms || 'Net 30',
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('profile.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        profile: { ...prev.profile, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      await dispatch(updateSupplier(formData)).unwrap();
      const updated = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(
        'Failed to update profile: ' + (error.message || 'Unknown error'),
      );
    }
  };

  const rs = roleStyle(user.role);
  const initials =
    `${user.firstname?.charAt(0) || ''}${user.lastname?.charAt(0) || ''}`.toUpperCase() ||
    'U';
  const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim();

  const tabs = [
    { label: 'Personal Info', icon: <PersonIcon /> },
    { label: 'Company Info', icon: <BusinessIcon /> },
    { label: 'Payment Info', icon: <AccountBalanceIcon /> },
  ];

  const fp = (name, value) => ({
    name,
    value,
    onChange: handleChange,
    disabled: !isEditing,
  });

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#00529B',
              lineHeight: 1.2,
            }}
          >
            Supplier Profile
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#888', mt: 0.25 }}>
            Manage your account and supplier information
          </Typography>
        </Box>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<EditIcon sx={{ fontSize: 15 }} />}
            onClick={() => setIsEditing(true)}
            sx={{
              bgcolor: '#00529B',
              textTransform: 'none',
              fontSize: '13px',
              borderRadius: '8px',
              px: 2,
              py: 0.8,
              '&:hover': { bgcolor: '#003d75' },
            }}
          >
            Edit Profile
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon sx={{ fontSize: 15 }} />}
              onClick={() => setIsEditing(false)}
              sx={{
                textTransform: 'none',
                fontSize: '13px',
                borderRadius: '8px',
                borderColor: '#e0e0e0',
                color: '#666',
                px: 2,
                py: 0.8,
                '&:hover': { borderColor: '#bbb', bgcolor: '#fafafa' },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={
                isLoading ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <SaveIcon sx={{ fontSize: 15 }} />
                )
              }
              onClick={handleSubmit}
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                fontSize: '13px',
                borderRadius: '8px',
                px: 2,
                py: 0.8,
              }}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
        {/* Left panel */}
        <Box sx={{ width: 220, flexShrink: 0 }}>
          <Box
            sx={{
              p: 2.5,
              border: '1px solid #e0e8f0',
              borderRadius: '12px',
              bgcolor: '#fff',
              textAlign: 'center',
              mb: 1.5,
            }}
          >
            <Avatar
              sx={{
                bgcolor: '#00529B',
                width: 64,
                height: 64,
                fontSize: '22px',
                fontWeight: 700,
                mx: 'auto',
                mb: 1.5,
              }}
            >
              {initials}
            </Avatar>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#222',
                mb: 0.25,
              }}
            >
              {fullName || '—'}
            </Typography>
            <Typography sx={{ fontSize: '11.5px', color: '#888', mb: 1 }}>
              {user.email || '—'}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                px: 1.25,
                py: 0.4,
                borderRadius: '20px',
                bgcolor: rs.bg,
                border: `1px solid ${rs.border}`,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: rs.color,
                }}
              />
              <Typography
                sx={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: rs.color,
                  textTransform: 'capitalize',
                }}
              >
                {user.role?.replace('_', ' ') || '—'}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              p: 1.5,
              border: '1px solid #e0e8f0',
              borderRadius: '12px',
              bgcolor: '#fff',
            }}
          >
            <Typography
              sx={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#aaa',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                px: 1,
                pb: 1,
              }}
            >
              Sections
            </Typography>
            {tabs.map((tab, i) => (
              <NavTab
                key={i}
                icon={tab.icon}
                label={tab.label}
                active={tabValue === i}
                onClick={() => setTabValue(i)}
              />
            ))}
          </Box>
        </Box>

        {/* Right panel */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            p: 3,
            border: '1px solid #e0e8f0',
            borderRadius: '12px',
            bgcolor: '#fff',
          }}
        >
          {tabValue === 0 && (
            <>
              <SectionHeading
                icon={<PersonIcon />}
                label="Personal Information"
              />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Field
                    label="First Name"
                    {...fp('firstname', formData.firstname)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    label="Last Name"
                    {...fp('lastname', formData.lastname)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    label="Email Address"
                    {...fp('email', formData.email)}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {tabValue === 1 && (
            <>
              <SectionHeading
                icon={<BusinessIcon />}
                label="Company Information"
              />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Field
                    label="Company Name"
                    {...fp(
                      'profile.company_name',
                      formData.profile.company_name,
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    label="Supplier Number"
                    {...fp(
                      'profile.supplier_number',
                      formData.profile.supplier_number,
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    label="Tax ID / VAT Number"
                    {...fp('profile.tax_id', formData.profile.tax_id)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    label="Service Category"
                    {...fp(
                      'profile.service_category',
                      formData.profile.service_category,
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    label="Contact Name"
                    {...fp(
                      'profile.contact_name',
                      formData.profile.contact_name,
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    label="Phone Number"
                    {...fp(
                      'profile.phone_number',
                      formData.profile.phone_number,
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  {' '}
                  <Field
                    label="Street Address"
                    {...fp(
                      'profile.street_address',
                      formData.profile.street_address,
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    label="City"
                    {...fp('profile.city', formData.profile.city)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    label="Country"
                    {...fp('profile.country', formData.profile.country)}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {tabValue === 2 && (
            <>
              <SectionHeading
                icon={<AccountBalanceIcon />}
                label="Banking Details"
              />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Field
                    label="Bank Name"
                    {...fp('profile.bank_name', formData.profile.bank_name)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    label="Account Name"
                    {...fp(
                      'profile.account_name',
                      formData.profile.account_name,
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    label="Account Number"
                    {...fp(
                      'profile.account_number',
                      formData.profile.account_number,
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    label="IBAN"
                    {...fp('profile.iban', formData.profile.iban)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    label="SWIFT Code"
                    {...fp('profile.swift_code', formData.profile.swift_code)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    label="Sort Code"
                    {...fp('profile.sort_code', formData.profile.sort_code)}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <SectionHeading
                  icon={<BadgeIcon />}
                  label="Payment Preferences"
                />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Field
                      label="Payment Currency"
                      select
                      {...fp(
                        'profile.payment_currency',
                        formData.profile.payment_currency,
                      )}
                    >
                      {currencies.map((c) => (
                        <MenuItem
                          key={c.value}
                          value={c.value}
                          sx={{ fontSize: '13px' }}
                        >
                          {c.label}
                        </MenuItem>
                      ))}
                    </Field>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      label="Payment Terms"
                      select
                      {...fp(
                        'profile.payment_terms',
                        formData.profile.payment_terms,
                      )}
                    >
                      {paymentTerms.map((t) => (
                        <MenuItem
                          key={t.value}
                          value={t.value}
                          sx={{ fontSize: '13px' }}
                        >
                          {t.label}
                        </MenuItem>
                      ))}
                    </Field>
                  </Grid>
                </Grid>
              </Box>
            </>
          )}

          {isEditing && (
            <Box
              sx={{
                mt: 3,
                pt: 2.5,
                borderTop: '1px solid #e0e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<CancelIcon sx={{ fontSize: 15 }} />}
                onClick={() => setIsEditing(false)}
                sx={{
                  textTransform: 'none',
                  fontSize: '13px',
                  borderRadius: '8px',
                  borderColor: '#e0e0e0',
                  color: '#666',
                  '&:hover': { borderColor: '#bbb', bgcolor: '#fafafa' },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={
                  isLoading ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <SaveIcon sx={{ fontSize: 15 }} />
                  )
                }
                onClick={handleSubmit}
                disabled={isLoading}
                sx={{
                  textTransform: 'none',
                  fontSize: '13px',
                  borderRadius: '8px',
                  px: 2,
                }}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT — dispatches to the right profile based on role
// ══════════════════════════════════════════════════════════════════════════════
function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(u);
  }, []);

  if (!user) {
    return (
      <RootLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
          }}
        >
          <CircularProgress sx={{ color: '#00529B' }} />
        </Box>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      {user.role === 'supplier' ? (
        <SupplierProfile user={user} />
      ) : (
        <StaffProfile user={user} />
      )}
    </RootLayout>
  );
}

export default Profile;
