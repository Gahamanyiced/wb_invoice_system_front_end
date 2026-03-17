import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import {
  FormControl,
  InputLabel,
  Input,
  TextField,
  CircularProgress,
  Autocomplete,
  Button,
  Select,
  MenuItem,
  Paper,
  Divider,
  FormHelperText,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import Modal from '@mui/material/Modal';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import { useDispatch, useSelector } from 'react-redux';
import { addInvoice, getInvoiceByUser } from '../features/invoice/invoiceSlice';
import { checkHeadDepartment } from '../features/department/departmentSlice';
import { getAllSigners } from '../features/user/userSlice';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getInvoiceValidationSchema } from '../validations/invoice';

import currencies from '../utils/currencies';
import useCOAData from '../hooks/useCOAData';
import useInvoiceNumberCheck from '../hooks/useInvoiceNumberCheck';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const paymentTermsOptions = [
  { value: 'net_30', label: 'Net 30 - Payment due within 30 days' },
  { value: 'net_45', label: 'Net 45 - Payment due within 45 days' },
  { value: 'net_60', label: 'Net 60 - Payment due within 60 days' },
  { value: 'net_90', label: 'Net 90 - Payment due within 90 days' },
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'end_of_month', label: 'End of Month' },
  { value: '15_mfg', label: '15 MFG - 15th of month following goods receipt' },
  {
    value: '15_mfi',
    label: '15 MFI - 15th of month following invoice receipt',
  },
  { value: 'custom', label: 'Custom - Enter your own terms' },
];

const style = {
  box: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 960,
    maxHeight: '90vh',
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    p: 0,
    overflowY: 'auto',
  },
  header: {
    backgroundColor: '#00529B',
    color: 'white',
    padding: '16px 24px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: { padding: '24px' },
  closeButton: { color: 'white' },
  section: { marginBottom: '24px' },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '16px',
    color: '#444',
  },
  inputLabel: { fontSize: '14px' },
  formInputNumber: {
    '& input': { '-moz-appearance': 'textfield' },
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
  },
  fileInputContainer: { marginTop: '8px', marginBottom: '8px' },
  fileInput: {
    width: '100%',
    padding: '8px',
    border: '1px dashed #ccc',
    borderRadius: '4px',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px',
  },
  sendButton: {
    backgroundColor: '#00529B',
    '&:hover': { backgroundColor: '#003a6d' },
  },
};

// ─── COA Autocomplete ─────────────────────────────────────────────────────────
//
// Splits each option label "CODE - Description" into two parts:
//   • The input field shows:  "CODE — Description" (full label, no clipping
//     because the field is now full-width md={12})
//   • The dropdown renders a two-line item:
//       [CODE chip]  Description
//
// value / onChange work with the raw code string ("1310") so react-hook-form
// Controller stores the primitive value unchanged.
// ─────────────────────────────────────────────────────────────────────────────
function COAAutocomplete({
  options = [],
  value,
  onChange,
  label,
  disabled,
  error,
  helperText,
  required = false,
  placeholder = 'Type to search...',
}) {
  const selectedOption = options.find((o) => o.value === value) || null;

  return (
    <Autocomplete
      options={options}
      value={selectedOption}
      disabled={disabled}
      onChange={(_, newOption) => onChange(newOption ? newOption.value : '')}
      isOptionEqualToValue={(option, val) => option.value === val?.value}
      // Full label in the input so nothing is hidden
      getOptionLabel={(option) => option.label || ''}
      // Two-line dropdown item: code chip + description
      renderOption={(props, option) => {
        const dashIndex = option.label.indexOf(' - ');
        const code =
          dashIndex !== -1 ? option.label.slice(0, dashIndex) : option.label;
        const description =
          dashIndex !== -1 ? option.label.slice(dashIndex + 3) : '';

        return (
          <Box
            component="li"
            {...props}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start !important',
              py: '10px !important',
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}
            >
              <Chip
                label={code}
                size="small"
                sx={{
                  backgroundColor: '#e8f0fe',
                  color: '#00529B',
                  fontWeight: 600,
                  fontSize: '11px',
                  height: 20,
                  borderRadius: '4px',
                }}
              />
            </Box>
            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '12px', lineHeight: 1.3 }}
              >
                {description}
              </Typography>
            )}
          </Box>
        );
      }}
      // Wider dropdown so long descriptions are fully visible
      ListboxProps={{ style: { maxHeight: 280 } }}
      componentsProps={{
        paper: { sx: { minWidth: 380 } },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={required ? `${label} *` : label}
          variant="outlined"
          fullWidth
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          InputLabelProps={{
            shrink: true,
            style: {
              backgroundColor: 'white',
              paddingLeft: 5,
              paddingRight: 5,
            },
          }}
        />
      )}
      noOptionsText={`No ${label.toLowerCase()} found`}
    />
  );
}

export default function InvoiceModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading } = useSelector((state) => state.invoice);
  const { isHeadDepartment } = useSelector((state) => state.department);
  const { users } = useSelector((state) => state.user);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isSupplier = user?.role === 'supplier';

  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState([{}]);
  const [next_signers, setNextSigners] = useState([]);
  const [customPaymentTerms, setCustomPaymentTerms] = useState(false);
  const [customTermsInput, setCustomTermsInput] = useState('');
  const [useMultipleGL, setUseMultipleGL] = useState(false);
  const [glEntries, setGLEntries] = useState([
    {
      gl_code: '',
      gl_description: '',
      gl_amount: '',
      cost_center: '',
      location: '',
      aircraft_type: '',
      route: '',
    },
  ]);

  const { excelData, isLoading: coaLoading } = useCOAData({ enabled: open });

  const validationSchema = getInvoiceValidationSchema(user?.role);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onSubmit',
    context: { useMultipleGL },
    defaultValues: {
      supplier_number: '',
      supplier_name: '',
      invoice_number: '',
      service_period: '',
      gl_code: '',
      gl_description: '',
      gl_amount: [],
      location: '',
      cost_center: '',
      currency: 'RWF',
      amount: '',
      payment_terms: '',
      payment_due_date: '',
      next_signers_validator: '',
      quantity: '',
      aircraft_type: '',
      route: '',
      reference: '',
      invoice_date: '',
    },
  });

  const payment_terms = watch('payment_terms');

  // ── Invoice number uniqueness check ─────────────────────────────────────────
  // supplier_number is watched so the check carries the correct supplier context.
  const watchedSupplierNumber = watch('supplier_number');
  const { invoiceNumStatus, checkInvoiceNum, resetInvoiceNumCheck } =
    useInvoiceNumberCheck(watchedSupplierNumber || null);

  useEffect(() => {
    if (next_signers.length > 0)
      setValue('next_signers_validator', next_signers.join(','));
  }, [next_signers, setValue]);

  useEffect(() => {
    dispatch(checkHeadDepartment());
    dispatch(getAllSigners());
  }, [dispatch]);

  useEffect(() => {
    if (payment_terms === 'custom') {
      setCustomPaymentTerms(true);
    } else {
      setCustomPaymentTerms(false);
      setCustomTermsInput('');
    }
  }, [payment_terms]);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    reset();
    setDocuments([{}]);
    setNextSigners([]);
    setCustomPaymentTerms(false);
    setCustomTermsInput('');
    setUseMultipleGL(false);
    setGLEntries([
      {
        gl_code: '',
        gl_description: '',
        gl_amount: '',
        cost_center: '',
        location: '',
        aircraft_type: '',
        route: '',
      },
    ]);
    resetInvoiceNumCheck();
  };

  const handleCustomTermsChange = (e) => {
    const value = e.target.value;
    setCustomTermsInput(value);
    setValue('payment_terms', value, { shouldValidate: true });
  };

  const formRef = useRef();

  const handleChangeDocument = (e, idx) => {
    const files = [...documents];
    const file = e.target.files[0];
    if (file && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are allowed');
      e.target.value = null;
      return;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error('File size must not exceed 10MB');
      e.target.value = null;
      return;
    }
    files[idx] = file;
    setDocuments(files);
  };

  const handleAddMore = () => setDocuments([...documents, {}]);

  const handleRemoveFile = (idx) => {
    const updatedDocs = [...documents];
    updatedDocs.splice(idx, 1);
    setDocuments(updatedDocs.length ? updatedDocs : [{}]);
  };

  const handleSupplierChange = (selectedValue) => {
    if (selectedValue) {
      const s = excelData.suppliers.find((x) => x.value === selectedValue);
      if (s) {
        setValue('supplier_number', selectedValue);
        setValue(
          'supplier_name',
          s.label.split(' - ').slice(1).join(' - ') || '',
        );
      }
    } else {
      setValue('supplier_number', '');
      setValue('supplier_name', '');
    }
  };

  const handleGLCodeChange = (selectedValue) => {
    if (selectedValue) {
      const gl = excelData.glCodes.find((x) => x.value === selectedValue);
      if (gl) {
        setValue('gl_code', selectedValue);
        setValue(
          'gl_description',
          gl.label.split(' - ').slice(1).join(' - ') || '',
        );
      }
    } else {
      setValue('gl_code', '');
      setValue('gl_description', '');
    }
  };

  const calculateTotalAmount = (entries) =>
    entries.reduce((sum, e) => sum + (parseFloat(e.gl_amount) || 0), 0);

  const handleAddGLEntry = () =>
    setGLEntries([
      ...glEntries,
      {
        gl_code: '',
        gl_description: '',
        gl_amount: '',
        cost_center: '',
        location: '',
        aircraft_type: '',
        route: '',
      },
    ]);

  const handleRemoveGLEntry = (index) => {
    if (glEntries.length > 1) {
      const updated = glEntries.filter((_, i) => i !== index);
      setGLEntries(updated);
      setValue('amount', calculateTotalAmount(updated).toString());
    }
  };

  const handleGLEntryChange = (index, field, value) => {
    const updated = [...glEntries];
    updated[index][field] = value;
    if (field === 'gl_code' && value) {
      const gl = excelData.glCodes.find((x) => x.value === value);
      if (gl)
        updated[index]['gl_description'] = gl.label
          .split(' - ')
          .slice(1)
          .join(' - ');
    }
    setGLEntries(updated);
    if (field === 'gl_amount')
      setValue('amount', calculateTotalAmount(updated).toString());
  };

  const validateMultipleGLEntries = () =>
    !isSupplier && useMultipleGL
      ? glEntries.every(
          (e) => e.gl_code && e.gl_amount && e.cost_center && e.location,
        )
      : true;

  const onSubmit = async (data) => {
    try {
      if (!isSupplier && useMultipleGL) {
        if (!validateMultipleGLEntries()) {
          toast.error(
            'Please fill in all required GL entry fields: GL Code, Amount, Cost Center, and Location',
          );
          return;
        }
        if (calculateTotalAmount(glEntries) <= 0) {
          toast.error('Total GL amount must be greater than 0');
          return;
        }
      }

      const shouldValidateSigners =
        !isSupplier &&
        (isHeadDepartment.is_head_of_department ||
          user.role === 'signer_admin');
      if (shouldValidateSigners && next_signers.length === 0) {
        toast.error('Please select at least one next signer');
        return;
      }
      if (documents.every((doc) => !doc || !doc.name)) {
        toast.error('Please attach at least one document');
        return;
      }

      const hasInvalidFiles = documents.some((doc) => {
        if (doc && doc.name) {
          if (!doc.name.toLowerCase().endsWith('.pdf')) {
            toast.error('Only PDF files are allowed');
            return true;
          }
          if (doc.size > 10 * 1024 * 1024) {
            toast.error('File size must not exceed 10MB');
            return true;
          }
        }
        return false;
      });
      if (hasInvalidFiles) return;

      const formattedData = { ...data };
      delete formattedData.next_signers_validator;
      if (formattedData.payment_due_date)
        formattedData.payment_due_date = new Date(
          formattedData.payment_due_date,
        )
          .toISOString()
          .split('T')[0];
      if (formattedData.invoice_date)
        formattedData.invoice_date = new Date(formattedData.invoice_date)
          .toISOString()
          .split('T')[0];

      const formData = new FormData();
      [
        'supplier_number',
        'supplier_name',
        'invoice_number',
        'reference',
        'invoice_date',
        'service_period',
        'currency',
        'amount',
        'payment_terms',
        'payment_due_date',
        'quantity',
      ].forEach((key) => {
        if (formattedData[key] != null && formattedData[key] !== '')
          formData.append(key, formattedData[key]);
      });

      if (!isSupplier && useMultipleGL) {
        const validEntries = glEntries.filter(
          (e) => e.gl_code && e.gl_amount && e.cost_center,
        );
        formData.append(
          'gl_lines',
          JSON.stringify(
            validEntries.map((e) => ({
              gl_code: e.gl_code,
              gl_description: e.gl_description || '',
              cost_center: e.cost_center,
              gl_amount: parseFloat(e.gl_amount).toFixed(2),
              location: e.location || '',
              aircraft_type: e.aircraft_type || '',
              route: e.route || '',
            })),
          ),
        );
      } else if (!isSupplier && !useMultipleGL) {
        formData.append(
          'gl_lines',
          JSON.stringify([
            {
              gl_code: formattedData.gl_code,
              gl_description: formattedData.gl_description || '',
              cost_center: formattedData.cost_center,
              gl_amount: parseFloat(formattedData.amount).toFixed(2),
              location: formattedData.location || '',
              aircraft_type: formattedData.aircraft_type || '',
              route: formattedData.route || '',
            },
          ]),
        );
      }

      if (next_signers.length > 0)
        formData.append('next_signers', next_signers.join(','));
      documents.forEach((doc) => {
        if (doc && doc.name) formData.append('documents', doc);
      });

      await dispatch(addInvoice(formData)).unwrap();
      toast.success('Invoice Added Successfully');
      handleClose();
      dispatch(getInvoiceByUser({ page: 1 }));
    } catch (err) {
      toast.error(err.toString());
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{ mb: 2, bgcolor: '#00529B', color: 'white' }}
        endIcon={<AddIcon />}
      >
        Create Invoice
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Paper sx={style.box}>
          <Box sx={style.header}>
            <Typography variant="h6">Create New Invoice</Typography>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={style.closeButton}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={style.content}>
            <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
              {/* Validation errors debug block */}
              {Object.keys(errors).length > 0 && (
                <Box
                  sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}
                >
                  <Typography variant="subtitle2" color="error">
                    Form Validation Errors:
                  </Typography>
                  {Object.entries(errors).map(([key, error]) => (
                    <Typography key={key} variant="body2" color="error">
                      {key}: {error.message}
                    </Typography>
                  ))}
                </Box>
              )}

              {/* ══ NON-SUPPLIER SECTIONS ══════════════════════════════════════ */}
              {!isSupplier && (
                <>
                  {/* ── Supplier Information ─────────────────────────────────── */}
                  <Box sx={style.section}>
                    <Typography variant="h6" sx={style.sectionTitle}>
                      Supplier Information
                    </Typography>
                    <Grid container spacing={3}>
                      {/* Full width — label is long ("vendor_id - vendor_name") */}
                      <Grid item xs={12}>
                        <Controller
                          name="supplier_number"
                          control={control}
                          render={({ field }) => (
                            <COAAutocomplete
                              options={excelData.suppliers}
                              value={field.value}
                              onChange={(val) => {
                                field.onChange(val);
                                handleSupplierChange(val);
                              }}
                              label="Supplier"
                              required
                              disabled={coaLoading}
                              error={!!errors.supplier_number}
                              helperText={errors.supplier_number?.message}
                              placeholder="Type vendor ID or name to search..."
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* ── GL Code Configuration ─────────────────────────────────── */}
                  <Box sx={style.section}>
                    <Typography variant="h6" sx={style.sectionTitle}>
                      GL Code Configuration
                    </Typography>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={useMultipleGL}
                          onChange={(e) => {
                            setUseMultipleGL(e.target.checked);
                            if (e.target.checked) {
                              setGLEntries([
                                {
                                  gl_code: '',
                                  gl_description: '',
                                  gl_amount: '',
                                  cost_center: '',
                                  location: '',
                                  aircraft_type: '',
                                  route: '',
                                },
                              ]);
                              setValue('amount', '0');
                            } else {
                              [
                                'gl_code',
                                'gl_description',
                                'cost_center',
                                'location',
                                'aircraft_type',
                                'route',
                                'amount',
                              ].forEach((f) => setValue(f, ''));
                            }
                          }}
                        />
                      }
                      label="Use Multiple GL Codes"
                      sx={{ mb: 3 }}
                    />

                    {!useMultipleGL ? (
                      /* ── Single GL mode ──────────────────────────────────────
                         Layout: 3-column row for the most important fields,
                         then optional fields below so nothing is squeezed.     */
                      <Grid container spacing={3}>
                        {/* GL Code — full width so long labels show cleanly */}
                        <Grid item xs={12} md={6}>
                          <Controller
                            name="gl_code"
                            control={control}
                            render={({ field }) => (
                              <COAAutocomplete
                                options={excelData.glCodes}
                                value={field.value}
                                onChange={(val) => {
                                  field.onChange(val);
                                  handleGLCodeChange(val);
                                }}
                                label="GL Code"
                                required
                                disabled={coaLoading}
                                error={!!errors.gl_code}
                                helperText={errors.gl_code?.message}
                                placeholder="Type GL code or description..."
                              />
                            )}
                          />
                        </Grid>

                        {/* GL Description — auto-filled, read-only */}
                        <Grid item xs={12} md={6}>
                          <Controller
                            name="gl_description"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="GL Description"
                                variant="outlined"
                                fullWidth
                                disabled
                                InputLabelProps={{
                                  shrink: true,
                                  style: {
                                    backgroundColor: 'white',
                                    paddingLeft: 5,
                                    paddingRight: 5,
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>

                        {/* Cost Center — full width */}
                        <Grid item xs={12} md={6}>
                          <Controller
                            name="cost_center"
                            control={control}
                            render={({ field }) => (
                              <COAAutocomplete
                                options={excelData.costCenters}
                                value={field.value}
                                onChange={field.onChange}
                                label="Cost Center"
                                required
                                disabled={coaLoading}
                                error={!!errors.cost_center}
                                helperText={errors.cost_center?.message}
                                placeholder="Type code or description..."
                              />
                            )}
                          />
                        </Grid>

                        {/* Location — full width */}
                        <Grid item xs={12} md={6}>
                          <Controller
                            name="location"
                            control={control}
                            render={({ field }) => (
                              <COAAutocomplete
                                options={excelData.locations}
                                value={field.value}
                                onChange={field.onChange}
                                label="Location"
                                required
                                disabled={coaLoading}
                                error={!!errors.location}
                                helperText={errors.location?.message}
                                placeholder="Type code or name..."
                              />
                            )}
                          />
                        </Grid>

                        {/* Aircraft Type — optional, half width */}
                        <Grid item xs={12} md={6}>
                          <Controller
                            name="aircraft_type"
                            control={control}
                            render={({ field }) => (
                              <COAAutocomplete
                                options={excelData.aircraftTypes}
                                value={field.value}
                                onChange={field.onChange}
                                label="Aircraft Type"
                                disabled={coaLoading}
                                placeholder="Type code or description..."
                              />
                            )}
                          />
                        </Grid>

                        {/* Route — optional, half width */}
                        <Grid item xs={12} md={6}>
                          <Controller
                            name="route"
                            control={control}
                            render={({ field }) => (
                              <COAAutocomplete
                                options={excelData.routes}
                                value={field.value}
                                onChange={field.onChange}
                                label="Route"
                                disabled={coaLoading}
                                placeholder="Type code or description..."
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      /* ── Multiple GL mode ────────────────────────────────────
                         Each entry card uses a clear 2-row layout:
                           Row 1: GL Code (full) | GL Description (full) | Amount
                           Row 2: Cost Center | Location | Aircraft Type | Route  */
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ mb: 2, fontWeight: 500 }}
                        >
                          GL Code Entries
                        </Typography>

                        {glEntries.map((entry, index) => (
                          <Paper
                            key={index}
                            elevation={1}
                            sx={{
                              p: 2,
                              mb: 2,
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2,
                              }}
                            >
                              <Typography variant="subtitle2" color="primary">
                                GL Entry #{index + 1}
                              </Typography>
                              {glEntries.length > 1 && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveGLEntry(index)}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>

                            <Grid container spacing={2}>
                              {/* Row 1: GL Code | GL Description | Amount */}
                              <Grid item xs={12} md={5}>
                                <COAAutocomplete
                                  options={excelData.glCodes}
                                  value={entry.gl_code}
                                  onChange={(val) =>
                                    handleGLEntryChange(index, 'gl_code', val)
                                  }
                                  label="GL Code"
                                  required
                                  disabled={coaLoading}
                                  placeholder="Type GL code or description..."
                                />
                              </Grid>
                              <Grid item xs={12} md={5}>
                                <TextField
                                  label="GL Description"
                                  value={entry.gl_description}
                                  variant="outlined"
                                  fullWidth
                                  disabled
                                  InputLabelProps={{
                                    shrink: true,
                                    style: {
                                      backgroundColor: 'white',
                                      paddingLeft: 5,
                                      paddingRight: 5,
                                    },
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} md={2}>
                                <TextField
                                  label="Amount *"
                                  type="number"
                                  value={entry.gl_amount}
                                  onChange={(e) =>
                                    handleGLEntryChange(
                                      index,
                                      'gl_amount',
                                      e.target.value,
                                    )
                                  }
                                  variant="outlined"
                                  fullWidth
                                  required
                                  sx={style.formInputNumber}
                                  InputLabelProps={{
                                    shrink: true,
                                    style: {
                                      backgroundColor: 'white',
                                      paddingLeft: 5,
                                      paddingRight: 5,
                                    },
                                  }}
                                />
                              </Grid>

                              {/* Row 2: Cost Center | Location | Aircraft Type | Route */}
                              <Grid item xs={12} md={3}>
                                <COAAutocomplete
                                  options={excelData.costCenters}
                                  value={entry.cost_center}
                                  onChange={(val) =>
                                    handleGLEntryChange(
                                      index,
                                      'cost_center',
                                      val,
                                    )
                                  }
                                  label="Cost Center"
                                  required
                                  disabled={coaLoading}
                                  placeholder="Search cost center..."
                                />
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <COAAutocomplete
                                  options={excelData.locations}
                                  value={entry.location}
                                  onChange={(val) =>
                                    handleGLEntryChange(index, 'location', val)
                                  }
                                  label="Location"
                                  required
                                  disabled={coaLoading}
                                  placeholder="Search location..."
                                />
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <COAAutocomplete
                                  options={excelData.aircraftTypes}
                                  value={entry.aircraft_type}
                                  onChange={(val) =>
                                    handleGLEntryChange(
                                      index,
                                      'aircraft_type',
                                      val,
                                    )
                                  }
                                  label="Aircraft Type"
                                  disabled={coaLoading}
                                  placeholder="Search aircraft type..."
                                />
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <COAAutocomplete
                                  options={excelData.routes}
                                  value={entry.route}
                                  onChange={(val) =>
                                    handleGLEntryChange(index, 'route', val)
                                  }
                                  label="Route"
                                  disabled={coaLoading}
                                  placeholder="Search route..."
                                />
                              </Grid>
                            </Grid>
                          </Paper>
                        ))}

                        <Button
                          startIcon={<AddIcon />}
                          onClick={handleAddGLEntry}
                          variant="outlined"
                          size="small"
                          sx={{ mt: 1 }}
                        >
                          Add Another GL Entry
                        </Button>

                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 500 }}
                          >
                            Total Amount:{' '}
                            {calculateTotalAmount(glEntries).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            This total will be used as the invoice amount
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {/* ── Invoice Details ─────────────────────────────────────────── */}
              <Box sx={style.section}>
                <Typography variant="h6" sx={style.sectionTitle}>
                  Invoice Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="invoice_number"
                      control={control}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          variant="outlined"
                          error={
                            !!errors.invoice_number ||
                            invoiceNumStatus === 'taken'
                          }
                        >
                          <InputLabel sx={style.inputLabel}>
                            Invoice Number *
                          </InputLabel>
                          <Input
                            {...field}
                            type="text"
                            required
                            onChange={(e) => {
                              field.onChange(e);
                              checkInvoiceNum(e.target.value);
                            }}
                            endAdornment={
                              invoiceNumStatus === 'checking' ? (
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                              ) : undefined
                            }
                          />
                          {errors.invoice_number && (
                            <FormHelperText error>
                              {errors.invoice_number.message}
                            </FormHelperText>
                          )}
                          {!errors.invoice_number &&
                            invoiceNumStatus === 'taken' && (
                              <FormHelperText error>
                                This invoice number has already been used.
                              </FormHelperText>
                            )}
                          {!errors.invoice_number &&
                            invoiceNumStatus === 'available' && (
                              <FormHelperText sx={{ color: 'success.main' }}>
                                Invoice number is available.
                              </FormHelperText>
                            )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="reference"
                      control={control}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          variant="outlined"
                          error={!!errors.reference}
                        >
                          <InputLabel sx={style.inputLabel}>
                            Reference
                          </InputLabel>
                          <Input {...field} type="text" />
                          {errors.reference && (
                            <FormHelperText error>
                              {errors.reference.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="invoice_date"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="date"
                          label="Invoice Date"
                          variant="outlined"
                          fullWidth
                          error={!!errors.invoice_date}
                          helperText={errors.invoice_date?.message}
                          InputLabelProps={{
                            shrink: true,
                            style: {
                              backgroundColor: 'white',
                              paddingLeft: 5,
                              paddingRight: 5,
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="service_period"
                      control={control}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          variant="outlined"
                          error={!!errors.service_period}
                        >
                          <InputLabel sx={style.inputLabel}>
                            Service Period *
                          </InputLabel>
                          <Input {...field} required />
                          {errors.service_period && (
                            <FormHelperText error>
                              {errors.service_period.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="quantity"
                      control={control}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          variant="outlined"
                          error={!!errors.quantity}
                        >
                          <InputLabel sx={style.inputLabel}>
                            Quantity
                          </InputLabel>
                          <Input {...field} type="text" placeholder="e.g., 5" />
                          {errors.quantity && (
                            <FormHelperText error>
                              {errors.quantity.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* ── Financial Information ──────────────────────────────────── */}
              <Box sx={style.section}>
                <Typography variant="h6" sx={style.sectionTitle}>
                  Financial Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          variant="outlined"
                          error={!!errors.currency}
                        >
                          <InputLabel id="currency-label" sx={style.inputLabel}>
                            Currency *
                          </InputLabel>
                          <Select
                            {...field}
                            labelId="currency-label"
                            label="Currency"
                            error={!!errors.currency}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight:
                                    ITEM_HEIGHT * 6.5 + ITEM_PADDING_TOP,
                                  width: 320,
                                },
                              },
                            }}
                          >
                            {currencies.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.currency && (
                            <FormHelperText error>
                              {errors.currency.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="amount"
                      control={control}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          variant="outlined"
                          error={!!errors.amount}
                        >
                          <InputLabel sx={style.inputLabel}>
                            Amount *
                          </InputLabel>
                          <Input
                            {...field}
                            type="number"
                            sx={style.formInputNumber}
                            required
                            disabled={!isSupplier && useMultipleGL}
                            placeholder={
                              !isSupplier && useMultipleGL
                                ? 'Auto-calculated from GL entries'
                                : 'Enter amount'
                            }
                          />
                          {errors.amount && (
                            <FormHelperText error>
                              {errors.amount.message}
                            </FormHelperText>
                          )}
                          {!isSupplier && useMultipleGL && (
                            <FormHelperText>
                              Amount is automatically calculated from GL entries
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* ── Payment Terms (non-suppliers) ──────────────────────────── */}
              {!isSupplier && (
                <>
                  <Box sx={style.section}>
                    <Typography variant="h6" sx={style.sectionTitle}>
                      Payment Terms and Due Date
                    </Typography>
                    <Grid container spacing={3}>
                      {!customPaymentTerms ? (
                        <Grid item xs={12} md={6}>
                          <Controller
                            name="payment_terms"
                            control={control}
                            render={({ field }) => (
                              <FormControl
                                fullWidth
                                variant="outlined"
                                error={!!errors.payment_terms}
                              >
                                <TextField
                                  {...field}
                                  select
                                  label="Payment Terms *"
                                  variant="outlined"
                                  fullWidth
                                  error={!!errors.payment_terms}
                                  helperText={errors.payment_terms?.message}
                                  InputLabelProps={{
                                    shrink: true,
                                    style: {
                                      backgroundColor: 'white',
                                      paddingLeft: 5,
                                      paddingRight: 5,
                                    },
                                  }}
                                >
                                  <MenuItem value="">
                                    <em>Select payment terms</em>
                                  </MenuItem>
                                  {paymentTermsOptions.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </FormControl>
                            )}
                          />
                        </Grid>
                      ) : (
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Custom Payment Terms *"
                            value={customTermsInput}
                            onChange={handleCustomTermsChange}
                            variant="outlined"
                            fullWidth
                            error={!!errors.payment_terms}
                            helperText={errors.payment_terms?.message}
                            InputLabelProps={{
                              shrink: true,
                              style: {
                                backgroundColor: 'white',
                                paddingLeft: 5,
                                paddingRight: 5,
                              },
                            }}
                          />
                        </Grid>
                      )}
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="payment_due_date"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="date"
                              label="Payment Due Date"
                              variant="outlined"
                              fullWidth
                              error={!!errors.payment_due_date}
                              helperText={errors.payment_due_date?.message}
                              InputLabelProps={{
                                shrink: true,
                                style: {
                                  backgroundColor: 'white',
                                  paddingLeft: 5,
                                  paddingRight: 5,
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {/* ── Approval Workflow ──────────────────────────────────────── */}
              {!isSupplier &&
                (isHeadDepartment.is_head_of_department ||
                  user.role === 'signer_admin') && (
                  <>
                    <Box sx={style.section}>
                      <Typography variant="h6" sx={style.sectionTitle}>
                        Approval Workflow
                      </Typography>
                      <FormControl fullWidth variant="outlined">
                        <Autocomplete
                          multiple
                          options={users.results || []}
                          getOptionLabel={(opt) =>
                            `${opt.firstname} ${opt.lastname}`
                          }
                          value={next_signers
                            .map((id) =>
                              users.results?.find((u) => u.id === id),
                            )
                            .filter(Boolean)}
                          onChange={(_, newValues) =>
                            setNextSigners(newValues.map((opt) => opt.id))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Next Signers *"
                              placeholder="Select signers"
                              variant="outlined"
                              error={next_signers.length === 0}
                              helperText={
                                next_signers.length === 0
                                  ? 'At least one signer is required'
                                  : ''
                              }
                            />
                          )}
                        />
                      </FormControl>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                  </>
                )}

              {/* ── Attachments ────────────────────────────────────────────── */}
              <Box sx={style.section}>
                <Typography variant="h6" sx={style.sectionTitle}>
                  Attachments
                </Typography>
                {documents.map((doc, idx) => (
                  <Box
                    key={idx}
                    sx={style.fileInputContainer}
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Box flexGrow={1}>
                      <Typography
                        variant="caption"
                        display="block"
                        gutterBottom
                      >
                        Only PDF files, max 10MB
                      </Typography>
                      <Input
                        type="file"
                        onChange={(e) => handleChangeDocument(e, idx)}
                        disableUnderline
                        sx={style.fileInput}
                        accept=".pdf"
                      />
                    </Box>
                    {(documents.length > 1 || (doc && doc.name)) && (
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveFile(idx)}
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddMore}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Add More Files
                </Button>
              </Box>

              {/* ── Actions ───────────────────────────────────────────────── */}
              <Box sx={style.actionButtons}>
                <Button variant="outlined" onClick={handleClose}>
                  Cancel
                </Button>
                {isLoading ? (
                  <Button variant="contained" disabled>
                    <CircularProgress size={24} color="inherit" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    sx={style.sendButton}
                  >
                    Submit Invoice
                  </Button>
                )}
              </Box>
            </form>
          </Box>
        </Paper>
      </Modal>
    </>
  );
}
