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
import ServicePeriodPicker from './ServicePeriodPicker';

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
  return (
    <Autocomplete
      options={options}
      value={value || null}
      disabled={disabled}
      onChange={(_, newOption) => onChange(newOption)}
      isOptionEqualToValue={(option, val) => option?.id === val?.id}
      getOptionLabel={(option) => option?.label || ''}
      slotProps={{
        popper: {
          sx: {
            minWidth: 600,
            width: 'max-content',
            maxWidth: '90vw',
            '& .MuiAutocomplete-listbox': {
              '& .MuiAutocomplete-option': {
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              },
            },
          },
          placement: 'bottom-start',
        },
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
          InputLabelProps={{ shrink: true }}
          inputProps={{
            ...params.inputProps,
            style: {
              ...params.inputProps?.style,
              minWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          }}
          sx={{
            '& .MuiInputBase-root': {
              minHeight: 48,
              flexWrap: 'nowrap',
            },
            '& .MuiInputBase-input': {
              flex: 1,
              minWidth: '60px !important',
            },
          }}
        />
      )}
      noOptionsText={`No ${label.toLowerCase()} found`}
    />
  );
}

// ─── Precision-safe addition helper ──────────────────────────────────────────
function preciseSum(values) {
  const numbers = values.map((v) => parseFloat(v) || 0);

  const toDecimalStr = (n) => {
    const s = n.toFixed(20);
    return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
  };

  const maxDecimals = numbers.reduce((max, n) => {
    const s = toDecimalStr(n);
    const dot = s.indexOf('.');
    return dot === -1 ? max : Math.max(max, s.length - dot - 1);
  }, 0);

  const scale = Math.pow(10, maxDecimals);
  const intSum = numbers.reduce((sum, n) => sum + Math.round(n * scale), 0);
  const result = intSum / scale;

  return parseFloat(result.toString());
}

export default function InvoiceModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading } = useSelector((state) => state.invoice);
  const { isHeadDepartment } = useSelector((state) => state.department);
  const { users } = useSelector((state) => state.user);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ── Permission flags ──────────────────────────────────────────────────────
  // Only users with is_invoice_verifier = true see the full form
  // (GL section, Payment Terms, etc.). Everyone else — including supplier,
  // staff, signer, signer_admin, and admin without the flag — sees the
  // limited (supplier-style) form.
  const isInvoiceVerifier = !!user?.is_invoice_verifier;

  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState([{}]);
  const [next_signers, setNextSigners] = useState([]);
  const [customPaymentTerms, setCustomPaymentTerms] = useState(false);
  const [customTermsInput, setCustomTermsInput] = useState('');
  const [useMultipleGL, setUseMultipleGL] = useState(false);

  // ── Service period — single string "YYYY-MM-DD to YYYY-MM-DD" ─────────────
  const [servicePeriod, setServicePeriod] = useState('');

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedGLCode, setSelectedGLCode] = useState(null);
  const [selectedCostCenter, setSelectedCostCenter] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAircraftType, setSelectedAircraftType] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const emptyGLEntry = () => ({
    gl_code: null,
    gl_description: '',
    gl_amount: '',
    cost_center: null,
    location: null,
    aircraft_type: null,
    route: null,
  });

  const [glEntries, setGLEntries] = useState([emptyGLEntry()]);

  const { excelData, isLoading: coaLoading } = useCOAData({ enabled: open });

  // Pass isInvoiceVerifier into the validation schema selector so the correct
  // schema (with or without GL/payment fields) is applied.
  const validationSchema = getInvoiceValidationSchema(isInvoiceVerifier);

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

  const {
    invoiceNumStatus,
    invoiceNumMessage,
    checkInvoiceNum,
    resetInvoiceNumCheck,
  } = useInvoiceNumberCheck(selectedSupplier?.id || null);

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

  // Keep react-hook-form in sync with the picker value
  useEffect(() => {
    setValue('service_period', servicePeriod, {
      shouldValidate: !!servicePeriod,
    });
  }, [servicePeriod, setValue]);

  const handleOpen = () => setOpen(true);

  // Backdrop / ESC / header X — just hide, data stays intact
  const handleDismiss = () => setOpen(false);

  // Cancel button + submit success — hide AND wipe all form state
  const handleReset = () => {
    setOpen(false);
    reset();
    setDocuments([{}]);
    setNextSigners([]);
    setCustomPaymentTerms(false);
    setCustomTermsInput('');
    setUseMultipleGL(false);
    setServicePeriod('');
    setSelectedSupplier(null);
    setSelectedGLCode(null);
    setSelectedCostCenter(null);
    setSelectedLocation(null);
    setSelectedAircraftType(null);
    setSelectedRoute(null);
    setGLEntries([emptyGLEntry()]);
    resetInvoiceNumCheck();
  };

  const handleCustomTermsChange = (e) => {
    const val = e.target.value;
    setCustomTermsInput(val);
    setValue('payment_terms', val, { shouldValidate: true });
  };

  const formRef = useRef();

  // ── Document handlers ─────────────────────────────────────────────────────
  const handleChangeDocument = (e, idx) => {
    const files = [...documents];
    const file = e.target.files[0];
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

  // ── COA change handlers ───────────────────────────────────────────────────
  const handleSupplierChange = (option) => {
    setSelectedSupplier(option);
    setValue('supplier_number', option ? option.value : '', {
      shouldValidate: true,
    });
    setValue('supplier_name', option ? option.description : '', {
      shouldValidate: true,
    });
    resetInvoiceNumCheck();
    setValue('invoice_number', '');
  };

  const handleGLCodeChange = (option) => {
    setSelectedGLCode(option);
    setValue('gl_code', option ? option.value : '', { shouldValidate: true });
    setValue('gl_description', option ? option.description : '');
  };

  const handleCostCenterChange = (option) => {
    setSelectedCostCenter(option);
    setValue('cost_center', option ? option.value : '', {
      shouldValidate: true,
    });
  };

  const handleLocationChange = (option) => {
    setSelectedLocation(option);
    setValue('location', option ? option.value : '', { shouldValidate: true });
  };

  const handleAircraftTypeChange = (option) => {
    setSelectedAircraftType(option);
    setValue('aircraft_type', option ? option.value : '');
  };

  const handleRouteChange = (option) => {
    setSelectedRoute(option);
    setValue('route', option ? option.value : '');
  };

  // ── Multiple GL helpers ───────────────────────────────────────────────────
  const calculateTotalAmount = (entries) =>
    preciseSum(entries.map((e) => e.gl_amount));

  const handleAddGLEntry = () => setGLEntries([...glEntries, emptyGLEntry()]);
  const handleRemoveGLEntry = (index) => {
    if (glEntries.length > 1) {
      const updated = glEntries.filter((_, i) => i !== index);
      setGLEntries(updated);
      setValue('amount', calculateTotalAmount(updated).toString());
    }
  };

  const handleGLEntryOptionChange = (index, field, option) => {
    const updated = [...glEntries];
    updated[index] = { ...updated[index], [field]: option };
    if (field === 'gl_code') {
      updated[index].gl_description = option ? option.description : '';
    }
    setGLEntries(updated);
  };

  const handleGLEntryAmountChange = (index, value) => {
    const updated = [...glEntries];
    updated[index] = { ...updated[index], gl_amount: value };
    setGLEntries(updated);
    const total = preciseSum(updated.map((e) => e.gl_amount));
    setValue('amount', total.toString());
  };

  const validateMultipleGLEntries = () =>
    glEntries.every(
      (e) => e.gl_code && e.gl_amount && e.cost_center && e.location,
    );

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    try {
      if (invoiceNumStatus === 'taken') {
        toast.error(
          invoiceNumMessage ||
            'This invoice number is already used. Please enter a different one.',
        );
        return;
      }

      // ── Service period validation ─────────────────────────────────────────
      if (!servicePeriod || !servicePeriod.includes(' to ')) {
        toast.error('Please select a service period date range');
        return;
      }

      if (isInvoiceVerifier && useMultipleGL) {
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

      if (documents.every((doc) => !doc || !doc.name)) {
        toast.error('Please attach at least one document');
        return;
      }

      const hasInvalidFiles = documents.some((doc) => {
        if (doc && doc.name) {
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

      // Use the picker value as service_period
      formattedData.service_period = servicePeriod;

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

      if (selectedSupplier?.id) {
        formData.append('supplier_id', selectedSupplier.id);
      }

      // GL lines — only invoice verifiers submit GL data
      if (isInvoiceVerifier && useMultipleGL) {
        const validEntries = glEntries.filter(
          (e) => e.gl_code && e.gl_amount && e.cost_center,
        );
        formData.append(
          'gl_lines',
          JSON.stringify(
            validEntries.map((e) => ({
              gl_account: e.gl_code?.id,
              cost_center: e.cost_center?.id,
              gl_amount: parseFloat(e.gl_amount),
              location: e.location?.id || null,
              aircraft_type: e.aircraft_type?.id || null,
              route: e.route?.id || null,
            })),
          ),
        );
      } else if (isInvoiceVerifier && !useMultipleGL) {
        formData.append(
          'gl_lines',
          JSON.stringify([
            {
              gl_account: selectedGLCode?.id,
              cost_center: selectedCostCenter?.id,
              gl_amount: parseFloat(formattedData.amount),
              location: selectedLocation?.id || null,
              aircraft_type: selectedAircraftType?.id || null,
              route: selectedRoute?.id || null,
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
      handleReset();
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

      <Modal open={open} onClose={handleDismiss}>
        <Paper sx={style.box}>
          <Box sx={style.header}>
            <Typography variant="h6">Create New Invoice</Typography>
            <IconButton
              size="small"
              onClick={handleDismiss}
              sx={style.closeButton}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={style.content}>
            <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
              {/* Validation error summary */}
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
              {/* ── Supplier Information ──────────────────────────────────── */}
              <Box sx={style.section}>
                <Typography variant="h6" sx={style.sectionTitle}>
                  Supplier Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <COAAutocomplete
                      options={excelData.suppliers}
                      value={selectedSupplier}
                      onChange={handleSupplierChange}
                      label="Supplier"
                      required
                      disabled={coaLoading}
                      error={!!errors.supplier_number}
                      helperText={errors.supplier_number?.message}
                      placeholder="Type vendor ID or name to search..."
                    />
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ my: 2 }} />
              {/* ══ INVOICE VERIFIER ONLY SECTIONS ══════════════════════════ */}
              {/* GL Code Configuration and Payment Terms are only shown to    */}
              /* users with is_invoice_verifier = true. All other roles */ /*
              (supplier, staff, signer, signer_admin, admin without flag) */ /*
              see the same limited form as suppliers. */
              {isInvoiceVerifier && (
                <>
                  {/* ── GL Code Configuration ──────────────────────────────── */}
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
                              setGLEntries([emptyGLEntry()]);
                              setValue('amount', '0');
                              setSelectedGLCode(null);
                              setSelectedCostCenter(null);
                              setSelectedLocation(null);
                              setSelectedAircraftType(null);
                              setSelectedRoute(null);
                              setValue('gl_code', '');
                              setValue('gl_description', '');
                              setValue('cost_center', '');
                              setValue('location', '');
                              setValue('aircraft_type', '');
                              setValue('route', '');
                            } else {
                              setGLEntries([emptyGLEntry()]);
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
                      /* ── Single GL mode ──────────────────────────────────── */
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <COAAutocomplete
                            options={excelData.glCodes}
                            value={selectedGLCode}
                            onChange={handleGLCodeChange}
                            label="GL Code"
                            required
                            disabled={coaLoading}
                            error={!!errors.gl_code}
                            helperText={errors.gl_code?.message}
                            placeholder="Type GL code or description..."
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label="GL Description"
                            value={selectedGLCode?.description || ''}
                            variant="outlined"
                            fullWidth
                            size="small"
                            disabled
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <COAAutocomplete
                            options={excelData.costCenters}
                            value={selectedCostCenter}
                            onChange={handleCostCenterChange}
                            label="Cost Center"
                            required
                            disabled={coaLoading}
                            error={!!errors.cost_center}
                            helperText={errors.cost_center?.message}
                            placeholder="Type code or description..."
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <COAAutocomplete
                            options={excelData.locations}
                            value={selectedLocation}
                            onChange={handleLocationChange}
                            label="Location"
                            required
                            disabled={coaLoading}
                            error={!!errors.location}
                            helperText={errors.location?.message}
                            placeholder="Type code or name..."
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <COAAutocomplete
                            options={excelData.aircraftTypes}
                            value={selectedAircraftType}
                            onChange={handleAircraftTypeChange}
                            label="Aircraft Type"
                            disabled={coaLoading}
                            placeholder="Search aircraft type..."
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <COAAutocomplete
                            options={excelData.routes}
                            value={selectedRoute}
                            onChange={handleRouteChange}
                            label="Route"
                            disabled={coaLoading}
                            placeholder="Search route..."
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      /* ── Multiple GL mode ────────────────────────────────── */
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
                              <Grid item xs={12} md={5}>
                                <COAAutocomplete
                                  options={excelData.glCodes}
                                  value={entry.gl_code}
                                  onChange={(opt) =>
                                    handleGLEntryOptionChange(
                                      index,
                                      'gl_code',
                                      opt,
                                    )
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
                                  size="small"
                                  disabled
                                  InputLabelProps={{ shrink: true }}
                                />
                              </Grid>
                              <Grid item xs={12} md={2}>
                                <TextField
                                  label="Amount *"
                                  type="number"
                                  value={entry.gl_amount}
                                  onChange={(e) =>
                                    handleGLEntryAmountChange(
                                      index,
                                      e.target.value,
                                    )
                                  }
                                  variant="outlined"
                                  fullWidth
                                  size="small"
                                  required
                                  inputProps={{ step: 'any' }}
                                  sx={style.formInputNumber}
                                  InputLabelProps={{ shrink: true }}
                                />
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <COAAutocomplete
                                  options={excelData.costCenters}
                                  value={entry.cost_center}
                                  onChange={(opt) =>
                                    handleGLEntryOptionChange(
                                      index,
                                      'cost_center',
                                      opt,
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
                                  onChange={(opt) =>
                                    handleGLEntryOptionChange(
                                      index,
                                      'location',
                                      opt,
                                    )
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
                                  onChange={(opt) =>
                                    handleGLEntryOptionChange(
                                      index,
                                      'aircraft_type',
                                      opt,
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
                                  onChange={(opt) =>
                                    handleGLEntryOptionChange(
                                      index,
                                      'route',
                                      opt,
                                    )
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
                            Total Amount: {calculateTotalAmount(glEntries)}
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
              {/* ── Invoice Details ──────────────────────────────────────────── */}
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
                                <CircularProgress size={16} />
                              ) : invoiceNumStatus === 'taken' ? (
                                <Typography
                                  variant="caption"
                                  color="error"
                                  sx={{ whiteSpace: 'nowrap' }}
                                >
                                  Already used
                                </Typography>
                              ) : invoiceNumStatus === 'available' ? (
                                <Typography
                                  variant="caption"
                                  color="success.main"
                                  sx={{ whiteSpace: 'nowrap' }}
                                >
                                  ✓ Available
                                </Typography>
                              ) : null
                            }
                          />
                          {invoiceNumStatus === 'taken' && (
                            <FormHelperText error>
                              {invoiceNumMessage ||
                                errors.invoice_number?.message ||
                                'This invoice number is already used.'}
                            </FormHelperText>
                          )}
                          {invoiceNumStatus === 'available' &&
                            invoiceNumMessage && (
                              <FormHelperText sx={{ color: 'success.main' }}>
                                {invoiceNumMessage}
                              </FormHelperText>
                            )}
                          {errors.invoice_number &&
                            invoiceNumStatus !== 'taken' &&
                            invoiceNumStatus !== 'available' && (
                              <FormHelperText error>
                                {errors.invoice_number.message}
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
                        <FormControl fullWidth variant="outlined">
                          <InputLabel sx={style.inputLabel}>
                            Reference
                          </InputLabel>
                          <Input {...field} type="text" />
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
                          label="Invoice Date"
                          type="date"
                          fullWidth
                          size="small"
                          error={!!errors.invoice_date}
                          helperText={errors.invoice_date?.message}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid>

                  {/* ── Service Period — booking.com-style range picker ────── */}
                  <Grid item xs={12} md={6}>
                    <ServicePeriodPicker
                      value={servicePeriod}
                      onChange={setServicePeriod}
                      required
                      error={!!errors.service_period && !servicePeriod}
                      helperText={
                        !servicePeriod && errors.service_period
                          ? errors.service_period.message
                          : ''
                      }
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
              {/* ── Financial Information ────────────────────────────────────── */}
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
                          >
                            {currencies.map((c) => (
                              <MenuItem key={c.value} value={c.value}>
                                {c.label}
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
                            inputProps={{ step: 'any' }}
                            sx={style.formInputNumber}
                            required
                            disabled={isInvoiceVerifier && useMultipleGL}
                            placeholder={
                              isInvoiceVerifier && useMultipleGL
                                ? 'Auto-calculated from GL entries'
                                : 'Enter amount'
                            }
                          />
                          {errors.amount && (
                            <FormHelperText error>
                              {errors.amount.message}
                            </FormHelperText>
                          )}
                          {isInvoiceVerifier && useMultipleGL && (
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
              {/* ── Payment Terms — invoice verifiers only ───────────────────── */}
              {isInvoiceVerifier && (
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
                                  size="small"
                                  error={!!errors.payment_terms}
                                  helperText={errors.payment_terms?.message}
                                >
                                  {paymentTermsOptions.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                      {opt.label}
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
                            fullWidth
                            size="small"
                            variant="outlined"
                            error={!!errors.payment_terms}
                            helperText={errors.payment_terms?.message}
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
                              label="Payment Due Date"
                              type="date"
                              fullWidth
                              size="small"
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
              {/* ── Attachments ──────────────────────────────────────────────── */}
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
                        Any file type accepted, max 10MB
                      </Typography>
                      <Input
                        type="file"
                        onChange={(e) => handleChangeDocument(e, idx)}
                        disableUnderline
                        sx={style.fileInput}
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
              {/* ── Actions ──────────────────────────────────────────────────── */}
              <Box sx={style.actionButtons}>
                <Button variant="outlined" onClick={handleReset}>
                  Cancel
                </Button>
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    sx={style.sendButton}
                    disabled={
                      invoiceNumStatus === 'taken' ||
                      invoiceNumStatus === 'checking'
                    }
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
