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
  }
};

function UpdateInvoiceModal({
  defaultValues,
  open,
  handleClose,
  setUpdateTrigger,
}) {
  const navigate = useNavigate();
  const [value, setValue] = useState('new');
  const [comment, setComment] = useState('');
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.invoice);
  const [formData, setFormData] = useState({
    supplier_number: defaultValues?.supplier_number || defaultValues?.invoice?.supplier_number || '',
    supplier_name: defaultValues?.supplier_name || defaultValues?.invoice?.supplier_name || '',
    invoice_number: defaultValues?.invoice_number || defaultValues?.invoice?.invoice_number || '',
    service_period: defaultValues?.service_period || defaultValues?.invoice?.service_period || '',
    gl_code: defaultValues?.gl_code || defaultValues?.invoice?.gl_code || '',
    gl_description: defaultValues?.gl_description || defaultValues?.invoice?.gl_description || '',
    location: defaultValues?.location || defaultValues?.invoice?.location || '',
    cost_center: defaultValues?.cost_center || defaultValues?.invoice?.cost_center || '',
    currency: defaultValues?.currency || defaultValues?.invoice?.currency || '',
    amount: defaultValues?.amount || defaultValues?.invoice?.amount || '',
  });
  
  const [documents, setDocuments] = useState(defaultValues?.documents || []);
  const [anotherDocuments, setAnotherDocuments] = useState([]);
  const [selectedDocumentIndices, setSelectedDocumentIndices] = useState([]);
  const [anotherSelectedDocumentIndices, setAnotherSelectedDocumentIndices] = useState([]);
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
        setReplacedDocumentIds([
          ...replacedDocumentIds,
          newDocuments[selectedIndex].id,
        ]);
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
    setValue('new');
    setFormData({
      supplier_number: defaultValues?.supplier_number || defaultValues?.invoice?.supplier_number || '',
      supplier_name: defaultValues?.supplier_name || defaultValues?.invoice?.supplier_name || '',
      invoice_number: defaultValues?.invoice_number || defaultValues?.invoice?.invoice_number || '',
      service_period: defaultValues?.service_period || defaultValues?.invoice?.service_period || '',
      gl_code: defaultValues?.gl_code || defaultValues?.invoice?.gl_code || '',
      gl_description: defaultValues?.gl_description || defaultValues?.invoice?.gl_description || '',
      location: defaultValues?.location || defaultValues?.invoice?.location || '',
      cost_center: defaultValues?.cost_center || defaultValues?.invoice?.cost_center || '',
      currency: defaultValues?.currency || defaultValues?.invoice?.currency || '',
      amount: defaultValues?.amount || defaultValues?.invoice?.amount || '',
    });
    setDocuments(defaultValues?.documents || []);
    setSelectedDocumentIndices([]);
    setAnotherSelectedDocumentIndices([]);
    setReplacedDocumentIds([]);
    setAnotherDocuments([]);
    setUploadedFileNames([]);
    setComment('');
  };

  const submit = async () => {
    try {
      const data = new FormData();
      
      // Add all form fields to the FormData
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      if (comment) {
        data.append('comment', comment);
      }

      if (value === 'change') {
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

      await dispatch(updateInvoice({ id: defaultValues?.id, data }));
      toast.success('Invoice Updated Successfully');
      handleCloseUpdate();
      setUpdateTrigger((prev) => !prev);
    } catch (error) {
      toast.error(error.toString());
    }
  };

  const handleAddMore = () => {
    if (value === 'new') {
      setAnotherDocuments([...anotherDocuments, null]);
    } else {
      setDocuments([...documents, {}]);
    }
  };

  const handleFileSelect = (event, index) => {
    if (value === 'change') {
      handleChangeForUpdatingDocument(event, index);
    } else if (value === 'new') {
      handleChangeForNewDocument(event, index);
    }
  };

  const getDocumentList = () => {
    if (value === 'change') {
      return documents?.filter(doc => doc && Object.keys(doc).length > 0) || [];
    } else {
      return [];
    }
  };

  const getUploadList = () => {
    if (value === 'change') {
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
            <Typography variant="subtitle1" fontWeight="600" color="#00529B" sx={{ mb: 3 }}>
              Invoice Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid md={6}>
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

              <Grid md={6}>
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

              <Grid md={6}>
                <TextField
                  label="Invoice Number"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleChangeFormData}
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid md={6}>
                <TextField
                  label="Service Period"
                  name="service_period"
                  value={formData.service_period}
                  onChange={handleChangeFormData}
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid md={6}>
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

              <Grid md={6}>
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

              <Grid md={6}>
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

              <Grid md={6}>
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

              <Grid md={6}>
                <TextField
                  label="Currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChangeFormData}
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid md={6}>
                <TextField
                  label="Amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChangeFormData}
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Comments Section */}
          <Paper elevation={0} sx={style.section}>
            <Typography variant="subtitle1" fontWeight="600" color="#00529B" sx={{ mb: 3 }}>
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

          {/* Document Section */}
          <Paper elevation={0} sx={style.section}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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

            <RadioGroup
              row
              value={value}
              onChange={handleRadioChange}
              sx={{ mb: 3 }}
            >
              <FormControlLabel
                value="change"
                control={<Radio sx={{ color: '#00529B', '&.Mui-checked': { color: '#00529B' } }} />}
                label="Replace existing documents"
              />
              <FormControlLabel
                value="new"
                control={<Radio sx={{ color: '#00529B', '&.Mui-checked': { color: '#00529B' } }} />}
                label="Upload additional documents"
              />
            </RadioGroup>
            
            {/* Existing Documents (when "change" is selected) */}
            {value === 'change' && getDocumentList().length > 0 && (
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
                            onChange={(event) => handleCheckboxChange(event, index)}
                            sx={{ color: '#00529B', '&.Mui-checked': { color: '#00529B' } }}
                          />
                          <DescriptionIcon color="action" />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" fontWeight="500">
                              Document {index + 1}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {doc.filename || `Invoice_Document_${index + 1}`}
                            </Typography>
                          </Box>
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
                {value === 'change' ? 'Upload replacement documents:' : 'Upload new documents:'}
              </Typography>
              
              <Stack spacing={2}>
                {getUploadList().map((index) => (
                  <Box 
                    key={index}
                    sx={style.uploadBox}
                  >
                    <label htmlFor={`file-upload-${index}`} style={{ width: '100%', cursor: 'pointer', textAlign: 'center' }}>
                      <input
                        id={`file-upload-${index}`}
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(event) => handleFileSelect(event, index)}
                      />
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: 1
                      }}>
                        {uploadedFileNames[index] ? (
                          <>
                            <DescriptionIcon fontSize="large" sx={{ color: '#00529B' }} />
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
                              Click to {value === 'change' ? 'replace' : 'upload'} document
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
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
                      {value === 'change' 
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
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ 
              bgcolor: '#00529B',
              '&:hover': {
                bgcolor: '#003a6d',
              },
              borderRadius: '8px'
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