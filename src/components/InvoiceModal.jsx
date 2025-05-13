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
import {
  getAllSigners,
} from '../features/user/userSlice';

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

// List of common currencies
const currencies = [
  { value: 'RWF', label: 'Rwandan Franc (RWF)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'KES', label: 'Kenyan Shilling (KES)' },
  { value: 'UGX', label: 'Ugandan Shilling (UGX)' },
  { value: 'TZS', label: 'Tanzanian Shilling (TZS)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'CNY', label: 'Chinese Yuan (CNY)' },
];

// List of payment terms options
const paymentTermsOptions = [
  { value: "net_30", label: "Net 30 - Payment due within 30 days" },
  { value: "net_45", label: "Net 45 - Payment due within 45 days" },
  { value: "net_60", label: "Net 60 - Payment due within 60 days" },
  { value: "net_90", label: "Net 90 - Payment due within 90 days" },
  { value: "due_on_receipt", label: "Due on Receipt" },
  { value: "end_of_month", label: "End of Month" },
  { value: "15_mfg", label: "15 MFG - 15th of month following goods receipt" },
  { value: "15_mfi", label: "15 MFI - 15th of month following invoice receipt" },
  { value: "custom", label: "Custom - Enter your own terms" },
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
  const [form_data, setFormData] = useState({
    supplier_number: '',
    supplier_name: '',
    invoice_number: '',
    service_period: '',
    gl_code: '',
    gl_description: '',
    location: '',
    cost_center: '',
    currency: 'RWF', // Default to RWF
    amount: '',
    payment_terms: '', // This will now hold all payment terms including custom
    payment_due_date: '', // New field for payment due date
  });
  const [documents, setDocuments] = useState([{}]);
  const [next_signers, setNextSigners] = useState([]);
  const [customPaymentTerms, setCustomPaymentTerms] = useState(false);
  const [customTermsInput, setCustomTermsInput] = useState('');

  useEffect(() => {
    dispatch(checkHeadDepartment());
    dispatch(getAllSigners());
  }, [dispatch]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
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
    });
    setDocuments([{}]);
    setNextSigners([]);
    setCustomPaymentTerms(false);
    setCustomTermsInput('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'payment_terms') {
      if (value === 'custom') {
        setCustomPaymentTerms(true);
        // Don't set form_data.payment_terms yet, wait for custom input
      } else {
        setCustomPaymentTerms(false);
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle custom terms input
  const handleCustomTermsChange = (e) => {
    const value = e.target.value;
    setCustomTermsInput(value);
    // Update the payment_terms field directly with custom input
    setFormData((prev) => ({ ...prev, payment_terms: value }));
  };

  const handleChangeDocument = (e, idx) => {
    const files = [...documents];
    files[idx] = e.target.files[0];
    setDocuments(files);
  };

  const handleAddMore = () => setDocuments([...documents, {}]);

  const handleRemoveFile = (idx) => {
    const updatedDocs = [...documents];
    updatedDocs.splice(idx, 1);
    setDocuments(updatedDocs.length ? updatedDocs : [{}]);
  };

  const submit = async () => {
    // For suppliers, validate required fields
    if (isSupplier) {
      if (!form_data.invoice_number || !form_data.amount || !form_data.currency || !form_data.service_period) {
        toast.error('Please fill all required fields');
        return;
      }
      
      if (documents.length === 1 && !documents[0].name) {
        toast.error('Please attach at least one document');
        return;
      }
    } 
    // For other roles, perform full validation
    else {
      if (!form_data.supplier_number || !form_data.invoice_number || !form_data.gl_code || !form_data.service_period) {
        toast.error('Please fill all required fields');
        return;
      }

      if (!form_data.amount) {
        toast.error('Please enter an amount');
        return;
      }

      if (!form_data.payment_terms) {
        toast.error('Please select payment terms');
        return;
      }

      // Verify that custom terms have been entered if custom is selected
      if (customPaymentTerms && !customTermsInput) {
        toast.error('Please provide your custom payment terms');
        return;
      }

      if (documents.length === 1 && !documents[0].name) {
        toast.error('Please attach at least one document');
        return;
      }
    }

    const data = new FormData();
    Object.entries(form_data).forEach(([key, val]) => data.append(key, val));
    if (next_signers.length) data.append('next_signers', next_signers);
    
    // Only append documents that have files
    documents.forEach((doc) => {
      if (doc && doc.name) {
        data.append('documents', doc);
      }
    });

    try {
      await dispatch(addInvoice(data)).unwrap();
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
            <Typography variant="h6">
              Create New Invoice
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleClose}
              sx={style.closeButton}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={style.content}>
            {/* Only show supplier section for non-supplier roles */}
            {!isSupplier && (
              <>
                <Box sx={style.section}>
                  <Typography variant="h6" sx={style.sectionTitle}>
                    Supplier Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel sx={style.inputLabel}>Supplier Number *</InputLabel>
                        <Input
                          type="text"
                          name="supplier_number"
                          value={form_data.supplier_number}
                          onChange={handleChange}
                          required
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel sx={style.inputLabel}>Supplier Name</InputLabel>
                        <Input
                          name="supplier_name"
                          value={form_data.supplier_name}
                          onChange={handleChange}
                        />
                      </FormControl>
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
                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={style.inputLabel}>Invoice Number *</InputLabel>
                    <Input
                      type="text"
                      name="invoice_number"
                      value={form_data.invoice_number}
                      onChange={handleChange}
                      required
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={style.inputLabel}>Service Period *</InputLabel>
                    <Input
                      name="service_period"
                      value={form_data.service_period}
                      onChange={handleChange}
                      required
                    />
                  </FormControl>
                </Grid>
                
                {/* Only show these fields to non-suppliers */}
                {!isSupplier && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel sx={style.inputLabel}>GL Code *</InputLabel>
                        <Input
                          type="text"
                          name="gl_code"
                          value={form_data.gl_code}
                          onChange={handleChange}
                          required
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel sx={style.inputLabel}>GL Description</InputLabel>
                        <Input
                          name="gl_description"
                          value={form_data.gl_description}
                          onChange={handleChange}
                        />
                      </FormControl>
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
                      <FormControl fullWidth variant="outlined">
                        <InputLabel sx={style.inputLabel}>Location</InputLabel>
                        <Input
                          name="location"
                          value={form_data.location}
                          onChange={handleChange}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel sx={style.inputLabel}>Cost Center</InputLabel>
                        <Input
                          name="cost_center"
                          value={form_data.cost_center}
                          onChange={handleChange}
                        />
                      </FormControl>
                    </Grid>
                  </>
                )}
                
                {/* Currency and Amount - shown to all users including suppliers */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="currency-label" sx={style.inputLabel}>Currency *</InputLabel>
                    <Select
                      labelId="currency-label"
                      name="currency"
                      value={form_data.currency}
                      onChange={handleChange}
                      label="Currency"
                      required
                    >
                      {currencies.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={style.inputLabel}>Amount *</InputLabel>
                    <Input
                      type="number"
                      name="amount"
                      value={form_data.amount}
                      onChange={handleChange}
                      sx={style.formInputNumber}
                      required
                    />
                  </FormControl>
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
                        <FormControl fullWidth variant="outlined">
                          <TextField
                            select
                            label="Payment Terms *"
                            name="payment_terms"
                            value={customPaymentTerms ? "custom" : form_data.payment_terms}
                            onChange={handleChange}
                            variant="outlined"
                            required
                            fullWidth
                            InputLabelProps={{
                              shrink: true,
                              style: { backgroundColor: 'white', paddingLeft: 5, paddingRight: 5 }
                            }}
                          >
                            <MenuItem value="">
                              <em>Select payment terms</em>
                            </MenuItem>
                            {paymentTermsOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </FormControl>
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
                          InputLabelProps={{
                            shrink: true,
                            style: { backgroundColor: 'white', paddingLeft: 5, paddingRight: 5 }
                          }}
                        />
                      </Grid>
                    )}
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        type="date"
                        name="payment_due_date"
                        value={form_data.payment_due_date}
                        onChange={handleChange}
                        label="Payment Due Date"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                          style: { backgroundColor: 'white', paddingLeft: 5, paddingRight: 5 }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
                <Divider sx={{ my: 2 }} />
              </>
            )}

            {/* Only show for non-suppliers with specific roles */}
            {!isSupplier && (isHeadDepartment.is_head_of_department || user.role === 'signer_admin') && (
              <>
                <Box sx={style.section}>
                  <Typography variant="h6" sx={style.sectionTitle}>
                    Approval Workflow
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    <Autocomplete
                      multiple
                      options={users.results || []}
                      getOptionLabel={(opt) => `${opt.firstname} ${opt.lastname}`}
                      value={next_signers.map(id => users.results.find(u => u.id === id)).filter(Boolean)}
                      onChange={(_, v) => setNextSigners(v.map(opt => opt.id))}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Next Signers"
                          placeholder="Select signers"
                          variant="outlined"
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

            <Box sx={style.actionButtons}>
              <Button 
                variant="outlined" 
                onClick={handleClose}
              >
                Cancel
              </Button>
              {isLoading ? (
                <Button 
                  variant="contained" 
                  disabled
                >
                  <CircularProgress size={24} color="inherit" />
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  sx={style.sendButton} 
                  onClick={submit}
                >
                  Submit Invoice
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Modal>
    </>
  );
}