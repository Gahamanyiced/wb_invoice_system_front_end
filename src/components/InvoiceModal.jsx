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
} from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import { useDispatch, useSelector } from 'react-redux';
import { addInvoice, getInvoiceByUser } from '../features/invoice/invoiceSlice';
import { checkHeadDepartment } from '../features/department/departmentSlice';
import { getAllSigners } from '../features/user/userSlice';

// Import the Yup resolver and validation schemas
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getInvoiceValidationSchema } from '../validations/invoice';

// Import currencies from separate file
import currencies from '../utils/currencies';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// List of payment terms options
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
    width: 900,
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
  content: {
    padding: '24px',
  },
  closeButton: {
    color: 'white',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '16px',
    color: '#444',
  },
  inputLabel: {
    fontSize: '14px',
  },
  formInputNumber: {
    '& input': {
      '-moz-appearance': 'textfield',
    },
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
  },
  fileInputContainer: {
    marginTop: '8px',
    marginBottom: '8px',
  },
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
    '&:hover': {
      backgroundColor: '#003a6d',
    },
  },
  errorText: {
    color: 'error.main',
    fontSize: '0.75rem',
    marginTop: '3px',
    marginLeft: '14px',
  },
};

export default function InvoiceModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading } = useSelector((state) => state.invoice);
  const { isHeadDepartment } = useSelector((state) => state.department);
  const { users } = useSelector((state) => state.user);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check if user is a supplier
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

  // State for Excel data
  const [excelData, setExcelData] = useState({
    suppliers: [],
    costCenters: [],
    glCodes: [],
    locations: [],
    aircraftTypes: [],
    routes: [],
  });
  const [dataLoading, setDataLoading] = useState(false);

  // Get the validation schema with context
  const validationSchema = getInvoiceValidationSchema(user?.role);

  // Initialize the form with react-hook-form and yup resolver
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    register,
    formState: { errors },
    watch,
    clearErrors,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onSubmit',
    context: { useMultipleGL }, // Pass context for conditional validation
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

  // Watch payment terms field to handle custom payment terms logic
  const payment_terms = watch('payment_terms');

  // Function to load Excel data
  const loadExcelData = async () => {
    try {
      const XLSX = await import('xlsx');
      const response = await fetch('/6. COA.xlsx');
      if (!response.ok) {
        throw new Error(`Failed to fetch Excel file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        cellStyles: true,
        cellFormulas: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true,
      });

      const processSheet = (
        sheetName,
        valueColumn,
        labelColumn,
        combinedLabel = false
      ) => {
        try {
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) {
            console.warn(`Sheet "${sheetName}" not found`);
            return [];
          }

          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          return jsonData
            .slice(1)
            .filter(
              (row) =>
                row[valueColumn] !== undefined &&
                row[valueColumn] !== null &&
                row[valueColumn] !== ''
            )
            .map((row) => {
              const value = String(row[valueColumn]).trim();
              const label = row[labelColumn]
                ? String(row[labelColumn]).trim()
                : value;

              return {
                value: value,
                label: combinedLabel ? `${value} - ${label}` : label,
              };
            })
            .filter((item) => item.value && item.label);
        } catch (error) {
          console.error(`Error processing sheet ${sheetName}:`, error);
          return [];
        }
      };

      const suppliers = processSheet('Supplier Details', 0, 1, true);
      const costCenters = processSheet('Cost Center', 0, 1, true);
      const glCodes = processSheet('GL Code', 0, 1, true);
      const locations = processSheet('Location Code', 0, 1, true);
      const aircraftTypes = processSheet('Aircraft Type', 0, 1, true);
      const routes = processSheet('Route', 0, 1, true);

      return {
        suppliers,
        costCenters,
        glCodes,
        locations,
        aircraftTypes: aircraftTypes.length > 0 ? aircraftTypes : [],
        routes: routes.length > 0 ? routes : [],
      };
    } catch (error) {
      console.error('Error loading Excel data:', error);
      return {
        suppliers: [{ value: '00001', label: '00001 - Sample Supplier' }],
        costCenters: [{ value: '1000', label: '1000 - Sample Cost Center' }],
        glCodes: [{ value: '1011', label: '1011 - Sample GL Code' }],
        locations: [{ value: '0000', label: '0000 - Default Location' }],
        aircraftTypes: [],
        routes: [],
      };
    }
  };

  // Load Excel data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      try {
        const data = await loadExcelData();
        setExcelData(data);
      } catch (error) {
        console.error('Failed to load Excel data:', error);
        toast.error('Failed to load reference data');
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (next_signers.length > 0) {
      setValue('next_signers_validator', next_signers.join(','));
    }
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
      const selectedSupplier = excelData.suppliers.find(
        (s) => s.value === selectedValue
      );
      if (selectedSupplier) {
        const [number, name] = selectedSupplier.label.split(' - ');
        setValue('supplier_number', selectedValue);
        setValue('supplier_name', name || '');
      }
    } else {
      setValue('supplier_number', '');
      setValue('supplier_name', '');
    }
  };

  const handleGLCodeChange = (selectedValue) => {
    if (selectedValue) {
      const selectedGL = excelData.glCodes.find(
        (gl) => gl.value === selectedValue
      );
      if (selectedGL) {
        const description = selectedGL.label.split(' - ').slice(1).join(' - ');
        setValue('gl_code', selectedValue);
        setValue('gl_description', description || '');
      }
    } else {
      setValue('gl_code', '');
      setValue('gl_description', '');
    }
  };

  const calculateTotalAmount = (entries) => {
    return entries.reduce(
      (sum, entry) => sum + (parseFloat(entry.gl_amount) || 0),
      0
    );
  };

  const handleAddGLEntry = () => {
    const newEntries = [
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
    ];
    setGLEntries(newEntries);
  };

  const handleRemoveGLEntry = (index) => {
    if (glEntries.length > 1) {
      const updatedEntries = glEntries.filter((_, idx) => idx !== index);
      setGLEntries(updatedEntries);
      const totalAmount = calculateTotalAmount(updatedEntries);
      setValue('amount', totalAmount.toString());
    }
  };

  const handleGLEntryChange = (index, field, value) => {
    const updatedEntries = [...glEntries];
    updatedEntries[index][field] = value;

    if (field === 'gl_code' && value) {
      const selectedGL = excelData.glCodes.find((gl) => gl.value === value);
      if (selectedGL) {
        const description = selectedGL.label.split(' - ').slice(1).join(' - ');
        updatedEntries[index]['gl_description'] = description;
      }
    }

    setGLEntries(updatedEntries);

    if (field === 'gl_amount') {
      const totalAmount = calculateTotalAmount(updatedEntries);
      setValue('amount', totalAmount.toString());
    }
  };

  // Updated validation function for multiple GL mode
  const validateMultipleGLEntries = () => {
    if (!isSupplier && useMultipleGL) {
      const hasValidEntries = glEntries.every(
        (entry) =>
          entry.gl_code &&
          entry.gl_amount &&
          entry.cost_center &&
          entry.location
      );
      return hasValidEntries;
    }
    return true;
  };

  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    console.log('Form errors:', errors);

    try {
      // Additional validation for multiple GL mode
      if (!isSupplier && useMultipleGL) {
        if (!validateMultipleGLEntries()) {
          toast.error(
            'Please fill in all required GL entry fields: GL Code, Amount, Cost Center, and Location'
          );
          return;
        }

        const totalGLAmount = calculateTotalAmount(glEntries);
        if (totalGLAmount <= 0) {
          toast.error('Total GL amount must be greater than 0');
          return;
        }
      }

      // Validate signers for staff users
      const shouldValidateSigners =
        !isSupplier &&
        (isHeadDepartment.is_head_of_department ||
          user.role === 'signer_admin');
      if (shouldValidateSigners && next_signers.length === 0) {
        toast.error('Please select at least one next signer');
        return;
      }

      // Check documents
      if (documents.every((doc) => !doc || !doc.name)) {
        toast.error('Please attach at least one document');
        return;
      }

      // Validate file types and sizes
      const hasInvalidFiles = documents.some((doc) => {
        if (doc && doc.name) {
          if (!doc.name.toLowerCase().endsWith('.pdf')) {
            toast.error('Only PDF files are allowed');
            return true;
          }
          const maxSize = 10 * 1024 * 1024;
          if (doc.size > maxSize) {
            toast.error('File size must not exceed 10MB');
            return true;
          }
        }
        return false;
      });

      if (hasInvalidFiles) {
        return;
      }

      // Format the data
      const formattedData = { ...data };
      delete formattedData.next_signers_validator;

      if (formattedData.payment_due_date) {
        const date = new Date(formattedData.payment_due_date);
        formattedData.payment_due_date = date.toISOString().split('T')[0];
      }

      if (formattedData.invoice_date) {
        const date = new Date(formattedData.invoice_date);
        formattedData.invoice_date = date.toISOString().split('T')[0];
      }

      // Prepare FormData
      const formData = new FormData();

      const basicFields = [
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
      ];

      basicFields.forEach((key) => {
        if (
          formattedData[key] !== undefined &&
          formattedData[key] !== null &&
          formattedData[key] !== ''
        ) {
          formData.append(key, formattedData[key]);
        }
      });

      // Handle GL Lines
      if (!isSupplier && useMultipleGL) {
        const validEntries = glEntries.filter(
          (entry) => entry.gl_code && entry.gl_amount && entry.cost_center
        );

        const glLines = validEntries.map((entry) => ({
          gl_code: entry.gl_code,
          gl_description: entry.gl_description || '',
          cost_center: entry.cost_center,
          gl_amount: parseFloat(entry.gl_amount).toFixed(2),
          location: entry.location || '',
          aircraft_type: entry.aircraft_type || '',
          route: entry.route || '',
        }));

        formData.append('gl_lines', JSON.stringify(glLines));
      } else if (!isSupplier && !useMultipleGL) {
        const glLines = [
          {
            gl_code: formattedData.gl_code,
            gl_description: formattedData.gl_description || '',
            cost_center: formattedData.cost_center,
            gl_amount: parseFloat(formattedData.amount).toFixed(2),
            location: formattedData.location || '',
            aircraft_type: formattedData.aircraft_type || '',
            route: formattedData.route || '',
          },
        ];

        formData.append('gl_lines', JSON.stringify(glLines));
      }

      if (next_signers.length > 0) {
        formData.append('next_signers', next_signers.join(','));
      }

      documents.forEach((doc) => {
        if (doc && doc.name) {
          formData.append('documents', doc);
        }
      });

      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      await dispatch(addInvoice(formData)).unwrap();
      toast.success('Invoice Added Successfully');
      handleClose();
      dispatch(getInvoiceByUser({ page: 1 }));
    } catch (err) {
      console.error('Submit error:', err);
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
              {/* Debug section - Remove this in production */}
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

              {/* Supplier section for non-suppliers */}
              {!isSupplier && (
                <>
                  <Box sx={style.section}>
                    <Typography variant="h6" sx={style.sectionTitle}>
                      Supplier Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="supplier_number"
                          control={control}
                          render={({ field }) => (
                            <FormControl
                              fullWidth
                              variant="outlined"
                              error={!!errors.supplier_number}
                            >
                              <TextField
                                {...field}
                                select
                                label="Supplier *"
                                variant="outlined"
                                fullWidth
                                disabled={dataLoading}
                                error={!!errors.supplier_number}
                                helperText={errors.supplier_number?.message}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  handleSupplierChange(e.target.value);
                                }}
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
                                  <em>Select supplier</em>
                                </MenuItem>
                                {excelData.suppliers.map((option) => (
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
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* GL Code Configuration */}
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
                              setValue('gl_code', '');
                              setValue('gl_description', '');
                              setValue('cost_center', '');
                              setValue('location', '');
                              setValue('aircraft_type', '');
                              setValue('route', '');
                              setValue('amount', '');
                            }
                          }}
                        />
                      }
                      label="Use Multiple GL Codes"
                      sx={{ mb: 3 }}
                    />

                    {!useMultipleGL ? (
                      // Single GL Code Mode
                      <>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Controller
                              name="gl_code"
                              control={control}
                              render={({ field }) => (
                                <FormControl
                                  fullWidth
                                  variant="outlined"
                                  error={!!errors.gl_code}
                                >
                                  <TextField
                                    {...field}
                                    select
                                    label="GL Code *"
                                    variant="outlined"
                                    fullWidth
                                    disabled={dataLoading}
                                    error={!!errors.gl_code}
                                    helperText={errors.gl_code?.message}
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                      handleGLCodeChange(e.target.value);
                                    }}
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
                                      <em>Select GL code</em>
                                    </MenuItem>
                                    {excelData.glCodes.map((option) => (
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
                          <Grid item xs={12} md={6}>
                            <Controller
                              name="cost_center"
                              control={control}
                              render={({ field }) => (
                                <FormControl
                                  fullWidth
                                  variant="outlined"
                                  error={!!errors.cost_center}
                                >
                                  <TextField
                                    {...field}
                                    select
                                    label="Cost Center *"
                                    variant="outlined"
                                    fullWidth
                                    disabled={dataLoading}
                                    error={!!errors.cost_center}
                                    helperText={errors.cost_center?.message}
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
                                      <em>Select cost center</em>
                                    </MenuItem>
                                    {excelData.costCenters.map((option) => (
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
                          <Grid item xs={12} md={6}>
                            <Controller
                              name="location"
                              control={control}
                              render={({ field }) => (
                                <FormControl
                                  fullWidth
                                  variant="outlined"
                                  error={!!errors.location}
                                >
                                  <TextField
                                    {...field}
                                    select
                                    label="Location *"
                                    variant="outlined"
                                    fullWidth
                                    disabled={dataLoading}
                                    error={!!errors.location}
                                    helperText={errors.location?.message}
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
                                      <em>Select location</em>
                                    </MenuItem>
                                    {excelData.locations.map((option) => (
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
                          <Grid item xs={12} md={6}>
                            <Controller
                              name="aircraft_type"
                              control={control}
                              render={({ field }) => (
                                <FormControl fullWidth variant="outlined">
                                  <TextField
                                    {...field}
                                    select
                                    label="Aircraft Type"
                                    variant="outlined"
                                    fullWidth
                                    disabled={dataLoading}
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
                                      <em>Select aircraft type</em>
                                    </MenuItem>
                                    {excelData.aircraftTypes.map((option) => (
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
                          <Grid item xs={12} md={6}>
                            <Controller
                              name="route"
                              control={control}
                              render={({ field }) => (
                                <FormControl fullWidth variant="outlined">
                                  <TextField
                                    {...field}
                                    select
                                    label="Route"
                                    variant="outlined"
                                    fullWidth
                                    disabled={dataLoading}
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
                                      <em>Select route</em>
                                    </MenuItem>
                                    {excelData.routes.map((option) => (
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
                        </Grid>
                      </>
                    ) : (
                      // Multiple GL Codes Mode
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
                              <Grid item xs={12} md={4}>
                                <TextField
                                  select
                                  label="GL Code *"
                                  value={entry.gl_code}
                                  onChange={(e) =>
                                    handleGLEntryChange(
                                      index,
                                      'gl_code',
                                      e.target.value
                                    )
                                  }
                                  variant="outlined"
                                  fullWidth
                                  required
                                  disabled={dataLoading}
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
                                    <em>Select GL code</em>
                                  </MenuItem>
                                  {excelData.glCodes.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>

                              <Grid item xs={12} md={4}>
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

                              <Grid item xs={12} md={4}>
                                <TextField
                                  label="Amount *"
                                  type="number"
                                  value={entry.gl_amount}
                                  onChange={(e) =>
                                    handleGLEntryChange(
                                      index,
                                      'gl_amount',
                                      e.target.value
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

                              <Grid item xs={12} md={3}>
                                <TextField
                                  select
                                  label="Cost Center *"
                                  value={entry.cost_center}
                                  onChange={(e) =>
                                    handleGLEntryChange(
                                      index,
                                      'cost_center',
                                      e.target.value
                                    )
                                  }
                                  variant="outlined"
                                  fullWidth
                                  required
                                  disabled={dataLoading}
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
                                    <em>Select cost center</em>
                                  </MenuItem>
                                  {excelData.costCenters.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>

                              <Grid item xs={12} md={3}>
                                <TextField
                                  select
                                  label="Location *"
                                  value={entry.location}
                                  onChange={(e) =>
                                    handleGLEntryChange(
                                      index,
                                      'location',
                                      e.target.value
                                    )
                                  }
                                  variant="outlined"
                                  fullWidth
                                  required
                                  disabled={dataLoading}
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
                                    <em>Select location</em>
                                  </MenuItem>
                                  {excelData.locations.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>

                              <Grid item xs={12} md={3}>
                                <TextField
                                  select
                                  label="Aircraft Type"
                                  value={entry.aircraft_type}
                                  onChange={(e) =>
                                    handleGLEntryChange(
                                      index,
                                      'aircraft_type',
                                      e.target.value
                                    )
                                  }
                                  variant="outlined"
                                  fullWidth
                                  disabled={dataLoading}
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
                                    <em>Select aircraft type</em>
                                  </MenuItem>
                                  {excelData.aircraftTypes.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>

                              <Grid item xs={12} md={3}>
                                <TextField
                                  select
                                  label="Route"
                                  value={entry.route}
                                  onChange={(e) =>
                                    handleGLEntryChange(
                                      index,
                                      'route',
                                      e.target.value
                                    )
                                  }
                                  variant="outlined"
                                  fullWidth
                                  disabled={dataLoading}
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
                                    <em>Select route</em>
                                  </MenuItem>
                                  {excelData.routes.map((option) => (
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>
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

                        {/* Display total amount */}
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

              {/* Invoice Details section */}
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
                          error={!!errors.invoice_number}
                        >
                          <InputLabel sx={style.inputLabel}>
                            Invoice Number *
                          </InputLabel>
                          <Input {...field} type="text" required />
                          {errors.invoice_number && (
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

              {/* Financial Information */}
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

              {/* Payment Terms Section - only shown to non-suppliers */}
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

              {/* Approval Workflow */}
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
                              users.results?.find((u) => u.id === id)
                            )
                            .filter(Boolean)}
                          onChange={(_, newValues) => {
                            const newSignerIds = newValues.map((opt) => opt.id);
                            setNextSigners(newSignerIds);
                          }}
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

              {/* Attachments */}
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
