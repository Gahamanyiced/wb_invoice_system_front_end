import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Modal,
  Button,
  Paper,
  Grid,
  IconButton,
  Divider,
  Chip,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachmentIcon from '@mui/icons-material/Attachment';

// List of payment terms options (same as UpdateInvoiceModal)
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
  fieldContainer: {
    mb: 2,
  },
  fieldLabel: {
    fontWeight: 600,
    color: '#666',
    fontSize: '0.875rem',
    mb: 0.5,
  },
  fieldValue: {
    color: '#333',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  documentCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    p: 2,
    mb: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  glLineCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    p: 2,
    mb: 2,
    bgcolor: 'rgba(0, 82, 155, 0.02)',
  },
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'signed':
      return 'success';
    case 'pending':
    case 'to sign':
      return 'warning';
    case 'denied':
      return 'error';
    case 'rollback':
      return 'warning';
    case 'draft':
      return 'default';
    default:
      return 'primary';
  }
};

// Helper function to format currency
const formatCurrency = (amount, currency) => {
  if (!amount) return 'N/A';
  return `${currency || ''} ${parseFloat(amount).toLocaleString()}`;
};

function ViewInvoiceModal({ defaultValues, open, handleClose }) {
  console.log('defaultValues', defaultValues);

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

  // Function to load Excel data (same as UpdateInvoiceModal)
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
                description: label,
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
        suppliers: [
          {
            value: '00001',
            label: '00001 - Sample Supplier',
            description: 'Sample Supplier',
          },
        ],
        costCenters: [
          {
            value: '1000',
            label: '1000 - Sample Cost Center',
            description: 'Sample Cost Center',
          },
        ],
        glCodes: [
          {
            value: '1011',
            label: '1011 - Sample GL Code',
            description: 'Sample GL Code',
          },
        ],
        locations: [
          {
            value: '0000',
            label: '0000 - Default Location',
            description: 'Default Location',
          },
        ],
        aircraftTypes: [],
        routes: [],
      };
    }
  };

  // Load Excel data when component mounts or when modal opens
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        setDataLoading(true);
        try {
          const data = await loadExcelData();
          setExcelData(data);
        } catch (error) {
          console.error('Failed to load Excel data:', error);
        } finally {
          setDataLoading(false);
        }
      };

      loadData();
    }
  }, [open]);

  // Helper function to get value with fallback - supports both response formats
  const getValue = (field) => {
    return defaultValues?.[field] || defaultValues?.invoice?.[field] || 'N/A';
  };

  // Helper function to get descriptive label for a field
  const getDescriptiveValue = (field, value) => {
    if (!value || value === 'N/A') return 'N/A';

    switch (field) {
      case 'location':
        const location = excelData.locations.find(
          (item) => item.value === value
        );
        return location ? location.label : value;

      case 'aircraft_type':
        const aircraftType = excelData.aircraftTypes.find(
          (item) => item.value === value
        );
        return aircraftType ? aircraftType.label : value;

      case 'route':
        const route = excelData.routes.find((item) => item.value === value);
        return route ? route.label : value;

      case 'payment_terms':
        const paymentTerm = paymentTermsOptions.find(
          (option) => option.value === value
        );
        return paymentTerm ? paymentTerm.label : value;

      case 'supplier_number':
        const supplier = excelData.suppliers.find(
          (item) => item.value === value
        );
        return supplier ? supplier.label : value;

      default:
        return value;
    }
  };

  // Helper function to get GL Code description
  const getGLCodeDescription = (glCode) => {
    if (!glCode || glCode === 'N/A') return 'N/A';
    const glItem = excelData.glCodes.find((item) => item.value === glCode);
    return glItem ? glItem.label : glCode;
  };

  // Helper function to get Cost Center description
  const getCostCenterDescription = (costCenter) => {
    if (!costCenter || costCenter === 'N/A') return 'N/A';
    const ccItem = excelData.costCenters.find(
      (item) => item.value === costCenter
    );
    return ccItem ? ccItem.label : costCenter;
  };

  // Get GL Lines data - supports both response formats
  const glLines =
    defaultValues?.gl_lines || defaultValues?.invoice?.gl_lines || [];

  // Get documents - supports both response formats
  const documents =
    defaultValues?.documents || defaultValues?.invoice?.documents || [];

  // Get invoice owner info - supports both response formats
  const invoiceOwner =
    defaultValues?.invoice_owner || defaultValues?.invoice?.invoice_owner;
  const ownerName = invoiceOwner
    ? `${invoiceOwner.firstname || ''} ${invoiceOwner.lastname || ''}`.trim()
    : 'N/A';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="view-invoice-modal-title"
    >
      <Box sx={style.modal}>
        {/* Header */}
        <Box sx={style.header}>
          <Typography variant="h6" component="h2" fontWeight="500">
            Invoice Details
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={style.content}>
          {/* Basic Information Section */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Basic Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Invoice Number</Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('invoice_number')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Service Period</Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('service_period')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Supplier Number</Typography>
                  <Typography sx={style.fieldValue}>
                    {dataLoading
                      ? 'Loading...'
                      : getDescriptiveValue(
                          'supplier_number',
                          getValue('supplier_number')
                        )}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Supplier Name</Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('supplier_name')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Location</Typography>
                  <Typography sx={style.fieldValue}>
                    {dataLoading
                      ? 'Loading...'
                      : getDescriptiveValue('location', getValue('location'))}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Quantity</Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('quantity')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Aircraft Type</Typography>
                  <Typography sx={style.fieldValue}>
                    {dataLoading
                      ? 'Loading...'
                      : getDescriptiveValue(
                          'aircraft_type',
                          getValue('aircraft_type')
                        )}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Route</Typography>
                  <Typography sx={style.fieldValue}>
                    {dataLoading
                      ? 'Loading...'
                      : getDescriptiveValue('route', getValue('route'))}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Currency</Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('currency')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Total Amount</Typography>
                  <Typography
                    sx={style.fieldValue}
                    fontWeight="bold"
                    color="#00529B"
                  >
                    {formatCurrency(getValue('amount'), getValue('currency'))}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* GL Lines Section */}
          {glLines.length > 0 && (
            <Paper elevation={0} sx={style.section}>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="#00529B"
                sx={{ mb: 3 }}
              >
                GL Lines ({glLines.length})
              </Typography>

              {glLines.map((line, index) => (
                <Card key={index} sx={style.glLineCard}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight="500"
                      sx={{ mb: 2 }}
                    >
                      GL Line {index + 1}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Box sx={style.fieldContainer}>
                          <Typography sx={style.fieldLabel}>GL Code</Typography>
                          <Typography sx={style.fieldValue}>
                            {dataLoading
                              ? 'Loading...'
                              : getGLCodeDescription(line.gl_code)}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box sx={style.fieldContainer}>
                          <Typography sx={style.fieldLabel}>
                            GL Description
                          </Typography>
                          <Typography sx={style.fieldValue}>
                            {line.gl_description || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Box sx={style.fieldContainer}>
                          <Typography sx={style.fieldLabel}>
                            Cost Center
                          </Typography>
                          <Typography sx={style.fieldValue}>
                            {dataLoading
                              ? 'Loading...'
                              : getCostCenterDescription(line.cost_center)}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={2}>
                        <Box sx={style.fieldContainer}>
                          <Typography sx={style.fieldLabel}>Amount</Typography>
                          <Typography sx={style.fieldValue} fontWeight="bold">
                            {formatCurrency(
                              line.gl_amount,
                              getValue('currency')
                            )}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          )}

          {/* Payment Information Section */}
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
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Payment Terms</Typography>
                  <Typography sx={style.fieldValue}>
                    {dataLoading
                      ? 'Loading...'
                      : getDescriptiveValue(
                          'payment_terms',
                          getValue('payment_terms')
                        )}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>
                    Payment Due Date
                  </Typography>
                  <Typography sx={style.fieldValue}>
                    {getValue('payment_due_date') !== 'N/A'
                      ? new Date(
                          getValue('payment_due_date')
                        ).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Status and Tracking Section */}
          <Paper elevation={0} sx={style.section}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="#00529B"
              sx={{ mb: 3 }}
            >
              Status & Tracking
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Status</Typography>
                  <Chip
                    label={getValue('status').toUpperCase()}
                    color={getStatusColor(getValue('status'))}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 0.5, fontWeight: 600 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Created By</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <PersonIcon fontSize="small" color="action" />
                    <Typography sx={style.fieldValue}>{ownerName}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={style.fieldContainer}>
                  <Typography sx={style.fieldLabel}>Created At</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography sx={style.fieldValue}>
                      {getValue('created_at') !== 'N/A'
                        ? new Date(getValue('created_at')).toLocaleString()
                        : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Documents Section */}
          {documents.length > 0 && (
            <Paper elevation={0} sx={style.section}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3,
                }}
              >
                <AttachmentIcon sx={{ color: '#00529B' }} />
                <Typography
                  variant="subtitle1"
                  fontWeight="600"
                  color="#00529B"
                >
                  Documents ({documents.length})
                </Typography>
              </Box>

              <Stack spacing={2}>
                {documents.map((doc, index) => (
                  <Card key={index} sx={style.documentCard}>
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
                        variant="outlined"
                        size="small"
                        component="a"
                        href={doc.file_data}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: '#00529B',
                          borderColor: '#00529B',
                          '&:hover': {
                            bgcolor: 'rgba(0, 82, 155, 0.05)',
                          },
                          borderRadius: '8px',
                        }}
                      >
                        View Document
                      </Button>
                    )}
                  </Card>
                ))}
              </Stack>
            </Paper>
          )}
        </Box>

        {/* Footer */}
        <Box sx={style.footer}>
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              bgcolor: '#00529B',
              '&:hover': {
                bgcolor: '#003a6d',
              },
              borderRadius: '8px',
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ViewInvoiceModal;
