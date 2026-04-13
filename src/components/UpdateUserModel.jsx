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
  Switch,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const PRIMARY = '#00529B';
const PRIMARY_DARK = '#003a6d';
const PRIMARY_LIGHT = '#e8f0fb';
const SURFACE = '#f7f9fc';
const BORDER = 'rgba(0,82,155,0.15)';
const INVOICE_COLOR = '#E65100'; // orange accent for invoice verifier

const style = {
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 740,
    maxWidth: '96%',
    bgcolor: SURFACE,
    borderRadius: '16px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
    p: 0,
    overflow: 'hidden',
    maxHeight: '92vh',
  },
  header: {
    background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
    color: 'white',
    py: 2.5,
    px: 3,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    p: 0,
    overflowY: 'auto',
    maxHeight: 'calc(92vh - 136px)',
    '&::-webkit-scrollbar': { width: '6px' },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(0,82,155,0.25)',
      borderRadius: '3px',
    },
  },
  section: {
    mx: 2,
    mt: 2,
    mb: 0,
    p: 3,
    bgcolor: 'white',
    borderRadius: '12px',
    border: `1px solid ${BORDER}`,
  },
  lastSection: {
    mx: 2,
    mt: 2,
    mb: 2,
    p: 3,
    bgcolor: 'white',
    borderRadius: '12px',
    border: `1px solid ${BORDER}`,
  },
  footer: {
    p: 2.5,
    px: 3,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 1.5,
    borderTop: `1px solid ${BORDER}`,
    bgcolor: 'white',
  },
  sectionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 2.5,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: PRIMARY_LIGHT,
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 2,
    py: 1.1,
    borderBottom: `1px solid rgba(0,0,0,0.05)`,
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { bgcolor: '#fafcff' },
    transition: 'background 0.15s',
  },
  readOnlyField: {
    '& .MuiInputBase-input': { bgcolor: '#f5f7fa', color: '#666' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
  },
  bankingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 2,
    mt: 1,
  },
};

// ─── Reusable toggle row ──────────────────────────────────────────────────────
function ToggleRow({ label, description, name, value, onChange, accentColor }) {
  const color = accentColor || PRIMARY;
  return (
    <Box sx={style.toggleRow}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: value ? color : 'rgba(0,0,0,0.15)',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
        />
        <Box>
          <Typography variant="body2" fontWeight={500} color="text.primary">
            {label}
          </Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={value ? 'ON' : 'OFF'}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 700,
            bgcolor: value ? color : 'rgba(0,0,0,0.08)',
            color: value ? 'white' : 'text.disabled',
            border: 'none',
            minWidth: 36,
          }}
        />
        <Switch
          checked={!!value}
          onChange={(e) => onChange(name, e.target.checked)}
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': { color },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              bgcolor: color,
            },
          }}
        />
      </Box>
    </Box>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ icon, title }) {
  return (
    <Box sx={style.sectionLabel}>
      <Box sx={style.sectionIcon}>{icon}</Box>
      <Typography variant="subtitle1" fontWeight={700} color={PRIMARY}>
        {title}
      </Typography>
    </Box>
  );
}

// ─── Permission group card ────────────────────────────────────────────────────
function PermissionGroup({ icon, title, badge, accentColor, children }) {
  const color = accentColor || PRIMARY;
  return (
    <Box
      sx={{
        border: `1px solid ${color}30`,
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.2,
          bgcolor: `${color}12`,
          borderBottom: `1px solid ${color}25`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '6px',
            bgcolor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            color,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
          }}
        >
          {title}
        </Typography>
        {badge !== undefined && (
          <Chip
            label={`${badge} active`}
            size="small"
            sx={{
              ml: 'auto',
              height: 18,
              fontSize: '0.65rem',
              bgcolor: badge > 0 ? color : 'transparent',
              color: badge > 0 ? 'white' : 'text.disabled',
              border: badge > 0 ? 'none' : `1px solid rgba(0,0,0,0.15)`,
            }}
          />
        )}
      </Box>
      {children}
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function UpdateUserModel({
  defaultValues,
  open,
  handleClose,
  setUpdateTrigger,
}) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    department: '',
    section: '',
    position: '',
    station: '',
    role: '',
    is_approved: false,
    is_petty_cash_user: false,
    is_pettycash_initiator: false,
    is_custodian: false,
    is_expense_creator: false,
    is_verifier: false,
    is_invoice_verifier: false,
    is_approver: false,
    is_first_approver: false,
    is_second_approver: false,
    is_last_approver: false,
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
    bank_name: '',
    account_name: '',
    account_number: '',
    payment_currency: '',
    iban: '',
    swift_code: '',
    sort_code: '',
  });

  const hasSupplierProfile = defaultValues?.supplier_profile;

  useEffect(() => {
    if (defaultValues) {
      setFormData({
        firstname: defaultValues.firstname || '',
        lastname: defaultValues.lastname || '',
        email: defaultValues.email || '',
        department: defaultValues.department || '',
        section: defaultValues.section || '',
        position: defaultValues.position || '',
        station: defaultValues.station || '',
        role: defaultValues.role || '',
        is_approved: defaultValues.is_approved ?? false,
        is_petty_cash_user: defaultValues.is_petty_cash_user ?? false,
        is_pettycash_initiator: defaultValues.is_pettycash_initiator ?? false,
        is_custodian: defaultValues.is_custodian ?? false,
        is_expense_creator: defaultValues.is_expense_creator ?? false,
        is_verifier: defaultValues.is_verifier ?? false,
        is_invoice_verifier: defaultValues.is_invoice_verifier ?? false,
        is_approver: defaultValues.is_approver ?? false,
        is_first_approver: defaultValues.is_first_approver ?? false,
        is_second_approver: defaultValues.is_second_approver ?? false,
        is_last_approver: defaultValues.is_last_approver ?? false,
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setSupplierData((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const dataToSubmit = {
      ...formData,
      ...(hasSupplierProfile && { supplier_profile: supplierData }),
    };
    await dispatch(
      updateUser({ id: defaultValues?.id, formData: dataToSubmit }),
    );
    handleClose();
    setUpdateTrigger((prev) => !prev);
  };

  // active badge counts
  const pettyCashActiveCount = [
    formData.is_petty_cash_user,
    formData.is_pettycash_initiator,
    formData.is_custodian,
    formData.is_expense_creator,
    formData.is_verifier,
  ].filter(Boolean).length;

  const approvalActiveCount = [
    formData.is_approver,
    formData.is_first_approver,
    formData.is_second_approver,
    formData.is_last_approver,
  ].filter(Boolean).length;

  const invoiceActiveCount = [formData.is_invoice_verifier].filter(
    Boolean,
  ).length;

  const totalActiveCount =
    pettyCashActiveCount + approvalActiveCount + invoiceActiveCount;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="update-user-modal-title"
    >
      <Box sx={style.modal}>
        {/* ── Header ── */}
        <Box sx={style.header}>
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              id="update-user-modal-title"
              sx={{ lineHeight: 1.2 }}
            >
              Update User
            </Typography>
            {defaultValues?.email && (
              <Typography variant="caption" sx={{ opacity: 0.75 }}>
                {defaultValues.email}
              </Typography>
            )}
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* ── Scrollable content ── */}
        <Box sx={style.content}>
          {/* ── Personal Information ── */}
          <Paper elevation={0} sx={style.section}>
            <SectionHeading
              icon={<span style={{ fontSize: 16 }}>👤</span>}
              title="Personal Information"
            />
            <Grid container spacing={2.5}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  label="Position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Station"
                  name="station"
                  value={formData.station}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* ── Work Information ── */}
          <Paper elevation={0} sx={style.section}>
            <SectionHeading
              icon={<span style={{ fontSize: 16 }}>🏢</span>}
              title="Work Information"
            />
            <Grid container spacing={2.5}>
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

          {/* ── System Access & Permissions ── */}
          <Paper elevation={0} sx={style.section}>
            <SectionHeading
              icon={
                <AdminPanelSettingsOutlinedIcon
                  sx={{ fontSize: 18, color: PRIMARY }}
                />
              }
              title="System Access & Permissions"
            />

            <Grid container spacing={2.5}>
              {/* ── Role & Approval Status ── */}
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

              {/* ── Permissions subsection ── */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Subsection header */}
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      bgcolor: PRIMARY_LIGHT,
                      borderBottom: `1px solid ${BORDER}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '8px',
                        bgcolor: `${PRIMARY}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AdminPanelSettingsOutlinedIcon
                        sx={{ fontSize: 16, color: PRIMARY }}
                      />
                    </Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color={PRIMARY}
                    >
                      Module Permissions
                    </Typography>
                    <Chip
                      label={`${totalActiveCount} active`}
                      size="small"
                      sx={{
                        ml: 'auto',
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: totalActiveCount > 0 ? PRIMARY : 'transparent',
                        color: totalActiveCount > 0 ? 'white' : 'text.disabled',
                        border:
                          totalActiveCount > 0
                            ? 'none'
                            : `1px solid rgba(0,0,0,0.15)`,
                      }}
                    />
                  </Box>

                  {/* Three groups in a responsive grid */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#fafcff',
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                      gap: 2,
                    }}
                  >
                    {/* Petty Cash Roles */}
                    <PermissionGroup
                      icon={
                        <AccountBalanceWalletOutlinedIcon
                          sx={{ fontSize: 13, color: PRIMARY }}
                        />
                      }
                      title="Petty Cash Roles"
                      badge={pettyCashActiveCount}
                      accentColor={PRIMARY}
                    >
                      <ToggleRow
                        label="Petty Cash User"
                        description="Can access the petty cash module"
                        name="is_petty_cash_user"
                        value={formData.is_petty_cash_user}
                        onChange={handleToggle}
                        accentColor={PRIMARY}
                      />
                      <ToggleRow
                        label="Petty Cash Initiator"
                        description="Can initiate petty cash requests"
                        name="is_pettycash_initiator"
                        value={formData.is_pettycash_initiator}
                        onChange={handleToggle}
                        accentColor={PRIMARY}
                      />
                      <ToggleRow
                        label="Custodian"
                        description="Manages and holds the petty cash fund"
                        name="is_custodian"
                        value={formData.is_custodian}
                        onChange={handleToggle}
                        accentColor={PRIMARY}
                      />
                      <ToggleRow
                        label="Expense Creator"
                        description="Can create and submit expense entries"
                        name="is_expense_creator"
                        value={formData.is_expense_creator}
                        onChange={handleToggle}
                        accentColor={PRIMARY}
                      />
                      <ToggleRow
                        label="Petty Cash Verifier"
                        description="Can verify petty cash transactions"
                        name="is_verifier"
                        value={formData.is_verifier}
                        onChange={handleToggle}
                        accentColor={PRIMARY}
                      />
                    </PermissionGroup>

                    {/* Approval Levels */}
                    <PermissionGroup
                      icon={
                        <VerifiedUserOutlinedIcon
                          sx={{ fontSize: 13, color: '#2e7d32' }}
                        />
                      }
                      title="Approval Levels"
                      badge={approvalActiveCount}
                      accentColor="#2e7d32"
                    >
                      <ToggleRow
                        label="Approver"
                        description="General approval permission"
                        name="is_approver"
                        value={formData.is_approver}
                        onChange={handleToggle}
                        accentColor="#2e7d32"
                      />
                      <ToggleRow
                        label="First Approver"
                        description="First in the approval chain"
                        name="is_first_approver"
                        value={formData.is_first_approver}
                        onChange={handleToggle}
                        accentColor="#2e7d32"
                      />
                      <ToggleRow
                        label="Second Approver"
                        description="Second in the approval chain"
                        name="is_second_approver"
                        value={formData.is_second_approver}
                        onChange={handleToggle}
                        accentColor="#2e7d32"
                      />
                      <ToggleRow
                        label="Last Approver"
                        description="Final sign-off authority"
                        name="is_last_approver"
                        value={formData.is_last_approver}
                        onChange={handleToggle}
                        accentColor="#2e7d32"
                      />
                    </PermissionGroup>

                    {/* Invoice Permissions */}
                    <PermissionGroup
                      icon={
                        <ReceiptOutlinedIcon
                          sx={{ fontSize: 13, color: INVOICE_COLOR }}
                        />
                      }
                      title="Invoice Permissions"
                      badge={invoiceActiveCount}
                      accentColor={INVOICE_COLOR}
                    >
                      <ToggleRow
                        label="Invoice Verifier"
                        description="Can verify invoice submissions"
                        name="is_invoice_verifier"
                        value={formData.is_invoice_verifier}
                        onChange={handleToggle}
                        accentColor={INVOICE_COLOR}
                      />
                    </PermissionGroup>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* ── Supplier Profile ── */}
          {hasSupplierProfile && (
            <Paper elevation={0} sx={style.lastSection}>
              <SectionHeading
                icon={<span style={{ fontSize: 16 }}>🏭</span>}
                title="Supplier Profile"
              />
              <Grid container spacing={2.5}>
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

                {/* Banking Information */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1, borderColor: BORDER }} />
                  <Box sx={style.bankingHeader}>
                    <LockIcon sx={{ fontSize: 16, color: '#888' }} />
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color={PRIMARY}
                    >
                      Banking Information
                    </Typography>
                    <Chip
                      label="Read Only"
                      size="small"
                      sx={{
                        ml: 1,
                        height: 18,
                        fontSize: '0.65rem',
                        bgcolor: '#f0f0f0',
                        color: '#888',
                      }}
                    />
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

          {!hasSupplierProfile && <Box sx={{ pb: 2 }} />}
        </Box>

        {/* ── Footer ── */}
        <Box sx={style.footer}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              borderRadius: '8px',
              borderColor: BORDER,
              color: PRIMARY,
              '&:hover': { borderColor: PRIMARY },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submit}
            sx={{
              bgcolor: PRIMARY,
              '&:hover': { bgcolor: PRIMARY_DARK },
              borderRadius: '8px',
              px: 3,
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
