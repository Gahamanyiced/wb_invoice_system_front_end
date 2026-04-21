import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
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
import EnhancedDownloadComponent from './EnhancedDownloadComponent';
import useCOAData from '../hooks/useCOAData';
import TuneIcon from '@mui/icons-material/Tune';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// ── Petty Cash CSV Download — Ledger Format ───────────────────────────────────
const PettyCashReportDownload = ({ data, summary, title }) => {
  const handleDownloadCSV = () => {
    if (!data || !data.length) return;

    const fmt = (val) => (val == null ? '' : val);
    const rows = [];

    // ── Group records by station + period + custodian + currency ─────────────
    const groupKey = (r) =>
      [
        r.station ?? '',
        r.period ?? '',
        r.holder?.name ?? '',
        r.currency ?? '',
      ].join('|');

    const groups = [];
    const seen = new Map();

    data.forEach((record) => {
      const key = groupKey(record);
      if (!seen.has(key)) {
        seen.set(key, groups.length);
        groups.push({ key, records: [record] });
      } else {
        groups[seen.get(key)].records.push(record);
      }
    });

    // ── Render each group ─────────────────────────────────────────────────────
    groups.forEach((group, groupIndex) => {
      if (groupIndex > 0) {
        rows.push(['', '', '', '', '']);
        rows.push(['', '', '', '', '']);
      }

      const first = group.records[0];

      // ── Shared header block — printed ONCE per group ──────────────────────
      rows.push(['RWANDAIR PETTY CASH', '', '', '', '']);
      rows.push([`STATION : ${fmt(first.station)}`, '', '', '', '']);
      rows.push([`PERIOD: ${fmt(first.period)}`, '', '', '', '']);
      rows.push([`CUSTODIAN: ${fmt(first.holder?.name)}`, '', '', '', '']);

      // issued_by: deduplicate unique names across records in this group
      const issuedByNames = [
        ...new Set(group.records.map((r) => r.issued_by?.name).filter(Boolean)),
      ];
      if (issuedByNames.length) {
        rows.push([`ISSUED BY: ${issuedByNames.join(', ')}`, '', '', '', '']);
      }

      rows.push([`CURRENCY: ${fmt(first.currency)}`, '', '', '', '']);
      rows.push(['', '', '', '', '']);

      // ── One ledger section per record inside the group ────────────────────
      group.records.forEach((record, recordIndex) => {
        if (recordIndex > 0) {
          rows.push(['', '', '', '', '']);
        }

        // Column headers
        rows.push(['', 'Description', 'Dr', 'Cr', 'BALANCE']);

        // Opening balance
        rows.push([
          'DATE',
          'Opening balance',
          fmt(record.opening_balance ?? 0),
          '',
          '',
        ]);

        // Replenishment
        rows.push([
          fmt(record.issue_date),
          'Replenishment',
          fmt(record.replenishment ?? 0),
          '',
          '',
        ]);

        // Total available
        rows.push(['', '', '', '', fmt(record.total_available ?? 0)]);

        // Expense rows
        const expenses = record.expenses || [];
        expenses.forEach((exp) => {
          rows.push([
            fmt(exp.date),
            fmt(exp.description),
            '',
            fmt(exp.cr),
            fmt(exp.balance),
          ]);
        });

        // Closing balance
        rows.push([
          '',
          'Closing balance',
          '',
          '',
          fmt(record.closing_balance ?? 0),
        ]);
      });
    });

    // ── Summary block ─────────────────────────────────────────────────────────
    if (summary) {
      rows.push(['', '', '', '', '']);
      rows.push(['', '', '', '', '']);
      rows.push(['REPORT SUMMARY', '', '', '', '']);
      rows.push(['Total Records', '', '', '', fmt(summary.total_records)]);
      rows.push(['Total Issued', '', '', '', fmt(summary.total_issued)]);
      rows.push(['Total Spent', '', '', '', fmt(summary.total_spent)]);
      rows.push(['Total Remaining', '', '', '', fmt(summary.total_remaining)]);
      rows.push([`Generated: ${new Date().toLocaleString()}`, '', '', '', '']);
    }

    // ── Serialize to CSV ──────────────────────────────────────────────────────
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
      .join('\r\n');

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

// ── Shared field style — compact, consistent with FilterPanel ────────────────
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '7px',
    fontSize: '12.5px',
    backgroundColor: '#fff',
    '& fieldset': { borderColor: '#e0e8f0' },
    '&:hover fieldset': { borderColor: '#90caf9' },
    '&.Mui-focused fieldset': { borderColor: '#00529B', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { fontSize: '12.5px' },
  '& input::placeholder': { fontSize: '12px', color: '#aaa' },
};

// ── Main Component ────────────────────────────────────────────────────────────
const ReportingSidebar = ({ open, onClose, defaultTab = 0 }) => {
  // ── Invoice state ──
  const [selectedReport, setSelectedReport] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(true);
  const [reportFilters, setReportFilters] = useState({
    supplier_id: '',
    invoice_number: '',
    invoice_owner: '',
    created_date: '',
    status: '',
    year: '',
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
    date_from: '',
    date_to: '',
  });

  const { allUsers } = useSelector((state) => state.user);
  const { excelData: coaData } = useCOAData({ enabled: open });

  const userOptions =
    allUsers?.map((u) => ({
      value: u.id,
      label: `${u.firstname} ${u.lastname}`,
    })) || [];

  // ── Invoice options & handlers ──
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
      supplier_id: '',
      invoice_number: '',
      invoice_owner: '',
      created_date: '',
      status: '',
      year: '',
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

  // ── Petty Cash handlers ──
  const handlePcFilterChange = (field, value) => {
    setPcFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearPcFilters = () => {
    setPcFilters({
      station: '',
      date_from: '',
      date_to: '',
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

      {/* Module context chip — shows which module's reports are open */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: '20px',
            backgroundColor: '#e3f2fd',
            border: '1px solid #90caf9',
          }}
        >
          {defaultTab === 0 ? (
            <InvoiceIcon sx={{ fontSize: 14, color: '#1565c0' }} />
          ) : (
            <WalletIcon sx={{ fontSize: 14, color: '#1565c0' }} />
          )}
          <Typography
            sx={{ fontSize: '12px', fontWeight: 700, color: '#1565c0' }}
          >
            {defaultTab === 0 ? 'Invoice Reports' : 'Petty Cash Reports'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ══════════════════════ INVOICE TAB ══════════════════════ */}
      {defaultTab === 0 && (
        <Box>
          {/* ── Compact filter bar ───────────────────────────────── */}
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              backgroundColor: '#fff',
              border: '1px solid #e0e8f0',
              borderRadius: '10px',
            }}
          >
            {/* Header row */}
            <Box
              sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}
            >
              <TuneIcon sx={{ fontSize: 15, color: '#00529B' }} />
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#00529B',
                  flex: 1,
                }}
              >
                Filters
                {Object.values(reportFilters).some((v) => v !== '') && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      px: 0.75,
                      py: 0.2,
                      bgcolor: '#00529B',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {
                      Object.values(reportFilters).filter((v) => v !== '')
                        .length
                    }
                  </Box>
                )}
              </Typography>
              {Object.values(reportFilters).some((v) => v !== '') && (
                <Button
                  size="small"
                  startIcon={<RestartAltIcon sx={{ fontSize: 13 }} />}
                  onClick={clearFilters}
                  sx={{
                    fontSize: '11px',
                    textTransform: 'none',
                    color: '#d32f2f',
                    py: 0.3,
                    px: 1,
                    minWidth: 0,
                    borderRadius: '6px',
                    '&:hover': { bgcolor: '#ffebee' },
                  }}
                >
                  Clear
                </Button>
              )}
              <IconButton
                size="small"
                onClick={() => setFiltersExpanded((p) => !p)}
                sx={{ p: 0.5 }}
              >
                {filtersExpanded ? (
                  <ExpandLess sx={{ fontSize: 18, color: '#00529B' }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 18, color: '#00529B' }} />
                )}
              </IconButton>
            </Box>

            {/* Always-visible quick chips for active filters */}
            {!filtersExpanded &&
              Object.entries(reportFilters).some(([, v]) => v !== '') && (
                <Box
                  sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}
                >
                  {Object.entries(reportFilters)
                    .filter(([, v]) => v !== '')
                    .map(([k, v]) => (
                      <Chip
                        key={k}
                        label={`${k.replace(/_/g, ' ')}: ${v}`}
                        size="small"
                        onDelete={() => handleFilterChange(k, '')}
                        sx={{
                          fontSize: '10px',
                          height: '20px',
                          bgcolor: '#e3f2fd',
                          color: '#1565c0',
                        }}
                      />
                    ))}
                </Box>
              )}

            <Collapse in={filtersExpanded}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  pt: 0.5,
                }}
              >
                {/* Year */}
                <TextField
                  label="Year"
                  type="number"
                  value={reportFilters.year || ''}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="e.g. 2026"
                  sx={fieldSx}
                />

                {/* Supplier — dropdown from COA DB */}
                <Autocomplete
                  options={coaData.suppliers}
                  getOptionLabel={(opt) => opt.label || ''}
                  value={
                    coaData.suppliers.find(
                      (s) => String(s.id) === String(reportFilters.supplier_id),
                    ) || null
                  }
                  onChange={(_, v) =>
                    handleFilterChange('supplier_id', v ? String(v.id) : '')
                  }
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Supplier"
                      size="small"
                      sx={fieldSx}
                      placeholder="Search supplier..."
                    />
                  )}
                  slotProps={{
                    popper: {
                      sx: {
                        '& .MuiAutocomplete-listbox': { fontSize: '12.5px' },
                      },
                    },
                  }}
                />

                {/* Invoice Number */}
                <TextField
                  label="Invoice Number"
                  value={reportFilters.invoice_number}
                  onChange={(e) =>
                    handleFilterChange('invoice_number', e.target.value)
                  }
                  size="small"
                  fullWidth
                  placeholder="e.g. INV-001"
                  sx={fieldSx}
                />

                {/* Invoice Owner */}
                <Autocomplete
                  options={userOptions}
                  getOptionLabel={(opt) => opt.label || ''}
                  value={
                    userOptions.find(
                      (o) => o.value === reportFilters.invoice_owner,
                    ) || null
                  }
                  onChange={(_, v) =>
                    handleFilterChange('invoice_owner', v ? v.value : '')
                  }
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Invoice Owner"
                      size="small"
                      sx={fieldSx}
                      placeholder="Select owner..."
                    />
                  )}
                />

                {/* Created Date */}
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
                  sx={fieldSx}
                />

                {/* Status */}
                <Autocomplete
                  options={statusOptions}
                  getOptionLabel={(opt) => opt.label || ''}
                  value={
                    statusOptions.find(
                      (o) => o.value === reportFilters.status,
                    ) || null
                  }
                  onChange={(_, v) =>
                    handleFilterChange('status', v ? v.value : '')
                  }
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Status"
                      size="small"
                      sx={fieldSx}
                      placeholder="Select status..."
                    />
                  )}
                />
              </Box>
            </Collapse>
          </Box>

          <Typography
            variant="subtitle2"
            sx={{
              mb: 1.5,
              color: '#555',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '11px',
            }}
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

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: '600' }}>
                Error Generating Report
              </Typography>
              {error}
            </Alert>
          )}

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

                {/* ── Download button — right-aligned, same as Invoice page ── */}
                <Box display="flex" justifyContent="flex-end">
                  <EnhancedDownloadComponent
                    invoices={{
                      results: reportData.results || reportData,
                      count:
                        reportData.results?.length || reportData.length || 0,
                    }}
                    title={getReportTitle(selectedReport)}
                  />
                </Box>
              </Paper>
            )}

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
      {defaultTab === 1 && (
        <Box>
          {/* ── Filter panel — same compact design as invoice tab ── */}
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              backgroundColor: '#fff',
              border: '1px solid #e0e8f0',
              borderRadius: '10px',
            }}
          >
            {/* Header row */}
            <Box
              sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}
            >
              <TuneIcon sx={{ fontSize: 15, color: '#00529B' }} />
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#00529B',
                  flex: 1,
                }}
              >
                Filters
                {Object.values(pcFilters).some((v) => v !== '') && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      px: 0.75,
                      py: 0.2,
                      bgcolor: '#00529B',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {Object.values(pcFilters).filter((v) => v !== '').length}
                  </Box>
                )}
              </Typography>
              {Object.values(pcFilters).some((v) => v !== '') && (
                <Button
                  size="small"
                  startIcon={<RestartAltIcon sx={{ fontSize: 13 }} />}
                  onClick={clearPcFilters}
                  sx={{
                    fontSize: '11px',
                    textTransform: 'none',
                    color: '#d32f2f',
                    py: 0.3,
                    px: 1,
                    minWidth: 0,
                    borderRadius: '6px',
                    '&:hover': { bgcolor: '#ffebee' },
                  }}
                >
                  Clear
                </Button>
              )}
              <IconButton
                size="small"
                onClick={() => setPcFiltersExpanded((p) => !p)}
                sx={{ p: 0.5 }}
              >
                {pcFiltersExpanded ? (
                  <ExpandLess sx={{ fontSize: 18, color: '#00529B' }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 18, color: '#00529B' }} />
                )}
              </IconButton>
            </Box>

            {/* Active filter chips when collapsed */}
            {!pcFiltersExpanded &&
              Object.entries(pcFilters).some(([, v]) => v !== '') && (
                <Box
                  sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}
                >
                  {Object.entries(pcFilters)
                    .filter(([, v]) => v !== '')
                    .map(([k, v]) => (
                      <Chip
                        key={k}
                        label={`${k.replace(/_/g, ' ')}: ${v}`}
                        size="small"
                        onDelete={() => handlePcFilterChange(k, '')}
                        sx={{
                          fontSize: '10px',
                          height: '20px',
                          bgcolor: '#e3f2fd',
                          color: '#1565c0',
                        }}
                      />
                    ))}
                </Box>
              )}

            <Collapse in={pcFiltersExpanded}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  pt: 0.5,
                }}
              >
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
                  sx={fieldSx}
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
                  sx={fieldSx}
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
                  sx={fieldSx}
                />
              </Box>
            </Collapse>
          </Box>

          {/* ── Available Reports heading + card — same as invoice ── */}
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1.5,
              color: '#555',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '11px',
            }}
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

          {/* ── Loading — identical to invoice ── */}
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

          {/* ── Error — identical to invoice ── */}
          {pcError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: '600' }}>
                Error Generating Report
              </Typography>
              {pcError}
            </Alert>
          )}

          {/* ── Results paper — same structure as invoice, PC-specific summary fields ── */}
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

                {/* Summary box — same '#f8f9fa' bg, same '📊 Report Summary:' label */}
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
                  <Typography variant="body2" color="text.secondary">
                    • Data includes all matching records without pagination
                    limits
                  </Typography>
                </Box>

                {/* Download — right-aligned, matching invoice layout */}
                <Box display="flex" justifyContent="flex-end">
                  <PettyCashReportDownload
                    data={pcReportData}
                    summary={pcSummary}
                    title="Petty_Cash_Report"
                  />
                </Box>
              </Paper>
            )}

          {/* ── No data — identical to invoice ── */}
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
