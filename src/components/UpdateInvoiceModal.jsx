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

// Import currencies from separate file
import currencies from '../utils/currencies';

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
  glLineCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    p: 2,
    mb: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
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
    (defaultValues?.payment_terms || defaultValues?.invoice?.payment_terms) ===
      'custom'
  );
  const [customTermsInput, setCustomTermsInput] = useState('');

  // Initialize GL Lines from the new structure
  const initializeGLLines = () => {
    const glLines = defaultValues?.gl_lines || [];
    if (glLines.length === 0) {
      // If no GL lines exist, create one empty line
      return [
        { gl_code: '', gl_description: '', cost_center: '', gl_amount: '' },
      ];
    }
    return glLines.map((line) => ({
      id: line.id,
      gl_code: line.gl_code || '',
      gl_description: line.gl_description || '',
      cost_center: line.cost_center || '',
      gl_amount: line.gl_amount || '',
    }));
  };

  // Initialize form data with the new structure
  const [formData, setFormData] = useState({
    supplier_number: defaultValues?.supplier_number || '',
    supplier_name: defaultValues?.supplier_name || '',
    invoice_number: defaultValues?.invoice_number || '',
    reference: defaultValues?.reference || '',
    invoice_date: defaultValues?.invoice_date || '',
    service_period: defaultValues?.service_period || '',
    location: defaultValues?.location || '',
    currency: defaultValues?.currency || '',
    amount: defaultValues?.amount || '',
    quantity: defaultValues?.quantity || '',
    aircraft_type: defaultValues?.aircraft_type || '',
    route: defaultValues?.route || '',
    payment_terms: defaultValues?.payment_terms || '',
    payment_due_date: defaultValues?.payment_due_date || '',
  });

  // GL Lines state
  const [glLines, setGLLines] = useState(initializeGLLines());

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

  // Initialize documents state based on where they're located
  const [documents, setDocuments] = useState(
    documentsInInvoice
      ? defaultValues?.invoice?.documents || []
      : defaultValues?.documents || []
  );

  const [anotherDocuments, setAnotherDocuments] = useState([]);
  const [selectedDocumentIndices, setSelectedDocumentIndices] = useState([]);
  const [anotherSelectedDocumentIndices, setAnotherSelectedDocumentIndices] =
    useState([]);
  const [replacedDocumentIds, setReplacedDocumentIds] = useState([]);
  const [uploadedFileNames, setUploadedFileNames] = useState([]);

  // Initialize state to track if we have a non-standard payment term
  const [hasNonStandardTerm, setHasNonStandardTerm] = useState(false);
  const [nonStandardTermValue, setNonStandardTermValue] = useState('');

  // Function to load Excel data
  const loadExcelData = async () => {
    try {
      // Import XLSX library dynamically
      const XLSX = await import('xlsx');

      // Read the Excel file from public folder using fetch
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

      // Helper function to process sheet data
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

          // Skip header row and process data
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
            .filter((item) => item.value && item.label); // Remove empty entries
        } catch (error) {
          console.error(`Error processing sheet ${sheetName}:`, error);
          return [];
        }
      };

      // Process each sheet according to your Excel structure
      const suppliers = processSheet('Supplier Details', 0, 1, true); // Vendor ID + Vendor Name
      const costCenters = processSheet('Cost Center', 0, 1, true); // CC Code + CC Description
      const glCodes = processSheet('GL Code', 0, 1, true); // GL Code + GL Description
      const locations = processSheet('Location Code', 0, 1, true); // Loc Code + LOC Name
      const aircraftTypes = processSheet('Aircraft Type', 0, 1, true); // Code + Description
      const routes = processSheet('Route', 0, 1, true); // Code + Description

      console.log('Loaded data counts:', {
        suppliers: suppliers.length,
        costCenters: costCenters.length,
        glCodes: glCodes.length,
        locations: locations.length,
        aircraftTypes: aircraftTypes.length,
        routes: routes.length,
      });

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

      // Return fallback data in case of error
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

  // Check if we need to initialize custom payment terms from the data
  useState(() => {
    const isStandardTerm = (term) => {
      return (
        !term || paymentTermsOptions.some((option) => option.value === term)
      );
    };

    const paymentTerms = defaultValues?.payment_terms;

    if (paymentTerms === 'custom') {
      setCustomPaymentTerms(true);
      const customValue = defaultValues?.payment_terms_description || '';
      setCustomTermsInput(customValue);
      if (customValue) {
        setFormData((prev) => ({ ...prev, payment_terms: customValue }));
      }
    } else if (paymentTerms && !isStandardTerm(paymentTerms)) {
      setHasNonStandardTerm(true);
      setNonStandardTermValue(paymentTerms);
      setCustomTermsInput(paymentTerms);
    }
  }, []);

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

    if (name === 'payment_terms') {
      if (value === 'custom') {
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
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle GL Line changes
  const handleGLLineChange = (index, field, value) => {
    const updatedLines = [...glLines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };

    // If it's gl_code selection, auto-populate gl_description
    if (field === 'gl_code' && value) {
      const selectedGL = excelData.glCodes.find((gl) => gl.value === value);
      if (selectedGL) {
        const description = selectedGL.label.split(' - ').slice(1).join(' - ');
        updatedLines[index]['gl_description'] = description;
      }
    }

    setGLLines(updatedLines);

    // Update total amount when gl_amount changes
    if (field === 'gl_amount') {
      const totalAmount = updatedLines.reduce((sum, line) => {
        return sum + (parseFloat(line.gl_amount) || 0);
      }, 0);
      setFormData((prev) => ({ ...prev, amount: totalAmount.toFixed(2) }));
    }
  };

  // Add new GL Line
  const addGLLine = () => {
    setGLLines([
      ...glLines,
      { gl_code: '', gl_description: '', cost_center: '', gl_amount: '' },
    ]);
  };

  // Remove GL Line
  const removeGLLine = (index) => {
    if (glLines.length > 1) {
      const updatedLines = glLines.filter((_, i) => i !== index);
      setGLLines(updatedLines);

      // Recalculate total amount
      const totalAmount = updatedLines.reduce((sum, line) => {
        return sum + (parseFloat(line.gl_amount) || 0);
      }, 0);
      setFormData((prev) => ({ ...prev, amount: totalAmount.toFixed(2) }));
    }
  };

  // Handler for supplier selection
  const handleSupplierChange = (selectedValue) => {
    if (selectedValue) {
      const selectedSupplier = excelData.suppliers.find(
        (s) => s.value === selectedValue
      );
      if (selectedSupplier) {
        // Extract number and name from the combined label
        const [number, name] = selectedSupplier.label.split(' - ');
        setFormData((prev) => ({
          ...prev,
          supplier_number: selectedValue,
          supplier_name: name || '',
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

  // Handle custom terms input
  const handleCustomTermsChange = (e) => {
    const value = e.target.value;
    setCustomTermsInput(value);
    setFormData((prev) => ({ ...prev, payment_terms: value }));
  };

  const handleChangeForNewDocument = (event, index) => {
    if (event.target.files[0]) {
      const newDocuments = [...anotherDocuments];
      newDocuments[index] = event.target.files[0];
      setAnotherDocuments(newDocuments);

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
        const docId = newDocuments[selectedIndex].id;
        if (docId) {
          setReplacedDocumentIds([...replacedDocumentIds, docId]);
        }

        newDocuments[selectedIndex] = event.target.files[0];
        setSelectedDocumentIndices([...selectedDocumentIndices]);

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
      supplier_number: defaultValues?.supplier_number || '',
      supplier_name: defaultValues?.supplier_name || '',
      invoice_number: defaultValues?.invoice_number || '',
      reference: defaultValues?.reference || '',
      invoice_date: defaultValues?.invoice_date || '',
      service_period: defaultValues?.service_period || '',
      location: defaultValues?.location || '',
      currency: defaultValues?.currency || '',
      amount: defaultValues?.amount || '',
      quantity: defaultValues?.quantity || '',
      aircraft_type: defaultValues?.aircraft_type || '',
      route: defaultValues?.route || '',
      payment_terms: defaultValues?.payment_terms || '',
      payment_due_date: defaultValues?.payment_due_date || '',
    });
    setGLLines(initializeGLLines());
    setDocuments(
      documentsInInvoice
        ? defaultValues?.invoice?.documents || []
        : defaultValues?.documents || []
    );
    setSelectedDocumentIndices([]);
    setAnotherSelectedDocumentIndices([]);
    setReplacedDocumentIds([]);
    setAnotherDocuments([]);
    setUploadedFileNames([]);
    setComment('');
    setCustomPaymentTerms(defaultValues?.payment_terms === 'custom');
    setCustomTermsInput('');
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

    if (customPaymentTerms && !formData.payment_terms) {
      toast.error('Please provide your custom payment terms');
      return false;
    }

    // Validate GL Lines
    const invalidGLLine = glLines.find(
      (line) =>
        !line.gl_code ||
        !line.gl_description ||
        !line.cost_center ||
        !line.gl_amount
    );

    if (invalidGLLine) {
      toast.error('Please fill all GL Line fields');
      return false;
    }

    return true;
  };

  const submit = async () => {
    try {
      const data = new FormData();

      if (isSupplier) {
        if (!validateSupplierForm()) {
          return;
        }
        data.append('invoice_number', formData.invoice_number);
        data.append('service_period', formData.service_period);
        data.append('currency', formData.currency);
        data.append('amount', formData.amount);
      } else {
        if (!validateNonSupplierForm()) {
          return;
        }

        // Add all form fields
        Object.keys(formData).forEach((key) => {
          if (key !== 'payment_terms_description') {
            data.append(key, formData[key]);
          }
        });

        // Add GL Lines data
        data.append('gl_lines', JSON.stringify(glLines));
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
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Supplier Number</InputLabel>
                      <Select
                        value={formData.supplier_number}
                        onChange={(e) => {
                          handleChangeFormData(e);
                          handleSupplierChange(e.target.value);
                        }}
                        name="supplier_number"
                        label="Supplier Number"
                        disabled={dataLoading}
                      >
                        <MenuItem value="">
                          <em>Select supplier</em>
                        </MenuItem>
                        {excelData.suppliers.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                  label="Reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChangeFormData}
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
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
                  sx={{ mb: 2 }}
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
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Location</InputLabel>
                      <Select
                        value={formData.location}
                        onChange={handleChangeFormData}
                        name="location"
                        label="Location"
                        disabled={dataLoading}
                      >
                        <MenuItem value="">
                          <em>Select location</em>
                        </MenuItem>
                        {excelData.locations.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

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
                      inputProps={{
                        min: 0,
                        step: 1,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Aircraft Type</InputLabel>
                      <Select
                        value={formData.aircraft_type}
                        onChange={handleChangeFormData}
                        name="aircraft_type"
                        label="Aircraft Type"
                        disabled={dataLoading}
                      >
                        <MenuItem value="">
                          <em>Select aircraft type</em>
                        </MenuItem>
                        {excelData.aircraftTypes.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Route</InputLabel>
                      <Select
                        value={formData.route}
                        onChange={handleChangeFormData}
                        name="route"
                        label="Route"
                        disabled={dataLoading}
                      >
                        <MenuItem value="">
                          <em>Select route</em>
                        </MenuItem>
                        {excelData.routes.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

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
                  label="Total Amount *"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChangeFormData}
                  fullWidth
                  required
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                  type="number"
                  InputProps={{
                    readOnly: !isSupplier && glLines.length > 0,
                  }}
                  helperText={
                    !isSupplier && glLines.length > 0
                      ? 'Auto-calculated from GL lines'
                      : ''
                  }
                />
              </Grid>
            </Grid>
          </Paper>

          {/* GL Lines Section - Only for non-suppliers */}
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
                      <Grid item xs={12} md={3}>
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel>GL Code *</InputLabel>
                          <Select
                            value={line.gl_code}
                            onChange={(e) =>
                              handleGLLineChange(
                                index,
                                'gl_code',
                                e.target.value
                              )
                            }
                            label="GL Code *"
                            required
                            disabled={dataLoading}
                          >
                            <MenuItem value="">
                              <em>Select GL code</em>
                            </MenuItem>
                            {excelData.glCodes.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          label="GL Description"
                          value={line.gl_description}
                          variant="outlined"
                          fullWidth
                          disabled
                          size="small"
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
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel>Cost Center *</InputLabel>
                          <Select
                            value={line.cost_center}
                            onChange={(e) =>
                              handleGLLineChange(
                                index,
                                'cost_center',
                                e.target.value
                              )
                            }
                            label="Cost Center *"
                            required
                            disabled={dataLoading}
                          >
                            <MenuItem value="">
                              <em>Select cost center</em>
                            </MenuItem>
                            {excelData.costCenters.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          label="Amount *"
                          value={line.gl_amount}
                          onChange={(e) =>
                            handleGLLineChange(
                              index,
                              'gl_amount',
                              e.target.value
                            )
                          }
                          fullWidth
                          required
                          variant="outlined"
                          size="small"
                          type="number"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          )}

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
                      sx={{ mb: 2 }}
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
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
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
                      sx={{ mb: 2 }}
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
                      style: {
                        backgroundColor: 'white',
                        paddingLeft: 5,
                        paddingRight: 5,
                      },
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
