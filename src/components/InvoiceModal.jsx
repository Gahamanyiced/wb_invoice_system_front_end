import * as React from 'react';
import { useState, useEffect } from 'react';
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

  // Get the validation schema based on user role
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
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onSubmit', // Change validation mode to onSubmit to avoid premature validation
    defaultValues: {
      supplier_number: '',
      supplier_name: '',
      invoice_number: '',
      service_period: '',
      gl_code: '',
      gl_description: '',
      location: '',
      cost_center: '',
      currency: 'RWF',
      amount: '',
      payment_terms: '',
      payment_due_date: '',
      next_signers_validator: '',
    },
  });

  // Watch payment terms field to handle custom payment terms logic
  const payment_terms = watch('payment_terms');

  // Register a custom field for next signers in the form
  useEffect(() => {
    // If signers are selected, register them in the form
    if (next_signers.length > 0) {
      setValue('next_signers_validator', next_signers.join(','));
    }
  }, [next_signers, setValue]);

  useEffect(() => {
    dispatch(checkHeadDepartment());
    dispatch(getAllSigners());
  }, [dispatch]);

  useEffect(() => {
    // Handle custom payment terms
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
  };

  // Handle custom terms input
  const handleCustomTermsChange = (e) => {
    const value = e.target.value;
    setCustomTermsInput(value);
    // Update the payment_terms field directly with custom input
    setValue('payment_terms', value, { shouldValidate: true });
  };

  // Use this to programmatically submit the form
  const formRef = React.useRef();

  const handleChangeDocument = (e, idx) => {
    const files = [...documents];
    const file = e.target.files[0];

    // Validate file type (must be PDF)
    if (file && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are allowed');
      e.target.value = null; // Clear the file input
      return;
    }

    // Validate file size (max 10MB)
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error('File size must not exceed 10MB');
      e.target.value = null; // Clear the file input
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

  const onSubmit = async (data) => {
    // Validate that at least one next signer is selected when required
    const shouldValidateSigners =
      !isSupplier &&
      (isHeadDepartment.is_head_of_department || user.role === 'signer_admin');
    if (shouldValidateSigners && next_signers.length === 0) {
      toast.error('Please select at least one next signer');
      return;
    }

    // Check if at least one document is attached
    if (documents.every((doc) => !doc || !doc.name)) {
      toast.error('Please attach at least one document');
      return;
    }

    // Validate attachments (file type and size)
    const hasInvalidFiles = documents.some((doc) => {
      if (doc && doc.name) {
        // Check file type (must be PDF)
        if (!doc.name.toLowerCase().endsWith('.pdf')) {
          toast.error('Only PDF files are allowed');
          return true;
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
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

    // Format the payment_due_date to YYYY-MM-DD if it exists
    const formattedData = { ...data };

    // Remove the next_signers_validator as it's only for client-side validation
    delete formattedData.next_signers_validator;

    if (formattedData.payment_due_date) {
      // Convert the date to YYYY-MM-DD format
      const date = new Date(formattedData.payment_due_date);
      formattedData.payment_due_date = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    // Prepare the form data
    const formData = new FormData();
    Object.entries(formattedData).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        formData.append(key, val);
      }
    });

    if (next_signers.length > 0) {
      // Send as comma-separated string instead of JSON array
      formData.append('next_signers', next_signers.join(','));
    }

    // Only append documents that have files
    documents.forEach((doc) => {
      if (doc && doc.name) {
        formData.append('documents', doc);
      }
    });

    try {
      await dispatch(addInvoice(formData)).unwrap();
      toast.success('Invoice Added Successfully');
      handleClose();
      dispatch(getInvoiceByUser({ page: 1 }));
    } catch (err) {
      toast.error(err.toString());
      navigate('/');
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
              {/* Only show supplier section for non-supplier roles */}
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
                              <InputLabel sx={style.inputLabel}>
                                Supplier Number *
                              </InputLabel>
                              <Input {...field} type="text" required />
                              {errors.supplier_number && (
                                <FormHelperText error>
                                  {errors.supplier_number.message}
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="supplier_name"
                          control={control}
                          render={({ field }) => (
                            <FormControl
                              fullWidth
                              variant="outlined"
                              error={!!errors.supplier_name}
                            >
                              <InputLabel sx={style.inputLabel}>
                                Supplier Name
                              </InputLabel>
                              <Input {...field} />
                              {errors.supplier_name && (
                                <FormHelperText error>
                                  {errors.supplier_name.message}
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {/* Invoice Details section - shown to all users including suppliers */}
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

                  {/* Only show these fields to non-suppliers */}
                  {!isSupplier && (
                    <>
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
                              <InputLabel sx={style.inputLabel}>
                                GL Code *
                              </InputLabel>
                              <Input {...field} type="text" required />
                              {errors.gl_code && (
                                <FormHelperText error>
                                  {errors.gl_code.message}
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="gl_description"
                          control={control}
                          render={({ field }) => (
                            <FormControl
                              fullWidth
                              variant="outlined"
                              error={!!errors.gl_description}
                            >
                              <InputLabel sx={style.inputLabel}>
                                GL Description
                              </InputLabel>
                              <Input {...field} />
                              {errors.gl_description && (
                                <FormHelperText error>
                                  {errors.gl_description.message}
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Financial Information - shown to all users including suppliers */}
              <Box sx={style.section}>
                <Typography variant="h6" sx={style.sectionTitle}>
                  Financial Information
                </Typography>
                <Grid container spacing={3}>
                  {/* Only show these fields to non-suppliers */}
                  {!isSupplier && (
                    <>
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
                              <InputLabel sx={style.inputLabel}>
                                Location
                              </InputLabel>
                              <Input {...field} />
                              {errors.location && (
                                <FormHelperText error>
                                  {errors.location.message}
                                </FormHelperText>
                              )}
                            </FormControl>
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
                              <InputLabel sx={style.inputLabel}>
                                Cost Center
                              </InputLabel>
                              <Input {...field} />
                              {errors.cost_center && (
                                <FormHelperText error>
                                  {errors.cost_center.message}
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}
                        />
                      </Grid>
                    </>
                  )}

                  {/* Currency and Amount - shown to all users including suppliers */}
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
                            required
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
                          />
                          {errors.amount && (
                            <FormHelperText error>
                              {errors.amount.message}
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
                                  required
                                  fullWidth
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
                                {errors.payment_terms && (
                                  <FormHelperText error>
                                    {errors.payment_terms.message}
                                  </FormHelperText>
                                )}
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
                            required
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

              {/* Only show for non-suppliers with specific roles */}
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
                              // Remove required attribute to prevent HTML5 validation
                              error={next_signers.length === 0}
                              helperText={
                                next_signers.length === 0
                                  ? 'At least one signer is required'
                                  : ''
                              }
                              // Add a hidden input field that React Hook Form can use for validation
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {params.InputProps.endAdornment}
                                    {/* This hidden input satisfies the form submission when signers are selected */}
                                    {next_signers.length > 0 && (
                                      <input
                                        type="hidden"
                                        name="next_signers_validator"
                                        value={next_signers.join(',')}
                                      />
                                    )}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      </FormControl>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                  </>
                )}

              {/* This section is shown to all users including suppliers */}
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
                    type="button" // Changed from submit to button
                    variant="contained"
                    sx={style.sendButton}
                    onClick={() => {
                      // If signers are required, update the form field first
                      if (
                        !isSupplier &&
                        (isHeadDepartment.is_head_of_department ||
                          user.role === 'signer_admin')
                      ) {
                        setValue(
                          'next_signers_validator',
                          next_signers.join(',')
                        );
                      }
                      // Manually trigger form submission
                      handleSubmit(onSubmit)();
                    }}
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
