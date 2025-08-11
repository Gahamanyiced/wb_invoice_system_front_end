import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  ExpandLess,
  ExpandMore,
  Download as DownloadIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import invoiceService from '../features/invoice/invoiceService';
import DownloadInvoiceComponent from './DownloadInvoiceComponent';

const ReportingSidebar = ({ open, onClose }) => {
  // State variables
  const [selectedReport, setSelectedReport] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(true);
  const [reportFilters, setReportFilters] = useState({
    supplier_name: '',
    invoice_number: '',
    invoice_owner: '',
    created_date: '',
    status: '',
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Redux selectors
  const { allUsers } = useSelector((state) => state.user);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Define available reports - Only All Invoices Report
  const getAvailableReports = () => {
    return [
      {
        id: 'all_invoices',
        label: 'All Invoices Report',
        service: 'getAllInvoice',
      },
    ];
  };

  const availableReports = getAvailableReports();

  // Generate dynamic options from allUsers
  const userOptions =
    allUsers?.map((user) => ({
      value: user.id,
      label: `${user.firstname} ${user.lastname}`,
    })) || [];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'denied', label: 'Denied' },
    { value: 'rollback', label: 'Rollback' },
    { value: 'processing', label: 'Processing' },
    { value: 'forwarded', label: 'Forwarded' },
    { value: 'to sign', label: 'To sign' },
    { value: 'signed', label: 'Signed' },
  ];

  // Event handlers
  const handleFilterChange = (field, value) => {
    setReportFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setReportFilters({
      supplier_name: '',
      invoice_number: '',
      invoice_owner: '',
      created_date: '',
      status: '',
    });
  };

  const generateReport = async (reportConfig) => {
    if (!reportConfig) return;

    setLoading(true);
    setError(null);
    setSelectedReport(reportConfig.id);
    setShowResults(true); // Reset to show results when generating new report

    try {
      // Prepare filters - remove empty values and exclude page parameter
      const filters = Object.entries(reportFilters).reduce(
        (acc, [key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      // Remove page parameter to get all data
      delete filters.page;

      let data;

      // Call the service function - Only handling getAllInvoice
      switch (reportConfig.service) {
        case 'getAllInvoice':
          data = await invoiceService.getAllInvoice(filters);
          break;
        default:
          throw new Error(`Service function ${reportConfig.service} not found`);
      }

      setReportData(data);
    } catch (err) {
      setError(err.message || 'Failed to generate report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const getReportTitle = (reportId) => {
    const report = availableReports.find((r) => r.id === reportId);
    return report ? report.label : 'Invoice Report';
  };

  // Helper function to get report description
  const getReportDescription = (reportId) => {
    const descriptions = {
      all_invoices: 'Complete overview of all invoices in the system',
    };
    return descriptions[reportId] || 'Generate comprehensive invoice report';
  };

  // Function to close the results card
  const closeResults = () => {
    setShowResults(false);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 450,
          p: 3,
          backgroundColor: '#f8f9fa',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: '#00529B',
            fontWeight: 'bold',
          }}
        >
          <AssessmentIcon color="primary" />
          Invoice Reports
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#666' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Filters Section */}
      <Paper
        elevation={2}
        sx={{ mb: 3, p: 2, backgroundColor: 'white', borderRadius: 2 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            mb: filtersExpanded ? 2 : 0,
          }}
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h6"
            color="primary"
            sx={{ flexGrow: 1, fontWeight: '600' }}
          >
            Report Filters
          </Typography>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              clearFilters();
            }}
            sx={{ mr: 1, textTransform: 'none' }}
          >
            Clear All
          </Button>
          {filtersExpanded ? (
            <ExpandLess color="primary" />
          ) : (
            <ExpandMore color="primary" />
          )}
        </Box>

        <Collapse in={filtersExpanded}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Year (Optional)"
              type="number"
              value={reportFilters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              size="small"
              fullWidth
              placeholder="Enter year to filter..."
              sx={{ backgroundColor: 'white' }}
            />

            <TextField
              label="Supplier Name"
              value={reportFilters.supplier_name}
              onChange={(e) =>
                handleFilterChange('supplier_name', e.target.value)
              }
              size="small"
              fullWidth
              placeholder="Search by supplier name..."
              sx={{ backgroundColor: 'white' }}
            />

            <TextField
              label="Invoice Number"
              value={reportFilters.invoice_number}
              onChange={(e) =>
                handleFilterChange('invoice_number', e.target.value)
              }
              size="small"
              fullWidth
              placeholder="Search by invoice number..."
              sx={{ backgroundColor: 'white' }}
            />

            <Autocomplete
              options={userOptions}
              getOptionLabel={(option) => option.label || ''}
              value={
                userOptions.find(
                  (option) => option.value === reportFilters.invoice_owner
                ) || null
              }
              onChange={(event, newValue) =>
                handleFilterChange(
                  'invoice_owner',
                  newValue ? newValue.value : ''
                )
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Invoice Owner"
                  size="small"
                  sx={{ backgroundColor: 'white' }}
                  placeholder="Select invoice owner..."
                />
              )}
              size="small"
            />

            <TextField
              label="Created Date"
              type="date"
              value={reportFilters.created_date}
              onChange={(e) =>
                handleFilterChange('created_date', e.target.value)
              }
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              sx={{ backgroundColor: 'white' }}
            />

            <Autocomplete
              options={statusOptions}
              getOptionLabel={(option) => option.label || ''}
              value={
                statusOptions.find(
                  (option) => option.value === reportFilters.status
                ) || null
              }
              onChange={(event, newValue) =>
                handleFilterChange('status', newValue ? newValue.value : '')
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Status"
                  size="small"
                  sx={{ backgroundColor: 'white' }}
                  placeholder="Select status..."
                />
              )}
              size="small"
            />
          </Box>
        </Collapse>
      </Paper>

      {/* Available Reports */}
      <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: '600' }}>
        Available Reports
      </Typography>

      <Box sx={{ mb: 3, maxHeight: '400px', overflowY: 'auto' }}>
        {availableReports.map((report) => (
          <Paper
            key={report.id}
            elevation={selectedReport === report.id ? 3 : 1}
            sx={{
              mb: 2,
              backgroundColor:
                selectedReport === report.id ? '#e3f2fd' : 'white',
              border:
                selectedReport === report.id
                  ? '2px solid #00529B'
                  : '1px solid #e0e0e0',
              borderRadius: 2,
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemButton
              onClick={() => generateReport(report)}
              disabled={loading}
              sx={{
                p: 2,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor:
                    selectedReport === report.id ? '#e3f2fd' : '#f5f5f5',
                },
              }}
            >
              <ListItemIcon>
                <AssessmentIcon
                  color={selectedReport === report.id ? 'primary' : 'action'}
                  sx={{ fontSize: '28px' }}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: '600',
                      color: selectedReport === report.id ? '#00529B' : '#333',
                    }}
                  >
                    {report.label}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    sx={{
                      color: selectedReport === report.id ? '#1565c0' : '#666',
                      mt: 0.5,
                    }}
                  >
                    {getReportDescription(report.id)}
                  </Typography>
                }
              />
            </ListItemButton>
          </Paper>
        ))}
      </Box>

      {/* Loading State */}
      {loading && (
        <Paper
          elevation={2}
          sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, mb: 3 }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#00529B' }}>
              Generating Report...
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Please wait while we compile your data
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: '600' }}>
            Error Generating Report
          </Typography>
          {error}
        </Alert>
      )}

      {/* Report Results */}
      {reportData &&
        !loading &&
        showResults &&
        (reportData.results?.length > 0 || reportData.length > 0) && (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              backgroundColor: 'white',
              borderRadius: 2,
              border: '2px solid #4caf50',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={closeResults}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: '#666',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <Typography
              variant="h6"
              sx={{ mb: 2, color: '#2e7d32', fontWeight: '600', pr: 4 }}
            >
              ✅ Report Generated Successfully
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Chip
                label={`${
                  reportData.results?.length || reportData.length || 0
                } records found`}
                color="success"
                sx={{ mr: 1, mb: 1, fontWeight: '600' }}
              />
              <Chip
                label={getReportTitle(selectedReport)}
                color="primary"
                sx={{ mb: 1, fontWeight: '600' }}
              />
            </Box>

            <Box
              sx={{ mb: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontWeight: '500' }}
              >
                📊 Report Summary:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Total Records:{' '}
                {reportData.results?.length || reportData.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Generated: {new Date().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Data includes all matching records without pagination limits
              </Typography>
            </Box>

            {/* Download Options */}
            <DownloadInvoiceComponent
              invoices={{
                results: reportData.results || reportData,
                count: reportData.results?.length || reportData.length || 0,
              }}
              title={getReportTitle(selectedReport)}
            />
          </Paper>
        )}

      {/* No Data State */}
      {reportData &&
        !loading &&
        (!reportData.results || reportData.results.length === 0) && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: '600' }}>
              No Data Found
            </Typography>
            No invoices match your selected filters and report criteria. Try
            adjusting your filters or selecting a different report type.
          </Alert>
        )}

      {/* Footer Info */}
      <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center' }}
        >
          💡 Reports include all data without pagination limits
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}
        >
          Use filters to narrow down your results
        </Typography>
      </Box>
    </Drawer>
  );
};

export default ReportingSidebar;
