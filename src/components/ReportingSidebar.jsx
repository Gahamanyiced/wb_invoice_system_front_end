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
  Tab,
  Tabs,
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
  AccountBalanceWallet as WalletIcon,
  ReceiptOutlined as InvoiceIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import invoiceService from '../features/invoice/invoiceService';
import pettyCashService from '../features/pettyCash/pettyCashService';
import DownloadInvoiceComponent from './DownloadInvoiceComponent';
import PETTY_CASH_CURRENCIES from '../constants/pettyCashCurrencies';

// ── Petty Cash CSV Download ───────────────────────────────────────────────────
const PettyCashReportDownload = ({ data, summary, title }) => {
  const handleDownloadCSV = () => {
    if (!data || !data.length) return;

    const fmt = (val) => (val == null ? '' : val);
    const rows = [];

    // ── Section 1: Report header & summary ─────────────────────────────────
    rows.push(['RWANDAIR PETTY CASH REPORT']);
    rows.push(['Generated', new Date().toLocaleString()]);
    rows.push([]);
    rows.push(['── SUMMARY ──']);
    rows.push(['Total Records', fmt(summary?.total_records)]);
    rows.push(['Total Issued', fmt(summary?.total_issued)]);
    rows.push(['Total Spent', fmt(summary?.total_spent)]);
    rows.push(['Total Remaining', fmt(summary?.total_remaining)]);
    rows.push([]);

    // ── Section 2: Per-issuance block + expenses ────────────────────────────
    data.forEach((record, index) => {
      rows.push([`── ISSUANCE #${index + 1} ──`]);
      rows.push(['ID', fmt(record.id)]);
      rows.push(['Station', fmt(record.station)]);
      rows.push(['Period', fmt(record.period)]);
      rows.push(['Currency', fmt(record.currency)]);
      rows.push(['Status', fmt(record.status)]);
      rows.push(['Issue Date', fmt(record.issue_date)]);
      rows.push(['Is Replenished', record.is_replenished ? 'Yes' : 'No']);
      rows.push(['Is Acknowledged', record.is_acknowledged ? 'Yes' : 'No']);
      rows.push([
        'Acknowledged At',
        record.acknowledged_at
          ? new Date(record.acknowledged_at).toLocaleString()
          : '',
      ]);
      rows.push(['Notes', fmt(record.notes)]);
      rows.push([]);

      // Holder
      rows.push(['Holder']);
      rows.push(['  Name', fmt(record.holder?.name)]);
      rows.push(['  Email', fmt(record.holder?.email)]);
      rows.push(['  Station', fmt(record.holder?.station)]);
      rows.push(['  Department', fmt(record.holder?.department)]);
      rows.push([]);

      // Issued By
      rows.push(['Issued By']);
      rows.push(['  Name', fmt(record.issued_by?.name)]);
      rows.push(['  Email', fmt(record.issued_by?.email)]);
      rows.push([]);

      // Expense Creator
      rows.push(['Expense Creator']);
      rows.push(['  Name', fmt(record.expense_creator?.name)]);
      rows.push(['  Email', fmt(record.expense_creator?.email)]);
      rows.push([]);

      // Financial summary
      rows.push(['Financial Summary']);
      rows.push(['  Opening Balance', fmt(record.opening_balance)]);
      rows.push(['  Amount Issued', fmt(record.amount_issued)]);
      rows.push(['  Total Available', fmt(record.total_available)]);
      rows.push(['  Total Spent', fmt(record.total_spent)]);
      rows.push(['  Remaining Amount', fmt(record.remaining_amount)]);
      rows.push(['  Expense Count', fmt(record.expense_count)]);
      rows.push([]);

      // Expenses table
      if (record.expenses && record.expenses.length > 0) {
        rows.push(['Expenses']);
        rows.push([
          '  Expense ID',
          'Date',
          'Description',
          'Amount (Cr)',
          'Balance',
          'Currency',
          'Status',
        ]);
        record.expenses.forEach((exp) => {
          rows.push([
            `  ${fmt(exp.id)}`,
            fmt(exp.date),
            fmt(exp.description),
            fmt(exp.cr),
            fmt(exp.balance),
            fmt(exp.currency),
            fmt(exp.status),
          ]);
        });
      }

      // Separator between records
      rows.push([]);
      rows.push(['─'.repeat(60)]);
      rows.push([]);
    });

    // ── Serialize to CSV ────────────────────────────────────────────────────
    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            const s = String(cell ?? '');
            return s.includes(',') || s.includes('"') || s.includes('\n')
              ? `"${s.replace(/"/g, '""')}"`
              : s;
          })
          .join(','),
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_${
      new Date().toISOString().split('T')[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="contained"
      color="success"
      fullWidth
      startIcon={<DownloadIcon />}
      onClick={handleDownloadCSV}
      disabled={!data || !data.length}
    >
      Download CSV
    </Button>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ReportingSidebar = ({ open, onClose }) => {
  // ── Tab ──
  const [activeTab, setActiveTab] = useState(0);

  // ── Invoice state (unchanged from original) ──
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

  // ── Petty Cash state ──
  const [pcReportData, setPcReportData] = useState(null);
  const [pcSummary, setPcSummary] = useState(null);
  const [pcLoading, setPcLoading] = useState(false);
  const [pcError, setPcError] = useState(null);
  const [pcShowResults, setPcShowResults] = useState(true);
  const [pcFiltersExpanded, setPcFiltersExpanded] = useState(false);
  const [pcFilters, setPcFilters] = useState({
    station: '',
    status: '',
    date_from: '',
    date_to: '',
    petty_cash_id: '',
    currency: '',
    holder_id: '',
    is_replenished: '',
  });

  // ── Redux ──
  const { allUsers } = useSelector((state) => state.user);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ── Shared options ──
  const userOptions =
    allUsers?.map((u) => ({
      value: u.id,
      label: `${u.firstname} ${u.lastname}`,
    })) || [];

  // ── Invoice options & handlers (identical to original) ──
  const getAvailableReports = () => [
    {
      id: 'all_invoices',
      label: 'All Invoices Report',
      service: 'getAllInvoice',
    },
  ];
  const availableReports = getAvailableReports();

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

  const handleFilterChange = (field, value) => {
    setReportFilters((prev) => ({ ...prev, [field]: value }));
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
    setShowResults(true);
    try {
      const filters = Object.entries(reportFilters).reduce(
        (acc, [key, value]) => {
          if (value !== '' && value !== null && value !== undefined)
            acc[key] = value;
          return acc;
        },
        {},
      );
      delete filters.page;
      let data;
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

  const getReportDescription = (reportId) => {
    const descriptions = {
      all_invoices: 'Complete overview of all invoices in the system',
    };
    return descriptions[reportId] || 'Generate comprehensive invoice report';
  };

  const closeResults = () => setShowResults(false);

  // ── Petty Cash options & handlers ──
  const pcStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'pending_acknowledgment', label: 'Pending Acknowledgment' },
    { value: 'closed', label: 'Closed' },
    { value: 'rollback', label: 'Rollback' },
  ];

  const replenishedOptions = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' },
  ];

  const handlePcFilterChange = (field, value) => {
    setPcFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearPcFilters = () => {
    setPcFilters({
      station: '',
      status: '',
      date_from: '',
      date_to: '',
      petty_cash_id: '',
      currency: '',
      holder_id: '',
      is_replenished: '',
    });
    setPcSummary(null);
    setPcReportData(null);
  };

  const generatePcReport = async () => {
    setPcLoading(true);
    setPcError(null);
    setPcShowResults(true);
    try {
      const filters = Object.entries(pcFilters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined)
          acc[key] = value;
        return acc;
      }, {});
      const data = await pettyCashService.getPettyCashReport(filters);
      // Response shape: { summary: {...}, results: [...] }
      setPcSummary(data.summary ?? null);
      setPcReportData(Array.isArray(data) ? data : (data.results ?? []));
    } catch (err) {
      setPcError(err.message || 'Failed to generate petty cash report');
      setPcReportData(null);
      setPcSummary(null);
    } finally {
      setPcLoading(false);
    }
  };

  const pcRecordCount = Array.isArray(pcReportData) ? pcReportData.length : 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 480,
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
          mb: 2,
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
          Reports
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#666' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          mb: 2,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
          '& .Mui-selected': { color: '#00529B' },
          '& .MuiTabs-indicator': { backgroundColor: '#00529B' },
        }}
      >
        <Tab
          icon={<InvoiceIcon fontSize="small" />}
          iconPosition="start"
          label="Invoice"
        />
        <Tab
          icon={<WalletIcon fontSize="small" />}
          iconPosition="start"
          label="Petty Cash"
        />
      </Tabs>

      <Divider sx={{ mb: 3 }} />

      {/* ══════════════════════ INVOICE TAB ══════════════════════ */}
      {activeTab === 0 && (
        <Box>
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
                      (option) => option.value === reportFilters.invoice_owner,
                    ) || null
                  }
                  onChange={(event, newValue) =>
                    handleFilterChange(
                      'invoice_owner',
                      newValue ? newValue.value : '',
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
                      (option) => option.value === reportFilters.status,
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
          <Typography
            variant="h6"
            sx={{ mb: 2, color: '#333', fontWeight: '600' }}
          >
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
                      color={
                        selectedReport === report.id ? 'primary' : 'action'
                      }
                      sx={{ fontSize: '28px' }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: '600',
                          color:
                            selectedReport === report.id ? '#00529B' : '#333',
                        }}
                      >
                        {report.label}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            selectedReport === report.id ? '#1565c0' : '#666',
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

          {/* Loading */}
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

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: '600' }}>
                Error Generating Report
              </Typography>
              {error}
            </Alert>
          )}

          {/* Results */}
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
                <IconButton
                  onClick={closeResults}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#666',
                    '&:hover': { backgroundColor: '#f5f5f5' },
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
                  sx={{
                    mb: 2,
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 1,
                  }}
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
                    • Data includes all matching records without pagination
                    limits
                  </Typography>
                </Box>

                <DownloadInvoiceComponent
                  invoices={{
                    results: reportData.results || reportData,
                    count: reportData.results?.length || reportData.length || 0,
                  }}
                  title={getReportTitle(selectedReport)}
                />
              </Paper>
            )}

          {/* No Data */}
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
        </Box>
      )}

      {/* ══════════════════════ PETTY CASH TAB ══════════════════════ */}
      {activeTab === 1 && (
        <Box>
          {/* Petty Cash Filters */}
          <Paper
            elevation={2}
            sx={{ mb: 3, p: 2, backgroundColor: 'white', borderRadius: 2 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                mb: pcFiltersExpanded ? 2 : 0,
              }}
              onClick={() => setPcFiltersExpanded((p) => !p)}
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
                  clearPcFilters();
                }}
                sx={{ mr: 1, textTransform: 'none' }}
              >
                Clear All
              </Button>
              {pcFiltersExpanded ? (
                <ExpandLess color="primary" />
              ) : (
                <ExpandMore color="primary" />
              )}
            </Box>

            <Collapse in={pcFiltersExpanded}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Station */}
                <TextField
                  label="Station"
                  value={pcFilters.station}
                  onChange={(e) =>
                    handlePcFilterChange('station', e.target.value)
                  }
                  size="small"
                  fullWidth
                  placeholder="e.g. NBO, KGL"
                  sx={{ backgroundColor: 'white' }}
                />

                {/* Status */}
                <Autocomplete
                  options={pcStatusOptions}
                  getOptionLabel={(o) => o.label || ''}
                  value={
                    pcStatusOptions.find((o) => o.value === pcFilters.status) ||
                    null
                  }
                  onChange={(_, v) =>
                    handlePcFilterChange('status', v ? v.value : '')
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

                {/* Date From */}
                <TextField
                  label="Date From"
                  type="date"
                  value={pcFilters.date_from}
                  onChange={(e) =>
                    handlePcFilterChange('date_from', e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  fullWidth
                  sx={{ backgroundColor: 'white' }}
                />

                {/* Date To */}
                <TextField
                  label="Date To"
                  type="date"
                  value={pcFilters.date_to}
                  onChange={(e) =>
                    handlePcFilterChange('date_to', e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  fullWidth
                  sx={{ backgroundColor: 'white' }}
                />

                {/* Petty Cash ID */}
                <TextField
                  label="Petty Cash ID"
                  type="number"
                  value={pcFilters.petty_cash_id}
                  onChange={(e) =>
                    handlePcFilterChange('petty_cash_id', e.target.value)
                  }
                  size="small"
                  fullWidth
                  sx={{ backgroundColor: 'white' }}
                />

                {/* Currency */}
                <Autocomplete
                  options={PETTY_CASH_CURRENCIES}
                  getOptionLabel={(o) => `${o.code} – ${o.name}`}
                  value={
                    PETTY_CASH_CURRENCIES.find(
                      (c) => c.code === pcFilters.currency,
                    ) || null
                  }
                  onChange={(_, v) =>
                    handlePcFilterChange('currency', v ? v.code : '')
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Currency"
                      size="small"
                      sx={{ backgroundColor: 'white' }}
                      placeholder="Select currency..."
                    />
                  )}
                  size="small"
                />

                {/* Holder */}
                <Autocomplete
                  options={userOptions}
                  getOptionLabel={(o) => o.label || ''}
                  value={
                    userOptions.find((o) => o.value === pcFilters.holder_id) ||
                    null
                  }
                  onChange={(_, v) =>
                    handlePcFilterChange('holder_id', v ? v.value : '')
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Custodian (Holder)"
                      size="small"
                      sx={{ backgroundColor: 'white' }}
                      placeholder="Select custodian..."
                    />
                  )}
                  size="small"
                />

                {/* Is Replenished */}
                <Autocomplete
                  options={replenishedOptions}
                  getOptionLabel={(o) => o.label || ''}
                  value={
                    replenishedOptions.find(
                      (o) => o.value === pcFilters.is_replenished,
                    ) || null
                  }
                  onChange={(_, v) =>
                    handlePcFilterChange('is_replenished', v ? v.value : '')
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Is Replenished"
                      size="small"
                      sx={{ backgroundColor: 'white' }}
                      placeholder="Select..."
                    />
                  )}
                  size="small"
                />
              </Box>
            </Collapse>
          </Paper>

          {/* Available Reports */}
          <Typography
            variant="h6"
            sx={{ mb: 2, color: '#333', fontWeight: '600' }}
          >
            Available Reports
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Paper
              elevation={pcReportData !== null ? 3 : 1}
              sx={{
                mb: 2,
                backgroundColor: pcReportData !== null ? '#e3f2fd' : 'white',
                border:
                  pcReportData !== null
                    ? '2px solid #00529B'
                    : '1px solid #e0e0e0',
                borderRadius: 2,
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemButton
                onClick={generatePcReport}
                disabled={pcLoading}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor:
                      pcReportData !== null ? '#e3f2fd' : '#f5f5f5',
                  },
                }}
              >
                <ListItemIcon>
                  <WalletIcon
                    color={pcReportData !== null ? 'primary' : 'action'}
                    sx={{ fontSize: '28px' }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: '600',
                        color: pcReportData !== null ? '#00529B' : '#333',
                      }}
                    >
                      Petty Cash Report
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      sx={{
                        color: pcReportData !== null ? '#1565c0' : '#666',
                        mt: 0.5,
                      }}
                    >
                      Overview of petty cash issuances with optional filters
                    </Typography>
                  }
                />
              </ListItemButton>
            </Paper>
          </Box>

          {/* Loading */}
          {pcLoading && (
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

          {/* Error */}
          {pcError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: '600' }}>
                Error Generating Report
              </Typography>
              {pcError}
            </Alert>
          )}

          {/* Results */}
          {pcReportData !== null &&
            !pcLoading &&
            pcShowResults &&
            pcRecordCount > 0 && (
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
                <IconButton
                  onClick={() => setPcShowResults(false)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#666',
                    '&:hover': { backgroundColor: '#f5f5f5' },
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
                    label={`${pcSummary?.total_records ?? pcRecordCount} records found`}
                    color="success"
                    sx={{ mr: 1, mb: 1, fontWeight: '600' }}
                  />
                  <Chip
                    label="Petty Cash Report"
                    color="primary"
                    sx={{ mb: 1, fontWeight: '600' }}
                  />
                </Box>

                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1, fontWeight: '500' }}
                  >
                    📊 Report Summary:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Total Records: {pcSummary?.total_records ?? pcRecordCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Total Issued:{' '}
                    {pcSummary?.total_issued?.toLocaleString() ?? '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Total Spent:{' '}
                    {pcSummary?.total_spent?.toLocaleString() ?? '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Total Remaining:{' '}
                    <Box
                      component="span"
                      sx={{
                        color:
                          (pcSummary?.total_remaining ?? 0) < 0
                            ? '#d32f2f'
                            : '#2e7d32',
                        fontWeight: 600,
                      }}
                    >
                      {pcSummary?.total_remaining?.toLocaleString() ?? '—'}
                    </Box>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Generated: {new Date().toLocaleString()}
                  </Typography>
                </Box>

                <PettyCashReportDownload
                  data={pcReportData}
                  summary={pcSummary}
                  title="Petty_Cash_Report"
                />
              </Paper>
            )}

          {/* No Data */}
          {pcReportData !== null && !pcLoading && pcRecordCount === 0 && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: '600' }}>
                No Data Found
              </Typography>
              No petty cash records match your selected filters. Try adjusting
              your filters.
            </Alert>
          )}
        </Box>
      )}

      {/* Footer */}
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
