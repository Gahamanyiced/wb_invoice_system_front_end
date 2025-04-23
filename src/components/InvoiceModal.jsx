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
  });
  const [documents, setDocuments] = useState([{}]);
  const [next_signers, setNextSigners] = useState([]);

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
    });
    setDocuments([{}]);
    setNextSigners([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    // Validation
    if (!form_data.supplier_number || !form_data.invoice_number || !form_data.gl_code) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!form_data.amount) {
      toast.error('Please enter an amount');
      return;
    }

    if (documents.length === 1 && !documents[0].name) {
      toast.error('Please attach at least one document');
      return;
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
            <Box sx={style.section}>
              <Typography variant="h6" sx={style.sectionTitle}>
                Supplier Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={style.inputLabel}>Supplier Number *</InputLabel>
                    <Input
                      type="number"
                      name="supplier_number"
                      value={form_data.supplier_number}
                      onChange={handleChange}
                      sx={style.formInputNumber}
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
            
            <Box sx={style.section}>
              <Typography variant="h6" sx={style.sectionTitle}>
                Invoice Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={style.inputLabel}>Invoice Number *</InputLabel>
                    <Input
                      type="number"
                      name="invoice_number"
                      value={form_data.invoice_number}
                      onChange={handleChange}
                      sx={style.formInputNumber}
                      required
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={style.inputLabel}>Service Period</InputLabel>
                    <Input
                      name="service_period"
                      value={form_data.service_period}
                      onChange={handleChange}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={style.inputLabel}>GL Code *</InputLabel>
                    <Input
                      type="number"
                      name="gl_code"
                      value={form_data.gl_code}
                      onChange={handleChange}
                      sx={style.formInputNumber}
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
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <Box sx={style.section}>
              <Typography variant="h6" sx={style.sectionTitle}>
                Financial Information
              </Typography>
              <Grid container spacing={3}>
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

            {(isHeadDepartment.is_head_of_department || user.role === 'signer_admin') && (
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
            )}

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