import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Grid from '@mui/material/Grid';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  TextField,
  Typography,
  Autocomplete,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useDispatch, useSelector } from 'react-redux';
import { updateInvoice } from '../features/invoice/invoiceSlice';
import useCOAData from '../hooks/useCOAData';
import useInvoiceNumberCheck from '../hooks/useInvoiceNumberCheck';
import currencies from '../utils/currencies';
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
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 960,
    maxWidth: '95vw',
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
  footer: {
    p: 2,
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
    bgcolor: 'white',
  },
  section: { p: 3, mb: 2, bgcolor: 'white' },
  glLineCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    p: 2,
    mb: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
  },
  uploadBox: {
    borderRadius: '8px',
    border: '2px dashed rgba(0, 82, 155, 0.3)',
    p: 3,
    mb: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 82, 155, 0.02)',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(0, 82, 155, 0.05)',
      cursor: 'pointer',
      borderColor: 'rgba(0, 82, 155, 0.5)',
    },
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

function UpdateInvoiceModal({
  defaultValues,
  open,
  handleClose,
  setUpdateTrigger,
}) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.invoice);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSupplier = user?.role === 'supplier';

  // ── Helper: read from nested invoice or flat ──────────────────────────────
  const getInvoiceData = (key) =>
    defaultValues?.invoice ? defaultValues.invoice[key] : defaultValues?.[key];

  const documentsInInvoice = Boolean(defaultValues?.invoice?.documents);

  const getDocuments = () =>
    documentsInInvoice
      ? defaultValues?.invoice?.documents || []
      : defaultValues?.documents || [];

  const getRawGLLines = () =>
    defaultValues?.invoice?.gl_lines || defaultValues?.gl_lines || [];

  // ── COA data ──────────────────────────────────────────────────────────────
  const { excelData, isLoading: coaLoading } = useCOAData({ enabled: open });

  // ── Empty GL entry factory ────────────────────────────────────────────────
  const emptyGLEntry = () => ({
    gl_code: null,
    gl_description: '',
    gl_amount: '',
    cost_center: null,
    location: null,
    aircraft_type: null,
    route: null,
  });

  // ── Build initial GL entries from _detail objects ─────────────────────────
  const buildInitialGLEntries = () => {
    const lines = getRawGLLines();
    if (lines.length === 0) return [emptyGLEntry()];
    return lines.map((line) => ({
      _id: line.id,
      gl_code: line.gl_account_detail
        ? {
            id: line.gl_account,
            value: line.gl_account_detail.gl_code,
            label: `${line.gl_account_detail.gl_code} - ${line.gl_account_detail.gl_description}`,
            description: line.gl_account_detail.gl_description,
          }
        : null,
      gl_description: line.gl_description || '',
      gl_amount: line.gl_amount ? String(line.gl_amount) : '',
      cost_center: line.cost_center_detail
        ? {
            id: line.cost_center,
            value: line.cost_center_detail.cc_code,
            label: `${line.cost_center_detail.cc_code} - ${line.cost_center_detail.cc_description}`,
            description: line.cost_center_detail.cc_description,
          }
        : null,
      location: line.location_detail
        ? {
            id: line.location,
            value: line.location_detail.loc_code,
            label: `${line.location_detail.loc_code} - ${line.location_detail.loc_name}`,
            description: line.location_detail.loc_name,
          }
        : null,
      aircraft_type: line.aircraft_type_detail
        ? {
            id: line.aircraft_type,
            value: line.aircraft_type_detail.code,
            label: `${line.aircraft_type_detail.code} - ${line.aircraft_type_detail.description}`,
            description: line.aircraft_type_detail.description,
          }
        : null,
      route: line.route_detail
        ? {
            id: line.route,
            value: line.route_detail.code,
            label: `${line.route_detail.code} - ${line.route_detail.description}`,
            description: line.route_detail.description,
          }
        : null,
    }));
  };

  // ── State ─────────────────────────────────────────────────────────────────
  const [comment, setComment] = useState('');
  const [customPaymentTerms, setCustomPaymentTerms] = useState(false);
  const [customTermsInput, setCustomTermsInput] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // ── Service period — single combined string driven by ServicePeriodPicker ──
  const [servicePeriod, setServicePeriod] = useState('');
  const [servicePeriodError, setServicePeriodError] = useState(false);

  const [formData, setFormData] = useState({
    supplier_number: getInvoiceData('supplier_number') || '',
    supplier_name: getInvoiceData('supplier_name') || '',
    invoice_number: getInvoiceData('invoice_number') || '',
    reference: getInvoiceData('reference') || '',
    invoice_date: getInvoiceData('invoice_date') || '',
    currency: getInvoiceData('currency') || '',
    amount: getInvoiceData('amount') || '',
    quantity: getInvoiceData('quantity') || '',
    payment_terms: getInvoiceData('payment_terms') || '',
    payment_due_date: getInvoiceData('payment_due_date') || '',
  });

  const [glEntries, setGLEntries] = useState([emptyGLEntry()]);
  const [documents, setDocuments] = useState(getDocuments());
  const [anotherDocuments, setAnotherDocuments] = useState([]);
  const [uploadedFileNames, setUploadedFileNames] = useState([]);
  const [anotherSelectedDocumentIndices, setAnotherSelectedDocumentIndices] =
    useState([]);
  const [replacedDocumentIds, setReplacedDocumentIds] = useState([]);
  const [selectedDocumentIndices, setSelectedDocumentIndices] = useState([]);
  const [docMode, setDocMode] = useState('new');

  // ── Pre-populate on open ──────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setGLEntries(buildInitialGLEntries());

    if (excelData.suppliers.length > 0 && getInvoiceData('supplier_number')) {
      const match = excelData.suppliers.find(
        (s) => s.value === getInvoiceData('supplier_number'),
      );
      if (match) setSelectedSupplier(match);
    }

    // Restore stored service_period string directly into state — the picker
    // will parse it back into start/end internally when it opens
    setServicePeriod(getInvoiceData('service_period') || '');
    setServicePeriodError(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, excelData.suppliers.length]);

  // ── Detect custom payment terms on open ───────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const pt = getInvoiceData('payment_terms');
    const isStandard = paymentTermsOptions.some((o) => o.value === pt);
    if (pt && !isStandard) {
      setCustomPaymentTerms(true);
      setCustomTermsInput(pt);
    } else {
      setCustomPaymentTerms(false);
      setCustomTermsInput('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Invoice number uniqueness check ───────────────────────────────────────
  const {
    invoiceNumStatus,
    invoiceNumMessage,
    checkInvoiceNum,
    resetInvoiceNumCheck,
  } = useInvoiceNumberCheck(selectedSupplier?.id || null);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSupplierChange = (option) => {
    setSelectedSupplier(option);
    setFormData((prev) => ({
      ...prev,
      supplier_number: option ? option.value : '',
      supplier_name: option ? option.description : '',
    }));
    resetInvoiceNumCheck();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentTermsChange = (val) => {
    if (val === 'custom') {
      setCustomPaymentTerms(true);
      setFormData((prev) => ({ ...prev, payment_terms: customTermsInput }));
    } else {
      setCustomPaymentTerms(false);
      setCustomTermsInput('');
      setFormData((prev) => ({ ...prev, payment_terms: val }));
    }
  };

  const handleCustomTermsInput = (e) => {
    const val = e.target.value;
    setCustomTermsInput(val);
    setFormData((prev) => ({ ...prev, payment_terms: val }));
  };

  // GL entry helpers — full option objects
  const handleGLEntryOptionChange = (index, field, option) => {
    const updated = [...glEntries];
    updated[index] = { ...updated[index], [field]: option };
    if (field === 'gl_code') {
      updated[index].gl_description = option ? option.description : '';
    }
    setGLEntries(updated);
  };

  const handleGLEntryAmountChange = (index, val) => {
    const updated = [...glEntries];
    updated[index] = { ...updated[index], gl_amount: val };
    setGLEntries(updated);
    const total = updated.reduce(
      (sum, e) => sum + (parseFloat(e.gl_amount) || 0),
      0,
    );
    setFormData((prev) => ({ ...prev, amount: total.toFixed(2) }));
  };

  const addGLEntry = () => setGLEntries([...glEntries, emptyGLEntry()]);
  const removeGLEntry = (index) => {
    if (glEntries.length > 1) {
      const updated = glEntries.filter((_, i) => i !== index);
      setGLEntries(updated);
      const total = updated.reduce(
        (sum, e) => sum + (parseFloat(e.gl_amount) || 0),
        0,
      );
      setFormData((prev) => ({ ...prev, amount: total.toFixed(2) }));
    }
  };

  // Document helpers
  const handleFileSelect = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must not exceed 10MB');
      e.target.value = null;
      return;
    }
    if (docMode === 'change' && !documentsInInvoice) {
      const updatedDocs = [...documents];
      updatedDocs[index] = file;
      setDocuments(updatedDocs);
    } else {
      const updatedAnother = [...anotherDocuments];
      updatedAnother[index] = file;
      setAnotherDocuments(updatedAnother);
    }
    const names = [...uploadedFileNames];
    names[index] = file.name;
    setUploadedFileNames(names);
  };

  const handleAddMore = () => {
    if (docMode === 'new' || documentsInInvoice) {
      setAnotherDocuments([...anotherDocuments, null]);
    } else {
      setDocuments([...documents, {}]);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetState = () => {
    setFormData({
      supplier_number: getInvoiceData('supplier_number') || '',
      supplier_name: getInvoiceData('supplier_name') || '',
      invoice_number: getInvoiceData('invoice_number') || '',
      reference: getInvoiceData('reference') || '',
      invoice_date: getInvoiceData('invoice_date') || '',
      currency: getInvoiceData('currency') || '',
      amount: getInvoiceData('amount') || '',
      quantity: getInvoiceData('quantity') || '',
      payment_terms: getInvoiceData('payment_terms') || '',
      payment_due_date: getInvoiceData('payment_due_date') || '',
    });
    setGLEntries(buildInitialGLEntries());
    setSelectedSupplier(null);
    setServicePeriod('');
    setServicePeriodError(false);
    setDocuments(getDocuments());
    setAnotherDocuments([]);
    setUploadedFileNames([]);
    setSelectedDocumentIndices([]);
    setAnotherSelectedDocumentIndices([]);
    setReplacedDocumentIds([]);
    setComment('');
    setDocMode('new');
    setCustomPaymentTerms(false);
    setCustomTermsInput('');
    resetInvoiceNumCheck();
  };

  const handleCloseUpdate = () => {
    resetState();
    handleClose();
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const submit = async () => {
    try {
      if (invoiceNumStatus === 'taken') {
        toast.error(
          invoiceNumMessage ||
            'This invoice number has already been used. Please enter a different one.',
        );
        return;
      }

      // ── Service period validation ─────────────────────────────────────────
      if (!servicePeriod || !servicePeriod.includes(' to ')) {
        setServicePeriodError(true);
        toast.error('Please select a service period date range');
        return;
      }
      setServicePeriodError(false);

      if (isSupplier) {
        if (
          !formData.invoice_number ||
          !formData.currency ||
          !formData.amount
        ) {
          toast.error('Please fill all required fields');
          return;
        }
      } else {
        if (
          !formData.invoice_number ||
          !formData.currency ||
          !formData.amount
        ) {
          toast.error('Please fill all required fields');
          return;
        }
        if (!formData.payment_terms) {
          toast.error('Please select payment terms');
          return;
        }
        const invalid = glEntries.find(
          (e) => !e.gl_code || !e.gl_amount || !e.cost_center || !e.location,
        );
        if (invalid) {
          toast.error(
            'Please fill all required GL Line fields: GL Code, Amount, Cost Center, Location',
          );
          return;
        }
      }

      const data = new FormData();

      if (isSupplier) {
        data.append('invoice_number', formData.invoice_number);
        data.append('service_period', servicePeriod);
        data.append('currency', formData.currency);
        data.append('amount', formData.amount);
        if (formData.reference) data.append('reference', formData.reference);
        if (formData.invoice_date)
          data.append('invoice_date', formData.invoice_date);
        if (formData.quantity) data.append('quantity', formData.quantity);
        if (selectedSupplier?.id)
          data.append('supplier_id', selectedSupplier.id);
      } else {
        const scalarFields = [
          'supplier_number',
          'supplier_name',
          'invoice_number',
          'reference',
          'invoice_date',
          'currency',
          'amount',
          'payment_terms',
          'payment_due_date',
          'quantity',
        ];
        scalarFields.forEach((key) => {
          if (formData[key] != null && formData[key] !== '')
            data.append(key, formData[key]);
        });

        // service_period comes from the picker, not formData
        data.append('service_period', servicePeriod);

        if (selectedSupplier?.id) {
          data.append('supplier_id', selectedSupplier.id);
        }

        data.append(
          'gl_lines',
          JSON.stringify(
            glEntries
              .filter((e) => e.gl_code && e.gl_amount && e.cost_center)
              .map((e) => ({
                gl_account: e.gl_code?.id,
                cost_center: e.cost_center?.id,
                gl_amount: parseFloat(e.gl_amount).toFixed(2),
                location: e.location?.id || null,
                aircraft_type: e.aircraft_type?.id || null,
                route: e.route?.id || null,
              })),
          ),
        );
      }

      if (comment) data.append('comment', comment);

      if (docMode === 'change' && !documentsInInvoice) {
        anotherSelectedDocumentIndices.forEach((docIndex, i) => {
          data.append('documents', documents[docIndex]);
          data.append('document_id', replacedDocumentIds[i]);
        });
      } else if (docMode === 'new') {
        anotherDocuments.forEach((doc) => {
          if (doc) data.append('documents', doc);
        });
      }

      const invoiceId = defaultValues?.invoice?.id || defaultValues?.id;

      const result = await dispatch(updateInvoice({ id: invoiceId, data }));
      if (updateInvoice.fulfilled.match(result)) {
        toast.success('Invoice Updated Successfully');
        handleCloseUpdate();
        setUpdateTrigger((prev) => !prev);
      } else {
        toast.error(result.payload || 'Failed to update invoice');
      }
    } catch (error) {
      toast.error(
        typeof error === 'string'
          ? error
          : error?.message || 'An unexpected error occurred',
      );
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onClose={handleCloseUpdate}
      aria-labelledby="update-invoice-modal-title"
    >
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" component="h2" fontWeight="500">
            Update Invoice
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseUpdate}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={style.content}>
          {/* ── Supplier Information ─────────────────────────────────────── */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
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
                  placeholder="Type vendor ID or name to search..."
                />
              </Grid>
            </Grid>
          </Paper>

          {/* ── Invoice Information ──────────────────────────────────────── */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Invoice Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Invoice Number *"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => {
                    handleFormChange(e);
                    checkInvoiceNum(e.target.value);
                  }}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  error={invoiceNumStatus === 'taken'}
                  helperText={
                    invoiceNumStatus === 'taken'
                      ? invoiceNumMessage ||
                        'This invoice number is already used.'
                      : invoiceNumStatus === 'available' && invoiceNumMessage
                        ? invoiceNumMessage
                        : ''
                  }
                  InputProps={{
                    endAdornment:
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
                      ) : null,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleFormChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Invoice Date"
                  name="invoice_date"
                  type="date"
                  value={formData.invoice_date}
                  onChange={handleFormChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* ── Service Period — booking.com-style range picker ────────── */}
              <Grid item xs={12} md={6}>
                <ServicePeriodPicker
                  value={servicePeriod}
                  onChange={(val) => {
                    setServicePeriod(val);
                    setServicePeriodError(false);
                  }}
                  required
                  error={servicePeriodError}
                  helperText={
                    servicePeriodError
                      ? 'Please select a service period date range'
                      : ''
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="e.g., 5"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* ── Financial Information ────────────────────────────────────── */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Financial Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Currency *</InputLabel>
                  <Select
                    name="currency"
                    value={formData.currency}
                    onChange={handleFormChange}
                    label="Currency *"
                    required
                  >
                    {currencies.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Total Amount *"
                  name="amount"
                  value={formData.amount}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  type="number"
                  InputProps={{
                    readOnly: !isSupplier && glEntries.length > 0,
                  }}
                  helperText={
                    !isSupplier && glEntries.length > 0
                      ? 'Auto-calculated from GL lines'
                      : ''
                  }
                />
              </Grid>
            </Grid>
          </Paper>

          {/* ── GL Lines (non-supplier only) ─────────────────────────────── */}
          {!isSupplier && (
            <Paper elevation={0} sx={style.section}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="600"
                  color="#00529B"
                >
                  GL Lines
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addGLEntry}
                  sx={{ borderRadius: '8px' }}
                >
                  Add GL Line
                </Button>
              </Box>

              {glEntries.map((entry, index) => (
                <Card key={index} sx={style.glLineCard}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="500">
                        GL Line {index + 1}
                      </Typography>
                      {glEntries.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => removeGLEntry(index)}
                          sx={{ color: '#FF5733' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={5}>
                        <COAAutocomplete
                          options={excelData.glCodes}
                          value={entry.gl_code}
                          onChange={(opt) =>
                            handleGLEntryOptionChange(index, 'gl_code', opt)
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
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          label="Amount *"
                          value={entry.gl_amount}
                          onChange={(e) =>
                            handleGLEntryAmountChange(index, e.target.value)
                          }
                          fullWidth
                          required
                          variant="outlined"
                          size="small"
                          type="number"
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <COAAutocomplete
                          options={excelData.costCenters}
                          value={entry.cost_center}
                          onChange={(opt) =>
                            handleGLEntryOptionChange(index, 'cost_center', opt)
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
                            handleGLEntryOptionChange(index, 'location', opt)
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
                            handleGLEntryOptionChange(index, 'route', opt)
                          }
                          label="Route"
                          disabled={coaLoading}
                          placeholder="Search route..."
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          )}

          {/* ── Payment Terms (non-supplier only) ────────────────────────── */}
          {!isSupplier && (
            <Paper elevation={0} sx={style.section}>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="#00529B"
                sx={{ mb: 3 }}
              >
                Payment Information
              </Typography>
              <Grid container spacing={3}>
                {!customPaymentTerms ? (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Payment Terms *</InputLabel>
                      <Select
                        value={formData.payment_terms}
                        onChange={(e) =>
                          handlePaymentTermsChange(e.target.value)
                        }
                        label="Payment Terms *"
                      >
                        {paymentTermsOptions.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ) : (
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Custom Payment Terms *"
                      value={customTermsInput}
                      onChange={handleCustomTermsInput}
                      fullWidth
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Payment Due Date"
                    name="payment_due_date"
                    type="date"
                    value={formData.payment_due_date}
                    onChange={handleFormChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* ── Documents ────────────────────────────────────────────────── */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Documents
            </Typography>

            {documents
              .filter((doc) => doc && (doc.id || doc.file_data))
              .map((doc, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    mb: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    bgcolor: 'rgba(0, 82, 155, 0.02)',
                  }}
                >
                  <DescriptionIcon sx={{ color: '#00529B' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight="500">
                      Document {index + 1}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {doc.filename ||
                        doc.name ||
                        `Invoice_Document_${index + 1}`}
                    </Typography>
                  </Box>
                  {doc.file_data && (
                    <Button
                      variant="text"
                      size="small"
                      component="a"
                      href={doc.file_data}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: '#00529B' }}
                    >
                      View
                    </Button>
                  )}
                </Box>
              ))}

            {[...Array(anotherDocuments.length || 1).keys()].map((index) => (
              <Box key={index} sx={style.uploadBox}>
                <label
                  htmlFor={`file-upload-${index}`}
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <input
                    id={`file-upload-${index}`}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(e, index)}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {uploadedFileNames[index] ? (
                      <>
                        <DescriptionIcon
                          fontSize="large"
                          sx={{ color: '#00529B' }}
                        />
                        <Typography variant="body2" fontWeight="500">
                          {uploadedFileNames[index]}
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          File selected — click to change
                        </Typography>
                      </>
                    ) : (
                      <>
                        <UploadFileIcon fontSize="large" color="action" />
                        <Typography variant="body2" fontWeight="500">
                          Click to upload document
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Any file type, max 10MB
                        </Typography>
                      </>
                    )}
                  </Box>
                </label>
              </Box>
            ))}

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddMore}
              sx={{ borderRadius: '8px' }}
            >
              Add Document
            </Button>
          </Paper>

          {/* ── Comment ──────────────────────────────────────────────────── */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 2 }}
            >
              Comment (optional)
            </Typography>
            <TextField
              label="Reason for update"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              size="small"
              placeholder="Describe what changed..."
            />
          </Paper>
        </Box>

        {/* Footer */}
        <Box sx={style.footer}>
          <Button
            variant="outlined"
            onClick={handleCloseUpdate}
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <Button
              variant="contained"
              onClick={submit}
              disabled={
                invoiceNumStatus === 'taken' || invoiceNumStatus === 'checking'
              }
              sx={{
                bgcolor: '#00529B',
                '&:hover': { bgcolor: '#003a6d' },
                borderRadius: '8px',
              }}
            >
              Update Invoice
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
}

export default UpdateInvoiceModal;
