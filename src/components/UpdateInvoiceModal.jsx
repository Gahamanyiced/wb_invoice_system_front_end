import { useState, useEffect } from 'react';
import {
  updateInvoice,
  getInvoiceByUser,
} from '../features/invoice/invoiceSlice';
import Modal from '@mui/material/Modal';
import {
  Grid,
  FormControl,
  Button,
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Card,
  CardContent,
  MenuItem,
  Select,
  InputLabel,
  Autocomplete,
  Chip,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import { toast } from 'react-toastify';

import currencies from '../utils/currencies';
import useCOAData from '../hooks/useCOAData';
import useInvoiceNumberCheck from '../hooks/useInvoiceNumberCheck';

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
  documentItem: {
    borderRadius: '8px',
    p: 2,
    mb: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    bgcolor: 'rgba(0, 82, 155, 0.05)',
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
  glLineCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    p: 2,
    mb: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
  },
};

// ─── COA Autocomplete ─────────────────────────────────────────────────────────
// Two-line dropdown: [CODE chip] + description text
// Input field shows full label so nothing is clipped
// Works with raw string values (field.value = "1310", not an object)
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
  size = 'small',
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
      getOptionLabel={(option) => option.label || ''}
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
      ListboxProps={{ style: { maxHeight: 280 } }}
      componentsProps={{ paper: { sx: { minWidth: 380 } } }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={required ? `${label} *` : label}
          variant="outlined"
          fullWidth
          size={size}
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          InputLabelProps={{
            shrink: true,
            style: {
              backgroundColor: 'white',
              paddingLeft: 4,
              paddingRight: 4,
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

  // ── helpers ─────────────────────────────────────────────────────────────
  const getInvoiceData = (key) =>
    defaultValues?.invoice ? defaultValues.invoice[key] : defaultValues?.[key];

  const documentsInInvoice = Boolean(defaultValues?.invoice?.documents);

  const getDocuments = () =>
    documentsInInvoice
      ? defaultValues?.invoice?.documents || []
      : defaultValues?.documents || [];

  const getGLLines = () =>
    defaultValues?.invoice?.gl_lines || defaultValues?.gl_lines || [];

  const initializeGLLines = () => {
    const lines = getGLLines();
    if (lines.length === 0) {
      return [
        {
          gl_code: '',
          gl_description: '',
          cost_center: '',
          gl_amount: '',
          location: '',
          aircraft_type: '',
          route: '',
        },
      ];
    }
    return lines.map((line) => ({
      id: line.id,
      gl_code: line.gl_code || '',
      gl_description: line.gl_description || '',
      cost_center: line.cost_center || '',
      gl_amount: line.gl_amount || '',
      location: line.location || '',
      aircraft_type: line.aircraft_type || '',
      route: line.route || '',
    }));
  };

  // ── state ────────────────────────────────────────────────────────────────
  const [value, setValue] = useState('new');
  const [comment, setComment] = useState('');
  const [customPaymentTerms, setCustomPaymentTerms] = useState(
    getInvoiceData('payment_terms') === 'custom',
  );
  const [customTermsInput, setCustomTermsInput] = useState('');
  const [hasNonStandardTerm, setHasNonStandardTerm] = useState(false);
  const [nonStandardTermValue, setNonStandardTermValue] = useState('');

  const [formData, setFormData] = useState({
    supplier_number: getInvoiceData('supplier_number') || '',
    supplier_name: getInvoiceData('supplier_name') || '',
    invoice_number: getInvoiceData('invoice_number') || '',
    reference: getInvoiceData('reference') || '',
    invoice_date: getInvoiceData('invoice_date') || '',
    service_period: getInvoiceData('service_period') || '',
    currency: getInvoiceData('currency') || '',
    amount: getInvoiceData('amount') || '',
    quantity: getInvoiceData('quantity') || '',
    payment_terms: getInvoiceData('payment_terms') || '',
    payment_due_date: getInvoiceData('payment_due_date') || '',
  });

  const [glLines, setGLLines] = useState(initializeGLLines());
  const [documents, setDocuments] = useState(getDocuments());
  const [anotherDocuments, setAnotherDocuments] = useState([]);
  const [selectedDocumentIndices, setSelectedDocumentIndices] = useState([]);
  const [anotherSelectedDocumentIndices, setAnotherSelectedDocumentIndices] =
    useState([]);
  const [replacedDocumentIds, setReplacedDocumentIds] = useState([]);
  const [uploadedFileNames, setUploadedFileNames] = useState([]);

  // ── COA data from DB (replaces loadExcelData + excelData state) ──────────
  const { excelData, isLoading: coaLoading } = useCOAData({ enabled: open });

  // ── Invoice number uniqueness check ───────────────────────────────────────────
  // Uses formData.supplier_number so the check carries the correct supplier context.
  const { invoiceNumStatus, checkInvoiceNum, resetInvoiceNumCheck } =
    useInvoiceNumberCheck(formData.supplier_number || null);

  // ── check payment terms on mount ─────────────────────────────────────────
  useEffect(() => {
    const isStandard = (term) =>
      !term || paymentTermsOptions.some((o) => o.value === term);
    const paymentTerms = getInvoiceData('payment_terms');

    if (paymentTerms === 'custom') {
      setCustomPaymentTerms(true);
      const customValue = getInvoiceData('payment_terms_description') || '';
      setCustomTermsInput(customValue);
      if (customValue)
        setFormData((prev) => ({ ...prev, payment_terms: customValue }));
    } else if (paymentTerms && !isStandard(paymentTerms)) {
      setHasNonStandardTerm(true);
      setNonStandardTermValue(paymentTerms);
      setCustomTermsInput(paymentTerms);
    }
  }, []);

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleRadioChange = (e) => setValue(e.target.value);
  const handleComment = (e) => setComment(e.target.value);

  const handleCheckboxChange = (e, index) => {
    if (e.target.checked) {
      setSelectedDocumentIndices([...selectedDocumentIndices, index]);
      setAnotherSelectedDocumentIndices([...selectedDocumentIndices, index]);
    } else {
      const newIndices = selectedDocumentIndices.filter((i) => i !== index);
      setSelectedDocumentIndices(newIndices);
      setAnotherSelectedDocumentIndices(newIndices);
    }
  };

  const handleChangeFormData = (e) => {
    const { name, value: val } = e.target;
    if (name === 'payment_terms') {
      if (val === 'custom') {
        setCustomPaymentTerms(true);
        if (hasNonStandardTerm) {
          setCustomTermsInput(nonStandardTermValue);
          setFormData((prev) => ({
            ...prev,
            payment_terms: nonStandardTermValue,
          }));
        } else {
          setCustomTermsInput('');
          setFormData((prev) => ({ ...prev, payment_terms: '' }));
        }
      } else {
        setCustomPaymentTerms(false);
        setHasNonStandardTerm(false);
        setFormData((prev) => ({ ...prev, [name]: val }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleGLLineChange = (index, field, val) => {
    const updated = [...glLines];
    updated[index] = { ...updated[index], [field]: val };

    // Auto-fill description when GL code selected
    if (field === 'gl_code' && val) {
      const gl = excelData.glCodes.find((x) => x.value === val);
      if (gl)
        updated[index]['gl_description'] = gl.label
          .split(' - ')
          .slice(1)
          .join(' - ');
    }

    setGLLines(updated);

    if (field === 'gl_amount') {
      const total = updated.reduce(
        (sum, l) => sum + (parseFloat(l.gl_amount) || 0),
        0,
      );
      setFormData((prev) => ({ ...prev, amount: total.toFixed(2) }));
    }
  };

  const addGLLine = () =>
    setGLLines([
      ...glLines,
      {
        gl_code: '',
        gl_description: '',
        cost_center: '',
        gl_amount: '',
        location: '',
        aircraft_type: '',
        route: '',
      },
    ]);

  const removeGLLine = (index) => {
    if (glLines.length > 1) {
      const updated = glLines.filter((_, i) => i !== index);
      setGLLines(updated);
      const total = updated.reduce(
        (sum, l) => sum + (parseFloat(l.gl_amount) || 0),
        0,
      );
      setFormData((prev) => ({ ...prev, amount: total.toFixed(2) }));
    }
  };

  const handleSupplierChange = (selectedValue) => {
    if (selectedValue) {
      const s = excelData.suppliers.find((x) => x.value === selectedValue);
      if (s) {
        setFormData((prev) => ({
          ...prev,
          supplier_number: selectedValue,
          supplier_name: s.label.split(' - ').slice(1).join(' - ') || '',
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        supplier_number: '',
        supplier_name: '',
      }));
    }
  };

  const handleCustomTermsChange = (e) => {
    setCustomTermsInput(e.target.value);
    setFormData((prev) => ({ ...prev, payment_terms: e.target.value }));
  };

  const handleChangeForNewDocument = (e, index) => {
    if (e.target.files[0]) {
      const docs = [...anotherDocuments];
      docs[index] = e.target.files[0];
      setAnotherDocuments(docs);
      const names = [...uploadedFileNames];
      names[index] = e.target.files[0].name;
      setUploadedFileNames(names);
    }
  };

  const handleChangeForUpdatingDocument = (e, index) => {
    if (e.target.files[0]) {
      const docs = [...documents];
      const selectedIndex = selectedDocumentIndices.shift();
      if (selectedIndex !== undefined) {
        const docId = docs[selectedIndex]?.id;
        if (docId) setReplacedDocumentIds([...replacedDocumentIds, docId]);
        docs[selectedIndex] = e.target.files[0];
        setSelectedDocumentIndices([...selectedDocumentIndices]);
        const names = [...uploadedFileNames];
        names[index] = e.target.files[0].name;
        setUploadedFileNames(names);
      }
      setDocuments(docs);
    }
  };

  const resetState = () => {
    setValue('new');
    setFormData({
      supplier_number: getInvoiceData('supplier_number') || '',
      supplier_name: getInvoiceData('supplier_name') || '',
      invoice_number: getInvoiceData('invoice_number') || '',
      reference: getInvoiceData('reference') || '',
      invoice_date: getInvoiceData('invoice_date') || '',
      service_period: getInvoiceData('service_period') || '',
      currency: getInvoiceData('currency') || '',
      amount: getInvoiceData('amount') || '',
      quantity: getInvoiceData('quantity') || '',
      payment_terms: getInvoiceData('payment_terms') || '',
      payment_due_date: getInvoiceData('payment_due_date') || '',
    });
    setGLLines(initializeGLLines());
    setDocuments(getDocuments());
    setSelectedDocumentIndices([]);
    setAnotherSelectedDocumentIndices([]);
    setReplacedDocumentIds([]);
    setAnotherDocuments([]);
    setUploadedFileNames([]);
    setComment('');
    setCustomPaymentTerms(getInvoiceData('payment_terms') === 'custom');
    setCustomTermsInput('');
    resetInvoiceNumCheck();
  };

  const handleCloseUpdate = () => {
    resetState();
    handleClose();
  };

  const handleAddMore = () => {
    if (value === 'new' || documentsInInvoice) {
      setAnotherDocuments([...anotherDocuments, null]);
    } else {
      setDocuments([...documents, {}]);
    }
  };

  const handleFileSelect = (e, index) => {
    if (value === 'change' && !documentsInInvoice) {
      handleChangeForUpdatingDocument(e, index);
    } else {
      handleChangeForNewDocument(e, index);
    }
  };

  const getDocumentList = () =>
    value === 'change' && !documentsInInvoice
      ? documents?.filter(
          (doc) => doc && (doc.id || doc.file_data || doc.filename),
        ) || []
      : [];

  const getUploadList = () =>
    value === 'change' && !documentsInInvoice
      ? selectedDocumentIndices
      : [...Array(anotherDocuments.length || 1).keys()];

  const validateSupplierForm = () => {
    if (
      !formData.invoice_number ||
      !formData.service_period ||
      !formData.currency ||
      !formData.amount
    ) {
      toast.error('Please fill all required fields');
      return false;
    }
    return true;
  };

  const validateNonSupplierForm = () => {
    if (
      !formData.invoice_number ||
      !formData.service_period ||
      !formData.currency ||
      !formData.amount
    ) {
      toast.error('Please fill all required fields');
      return false;
    }
    if (!formData.payment_terms) {
      toast.error('Please select payment terms');
      return false;
    }
    if (customPaymentTerms && !formData.payment_terms) {
      toast.error('Please provide your custom payment terms');
      return false;
    }
    const invalid = glLines.find(
      (l) =>
        !l.gl_code ||
        !l.gl_description ||
        !l.cost_center ||
        !l.gl_amount ||
        !l.location,
    );
    if (invalid) {
      toast.error('Please fill all required GL Line fields');
      return false;
    }
    return true;
  };

  const submit = async () => {
    try {
      // Block submission if invoice number is taken
      if (invoiceNumStatus === 'taken') {
        toast.error(
          'This invoice number has already been used. Please enter a different one.',
        );
        return;
      }

      const data = new FormData();

      if (isSupplier) {
        if (!validateSupplierForm()) return;
        data.append('invoice_number', formData.invoice_number);
        data.append('service_period', formData.service_period);
        data.append('currency', formData.currency);
        data.append('amount', formData.amount);
      } else {
        if (!validateNonSupplierForm()) return;
        Object.keys(formData).forEach((key) => {
          if (key !== 'payment_terms_description')
            data.append(key, formData[key]);
        });
        data.append('gl_lines', JSON.stringify(glLines));
      }

      if (comment) data.append('comment', comment);

      if (value === 'change' && !documentsInInvoice) {
        anotherSelectedDocumentIndices.forEach((docIndex, i) => {
          data.append('documents', documents[docIndex]);
          data.append('document_id', replacedDocumentIds[i]);
        });
      } else if (value === 'new') {
        anotherDocuments.forEach((doc) => {
          if (doc) data.append('documents', doc);
        });
      }

      const invoiceId = defaultValues?.invoice?.id || defaultValues?.id;
      await dispatch(updateInvoice({ id: invoiceId, data }));
      toast.success('Invoice Updated Successfully');
      handleCloseUpdate();
      setUpdateTrigger((prev) => !prev);
    } catch (error) {
      toast.error(error.toString());
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
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
              {!isSupplier && (
                <>
                  {/* Supplier — full width so long vendor names are visible */}
                  <Grid item xs={12}>
                    <COAAutocomplete
                      options={excelData.suppliers}
                      value={formData.supplier_number}
                      onChange={(val) => handleSupplierChange(val)}
                      label="Supplier"
                      disabled={coaLoading}
                      placeholder="Type vendor ID or name to search..."
                    />
                  </Grid>

                  {/* Supplier Name — read-only, auto-filled */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Supplier Name"
                      name="supplier_name"
                      value={formData.supplier_name}
                      onChange={handleChangeFormData}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={6}>
                <TextField
                  label="Invoice Number *"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => {
                    handleChangeFormData(e);
                    checkInvoiceNum(e.target.value);
                  }}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  error={invoiceNumStatus === 'taken'}
                  helperText={
                    invoiceNumStatus === 'checking'
                      ? 'Checking availability...'
                      : invoiceNumStatus === 'taken'
                        ? 'This invoice number has already been used.'
                        : invoiceNumStatus === 'available'
                          ? '✓ Invoice number is available.'
                          : ''
                  }
                  FormHelperTextProps={{
                    sx:
                      invoiceNumStatus === 'available'
                        ? { color: 'success.main' }
                        : {},
                  }}
                  InputProps={{
                    endAdornment:
                      invoiceNumStatus === 'checking' ? (
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                      ) : undefined,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChangeFormData}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Invoice Date"
                  name="invoice_date"
                  value={formData.invoice_date}
                  onChange={handleChangeFormData}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Service Period *"
                  name="service_period"
                  value={formData.service_period}
                  onChange={handleChangeFormData}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                />
              </Grid>
              {!isSupplier && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChangeFormData}
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="number"
                    inputProps={{ min: 0, step: 1 }}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Currency *</InputLabel>
                  <Select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChangeFormData}
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
                  onChange={handleChangeFormData}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  type="number"
                  InputProps={{ readOnly: !isSupplier && glLines.length > 0 }}
                  helperText={
                    !isSupplier && glLines.length > 0
                      ? 'Auto-calculated from GL lines'
                      : ''
                  }
                />
              </Grid>
            </Grid>
          </Paper>

          {/* ── GL Lines ─────────────────────────────────────────────────── */}
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
                  onClick={addGLLine}
                  sx={{ borderRadius: '8px' }}
                >
                  Add GL Line
                </Button>
              </Box>

              {glLines.map((line, index) => (
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
                      {glLines.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => removeGLLine(index)}
                          sx={{ color: '#FF5733' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      {/* Row 1: GL Code | GL Description | Amount */}
                      <Grid item xs={12} md={5}>
                        <COAAutocomplete
                          options={excelData.glCodes}
                          value={line.gl_code}
                          onChange={(val) =>
                            handleGLLineChange(index, 'gl_code', val)
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
                          value={line.gl_description}
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
                          value={line.gl_amount}
                          onChange={(e) =>
                            handleGLLineChange(
                              index,
                              'gl_amount',
                              e.target.value,
                            )
                          }
                          fullWidth
                          required
                          variant="outlined"
                          size="small"
                          type="number"
                        />
                      </Grid>

                      {/* Row 2: Cost Center | Location | Aircraft Type | Route */}
                      <Grid item xs={12} md={3}>
                        <COAAutocomplete
                          options={excelData.costCenters}
                          value={line.cost_center}
                          onChange={(val) =>
                            handleGLLineChange(index, 'cost_center', val)
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
                          value={line.location}
                          onChange={(val) =>
                            handleGLLineChange(index, 'location', val)
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
                          value={line.aircraft_type}
                          onChange={(val) =>
                            handleGLLineChange(index, 'aircraft_type', val)
                          }
                          label="Aircraft Type"
                          disabled={coaLoading}
                          placeholder="Search aircraft type..."
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <COAAutocomplete
                          options={excelData.routes}
                          value={line.route}
                          onChange={(val) =>
                            handleGLLineChange(index, 'route', val)
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

          {/* ── Payment Terms ─────────────────────────────────────────────── */}
          {!isSupplier && (
            <Paper elevation={0} sx={style.section}>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="#00529B"
                sx={{ mb: 3 }}
              >
                Payment Terms and Due Date
              </Typography>
              <Grid container spacing={3}>
                {!customPaymentTerms ? (
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Payment Terms *"
                      name="payment_terms"
                      value={
                        hasNonStandardTerm ? 'custom' : formData.payment_terms
                      }
                      onChange={handleChangeFormData}
                      variant="outlined"
                      required
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    >
                      <MenuItem value="">
                        <em>Select payment terms</em>
                      </MenuItem>
                      {paymentTermsOptions.map((o) => (
                        <MenuItem key={o.value} value={o.value}>
                          {o.label}
                        </MenuItem>
                      ))}
                      {hasNonStandardTerm && (
                        <MenuItem value="custom">
                          Current Custom: {nonStandardTermValue}
                        </MenuItem>
                      )}
                    </TextField>
                  </Grid>
                ) : (
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Custom Payment Terms *"
                      value={customTermsInput}
                      onChange={handleCustomTermsChange}
                      variant="outlined"
                      fullWidth
                      required
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <TextField
                    type="date"
                    name="payment_due_date"
                    value={formData.payment_due_date}
                    onChange={handleChangeFormData}
                    label="Payment Due Date"
                    variant="outlined"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* ── Update Comments ───────────────────────────────────────────── */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Update Comments
            </Typography>
            <TextField
              label="Add a comment about this update"
              name="comment"
              value={comment}
              onChange={handleComment}
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder="Explain the changes you're making to this invoice"
            />
          </Paper>

          {/* ── Document Management ───────────────────────────────────────── */}
          <Paper elevation={0} sx={style.section}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="subtitle1" fontWeight="600" color="#00529B">
                Document Management
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddMore}
                sx={{ borderRadius: '8px' }}
              >
                Add Document
              </Button>
            </Box>

            {!documentsInInvoice && (
              <RadioGroup
                row
                value={value}
                onChange={handleRadioChange}
                sx={{ mb: 3 }}
              >
                <FormControlLabel
                  value="change"
                  control={
                    <Radio
                      sx={{
                        color: '#00529B',
                        '&.Mui-checked': { color: '#00529B' },
                      }}
                    />
                  }
                  label="Replace existing documents"
                />
                <FormControlLabel
                  value="new"
                  control={
                    <Radio
                      sx={{
                        color: '#00529B',
                        '&.Mui-checked': { color: '#00529B' },
                      }}
                    />
                  }
                  label="Upload document"
                />
              </RadioGroup>
            )}

            {value === 'change' &&
              !documentsInInvoice &&
              getDocumentList().length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="500">
                    Select documents to replace:
                  </Typography>
                  <Stack spacing={1}>
                    {getDocumentList().map((doc, index) => (
                      <Card
                        variant="outlined"
                        key={index}
                        sx={{ borderRadius: '8px' }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={style.documentItem}>
                            <Checkbox
                              onChange={(e) => handleCheckboxChange(e, index)}
                              sx={{
                                color: '#00529B',
                                '&.Mui-checked': { color: '#00529B' },
                              }}
                            />
                            <DescriptionIcon color="action" />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2" fontWeight="500">
                                Document {index + 1}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {doc.filename ||
                                  doc.name ||
                                  `Invoice_Document_${index + 1}`}
                              </Typography>
                            </Box>
                            {doc.file_data && (
                              <Tooltip title="View Document">
                                <Button
                                  variant="text"
                                  size="small"
                                  component="a"
                                  href={doc?.file_data}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ color: '#00529B' }}
                                >
                                  View
                                </Button>
                              </Tooltip>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="500">
                {value === 'change' && !documentsInInvoice
                  ? 'Upload replacement documents:'
                  : 'Upload new documents:'}
              </Typography>
              <Stack spacing={2}>
                {getUploadList().map((index) => (
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
                              File selected - Click to change
                            </Typography>
                          </>
                        ) : (
                          <>
                            <UploadFileIcon fontSize="large" color="action" />
                            <Typography variant="body2" fontWeight="500">
                              Click to{' '}
                              {value === 'change' && !documentsInInvoice
                                ? 'replace'
                                : 'upload'}{' '}
                              document
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              PDF, DOC, DOCX, JPG, PNG files supported
                            </Typography>
                          </>
                        )}
                      </Box>
                    </label>
                  </Box>
                ))}
                {getUploadList().length === 0 && (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: 'rgba(0, 82, 155, 0.05)',
                      borderRadius: '8px',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {value === 'change' && !documentsInInvoice
                        ? 'Select documents to replace using the checkboxes above'
                        : 'Click "Add Document" to upload new files'}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
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
          <Button
            variant="contained"
            onClick={submit}
            disabled={isLoading}
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{
              bgcolor: '#00529B',
              '&:hover': { bgcolor: '#003a6d' },
              borderRadius: '8px',
            }}
          >
            {isLoading ? 'Updating...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default UpdateInvoiceModal;
