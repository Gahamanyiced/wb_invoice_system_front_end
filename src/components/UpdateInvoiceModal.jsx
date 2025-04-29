import { useState } from 'react';
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
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 900,
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
  section: {
    p: 3,
    mb: 2,
    bgcolor: 'white',
  },
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
};

function UpdateInvoiceModal({
  defaultValues,
  open,
  handleClose,
  setUpdateTrigger,
}) {
  console.log('defaultValues', defaultValues);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.invoice);

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSupplier = user?.role === 'supplier';

  // Check if documents are in invoice property or directly in defaultValues
  const documentsInInvoice = Boolean(defaultValues?.invoice?.documents);
  
  // Initialize value state based on whether documents are in invoice property
  const [value, setValue] = useState(documentsInInvoice ? 'new' : 'new');
  const [comment, setComment] = useState('');
  const [customPaymentTerms, setCustomPaymentTerms] = useState(
    (defaultValues?.payment_terms || defaultValues?.invoice?.payment_terms) === 'custom'
  );

  const [formData, setFormData] = useState({
    supplier_number:
      defaultValues?.supplier_number ||
      defaultValues?.invoice?.supplier_number ||
      '',
    supplier_name:
      defaultValues?.supplier_name ||
      defaultValues?.invoice?.supplier_name ||
      '',
    invoice_number:
      defaultValues?.invoice_number ||
      defaultValues?.invoice?.invoice_number ||
      '',
    service_period:
      defaultValues?.service_period ||
      defaultValues?.invoice?.service_period ||
      '',
    gl_code: defaultValues?.gl_code || defaultValues?.invoice?.gl_code || '',
    gl_description:
      defaultValues?.gl_description ||
      defaultValues?.invoice?.gl_description ||
      '',
    location: defaultValues?.location || defaultValues?.invoice?.location || '',
    cost_center:
      defaultValues?.cost_center || defaultValues?.invoice?.cost_center || '',
    currency: defaultValues?.currency || defaultValues?.invoice?.currency || '',
    amount: defaultValues?.amount || defaultValues?.invoice?.amount || '',
    payment_terms: 
      defaultValues?.payment_terms || 
      defaultValues?.invoice?.payment_terms || 
      '',
    payment_terms_description: 
      defaultValues?.payment_terms_description || 
      defaultValues?.invoice?.payment_terms_description || 
      '',
    payment_due_date: 
      defaultValues?.payment_due_date || 
      defaultValues?.invoice?.payment_due_date || 
      '',
  });

  // Initialize documents state based on where they're located
  const [documents, setDocuments] = useState(
    documentsInInvoice ? defaultValues?.invoice?.documents || [] : defaultValues?.documents || []
  );
  
  const [anotherDocuments, setAnotherDocuments] = useState([]);
  const [selectedDocumentIndices, setSelectedDocumentIndices] = useState([]);
  const [anotherSelectedDocumentIndices, setAnotherSelectedDocumentIndices] =
    useState([]);
  const [replacedDocumentIds, setReplacedDocumentIds] = useState([]);
  const [uploadedFileNames, setUploadedFileNames] = useState([]);

  const handleRadioChange = (event) => {
    setValue(event.target.value);
  };

  const handleComment = (event) => {
    setComment(event.target.value);
  };

  const handleCheckboxChange = (event, index) => {
    if (event.target.checked) {
      setSelectedDocumentIndices([...selectedDocumentIndices, index]);
      setAnotherSelectedDocumentIndices([...selectedDocumentIndices, index]);
    } else {
      const newIndices = selectedDocumentIndices.filter((i) => i !== index);
      setSelectedDocumentIndices(newIndices);
      setAnotherSelectedDocumentIndices(newIndices);
    }
  };

  const handleChangeFormData = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Check if payment terms is set to custom
    if (name === 'payment_terms' && value === 'custom') {
      setCustomPaymentTerms(true);
    } else if (name === 'payment_terms') {
      setCustomPaymentTerms(false);
      // Clear custom description when a standard term is selected
      setFormData((prev) => ({ ...prev, payment_terms_description: '' }));
    }
  };

  const handleChangeForNewDocument = (event, index) => {
    if (event.target.files[0]) {
      const newDocuments = [...anotherDocuments];
      newDocuments[index] = event.target.files[0];
      setAnotherDocuments(newDocuments);

      // Store filename for display
      const newFileNames = [...uploadedFileNames];
      newFileNames[index] = event.target.files[0].name;
      setUploadedFileNames(newFileNames);
    }
  };

  const handleChangeForUpdatingDocument = (event, index) => {
    if (event.target.files[0]) {
      const newDocuments = [...documents];
      const selectedIndex = selectedDocumentIndices.shift();
      if (selectedIndex !== undefined) {
        // Store the document ID regardless of document structure
        const docId = newDocuments[selectedIndex].id;
        if (docId) {
          setReplacedDocumentIds([...replacedDocumentIds, docId]);
        }

        newDocuments[selectedIndex] = event.target.files[0];
        setSelectedDocumentIndices([...selectedDocumentIndices]);

        // Store filename for display
        const newFileNames = [...uploadedFileNames];
        newFileNames[index] = event.target.files[0].name;
        setUploadedFileNames(newFileNames);
      }
      setDocuments(newDocuments);
    }
  };

  const handleCloseUpdate = () => {
    resetState();
    handleClose();
  };

  const resetState = () => {
    setValue(documentsInInvoice ? 'new' : 'new');
    setFormData({
      supplier_number:
        defaultValues?.supplier_number ||
        defaultValues?.invoice?.supplier_number ||
        '',
      supplier_name:
        defaultValues?.supplier_name ||
        defaultValues?.invoice?.supplier_name ||
        '',
      invoice_number:
        defaultValues?.invoice_number ||
        defaultValues?.invoice?.invoice_number ||
        '',
      service_period:
        defaultValues?.service_period ||
        defaultValues?.invoice?.service_period ||
        '',
      gl_code: defaultValues?.gl_code || defaultValues?.invoice?.gl_code || '',
      gl_description:
        defaultValues?.gl_description ||
        defaultValues?.invoice?.gl_description ||
        '',
      location:
        defaultValues?.location || defaultValues?.invoice?.location || '',
      cost_center:
        defaultValues?.cost_center || defaultValues?.invoice?.cost_center || '',
      currency:
        defaultValues?.currency || defaultValues?.invoice?.currency || '',
      amount: defaultValues?.amount || defaultValues?.invoice?.amount || '',
      payment_terms: 
        defaultValues?.payment_terms || 
        defaultValues?.invoice?.payment_terms || 
        '',
      payment_terms_description: 
        defaultValues?.payment_terms_description || 
        defaultValues?.invoice?.payment_terms_description || 
        '',
      payment_due_date: 
        defaultValues?.payment_due_date || 
        defaultValues?.invoice?.payment_due_date || 
        '',
    });
    setDocuments(documentsInInvoice ? defaultValues?.invoice?.documents || [] : defaultValues?.documents || []);
    setSelectedDocumentIndices([]);
    setAnotherSelectedDocumentIndices([]);
    setReplacedDocumentIds([]);
    setAnotherDocuments([]);
    setUploadedFileNames([]);
    setComment('');
    setCustomPaymentTerms(
      (defaultValues?.payment_terms || defaultValues?.invoice?.payment_terms) === 'custom'
    );
  };

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

    if (formData.payment_terms === 'custom' && !formData.payment_terms_description) {
      toast.error('Please provide a description for your custom payment terms');
      return false;
    }

    return true;
  };

  const submit = async () => {
    try {
      const data = new FormData();

      // For suppliers, validate form fields first
      if (isSupplier) {
        if (!validateSupplierForm()) {
          return;
        }

        // Add only the fields that suppliers can modify
        data.append('invoice_number', formData.invoice_number);
        data.append('service_period', formData.service_period);
        data.append('currency', formData.currency);
        data.append('amount', formData.amount);
      } else {
        // For staff, validate and add all form fields
        if (!validateNonSupplierForm()) {
          return;
        }

        // Add all form fields
        Object.keys(formData).forEach((key) => {
          data.append(key, formData[key]);
        });
      }

      if (comment) {
        data.append('comment', comment);
      }

      if (value === 'change' && !documentsInInvoice) {
        anotherSelectedDocumentIndices.forEach((documentIndex, index) => {
          data.append('documents', documents[documentIndex]);
          data.append('document_id', replacedDocumentIds[index]);
        });
      } else if (value === 'new') {
        anotherDocuments.forEach((document) => {
          if (document) {
            data.append('documents', document);
          }
        });
      }

      // Determine the correct ID based on user role
      const isSigner = user?.role === 'signer' || user?.role === 'signer_admin';
      const invoiceId = isSigner
        ? defaultValues?.invoice?.id || defaultValues?.id
        : defaultValues?.id;

      await dispatch(updateInvoice({ id: invoiceId, data }));
      toast.success('Invoice Updated Successfully');
      handleCloseUpdate();
      setUpdateTrigger((prev) => !prev);
    } catch (error) {
      toast.error(error.toString());
    }
  };

  const handleAddMore = () => {
    if (value === 'new' || documentsInInvoice) {
      setAnotherDocuments([...anotherDocuments, null]);
    } else {
      setDocuments([...documents, {}]);
    }
  };

  const handleFileSelect = (event, index) => {
    if (value === 'change' && !documentsInInvoice) {
      handleChangeForUpdatingDocument(event, index);
    } else if (value === 'new' || documentsInInvoice) {
      handleChangeForNewDocument(event, index);
    }
  };

  const getDocumentList = () => {
    if (value === 'change' && !documentsInInvoice) {
      // Return all documents that have valid data regardless of creator
      return (
        documents?.filter(
          (doc) => doc && (doc.id || doc.file_data || doc.filename)
        ) || []
      );
    } else {
      return [];
    }
  };

  const getUploadList = () => {
    if (value === 'change' && !documentsInInvoice) {
      return selectedDocumentIndices;
    } else {
      return [...Array(anotherDocuments.length || 1).keys()];
    }
  };

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
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={style.content}>
          {/* Invoice Information Section */}
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
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Supplier Number"
                      name="supplier_number"
                      value={formData.supplier_number}
                      onChange={handleChangeFormData}
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Supplier Name"
                      name="supplier_name"
                      value={formData.supplier_name}
                      onChange={handleChangeFormData}
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </>
              )}

              {/* These fields are visible to both suppliers and staff */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Invoice Number *"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleChangeFormData}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
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
                  sx={{ mb: 2 }}
                />
              </Grid>

              {!isSupplier && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="GL Code"
                      name="gl_code"
                      value={formData.gl_code}
                      onChange={handleChangeFormData}
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="GL Description"
                      name="gl_description"
                      value={formData.gl_description}
                      onChange={handleChangeFormData}
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChangeFormData}
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Cost Center"
                      name="cost_center"
                      value={formData.cost_center}
                      onChange={handleChangeFormData}
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </>
              )}

              {/* Currency and Amount fields visible to both suppliers and staff */}
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                >
                  <InputLabel>Currency *</InputLabel>
                  <Select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChangeFormData}
                    label="Currency *"
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
                <TextField
                  label="Amount *"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChangeFormData}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                  type="number"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Payment Terms Section - Only visible to non-suppliers */}
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
                <Grid item xs={12} md={customPaymentTerms ? 4 : 6}>
                  <TextField
                    select
                    label="Payment Terms *"
                    name="payment_terms"
                    value={formData.payment_terms}
                    onChange={handleChangeFormData}
                    variant="outlined"
                    required
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
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
                </Grid>
                
                {customPaymentTerms && (
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Custom Terms Description *"
                      name="payment_terms_description"
                      value={formData.payment_terms_description}
                      onChange={handleChangeFormData}
                      variant="outlined"
                      fullWidth
                      required
                      size="small"
                      sx={{ mb: 2 }}
                      InputLabelProps={{
                        shrink: true,
                        style: { backgroundColor: 'white', paddingLeft: 5, paddingRight: 5 }
                      }}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} md={customPaymentTerms ? 4 : 6}>
                  <TextField
                    type="date"
                    name="payment_due_date"
                    value={formData.payment_due_date}
                    onChange={handleChangeFormData}
                    label="Payment Due Date"
                    variant="outlined"
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                    InputLabelProps={{
                      shrink: true,
                      style: { backgroundColor: 'white', paddingLeft: 5, paddingRight: 5 }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Comments Section - Available for all users including suppliers */}
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

          {/* Document Section - Available for all users including suppliers */}
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

            {/* Only show RadioGroup if documents are not in invoice property */}
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
            
            {/* If documents are in invoice property, always set value to "new" */}
            {documentsInInvoice && (
              <>
                {/* Hidden state setter to ensure value is "new" */}
                {value !== 'new' && setValue('new')}
                {/* No text displayed here, we'll use the heading below */}
              </>
            )}

            {/* Existing Documents (when "change" is selected) */}
            {value === 'change' && !documentsInInvoice && getDocumentList().length > 0 && (
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
                            onChange={(event) =>
                              handleCheckboxChange(event, index)
                            }
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

            {/* Document Upload Section */}
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
                        onChange={(event) => handleFileSelect(event, index)}
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
                              {value === 'change' && !documentsInInvoice ? 'replace' : 'upload'}{' '}
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
              '&:hover': {
                bgcolor: '#003a6d',
              },
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