// src/components/EnhancedDownloadComponent.jsx
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloseIcon from '@mui/icons-material/Close';
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// ── PDF styles ────────────────────────────────────────────────────────────────
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 8,
  },
  header: {
    fontSize: 14,
    marginBottom: 6,
    textAlign: 'center',
    color: '#001C64',
    fontWeight: 'bold',
  },
  subheader: {
    fontSize: 8,
    marginBottom: 12,
    textAlign: 'left',
    color: '#555',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: { flexDirection: 'row' },
  tableColHeader: {
    flex: 1,
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#00529B',
    color: '#FFFFFF',
    padding: 3,
    fontSize: 6,
    fontWeight: 'bold',
  },
  tableCol: {
    flex: 1,
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 3,
    fontSize: 5.5,
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    fontSize: 7,
    textAlign: 'center',
    color: '#888',
  },
});

// ── GL resolvers ──────────────────────────────────────────────────────────────
const resolveGLCode = (l) =>
  l?.gl_account_detail
    ? `${l.gl_account_detail.gl_code} - ${l.gl_account_detail.gl_description}`
    : l?.gl_description || '-';
const resolveCostCenter = (l) =>
  l?.cost_center_detail
    ? `${l.cost_center_detail.cc_code} - ${l.cost_center_detail.cc_description}`
    : l?.cost_center
      ? String(l.cost_center)
      : '-';
const resolveLocation = (l) =>
  l?.location_detail
    ? `${l.location_detail.loc_code} - ${l.location_detail.loc_name}`
    : '-';
const resolveAircraftType = (l) =>
  l?.aircraft_type_detail
    ? `${l.aircraft_type_detail.code} - ${l.aircraft_type_detail.description}`
    : '-';
const resolveRoute = (l) =>
  l?.route_detail
    ? `${l.route_detail.code} - ${l.route_detail.description}`
    : '-';

// ── All available columns ─────────────────────────────────────────────────────
// getValue(invoice, glLine):
//   - invoice: the invoice row (flat or nested)
//   - glLine: current GL line object (null when not expanded)
const ALL_COLUMNS = [
  // Invoice fields
  {
    key: 'supplier_number',
    label: 'Supplier Number',
    group: 'Invoice',
    getValue: (inv) => inv?.supplier_number || '',
  },
  {
    key: 'supplier_name',
    label: 'Supplier Name',
    group: 'Invoice',
    getValue: (inv) => inv?.supplier_name || '',
  },
  {
    key: 'invoice_number',
    label: 'Invoice Number',
    group: 'Invoice',
    getValue: (inv) => inv?.invoice_number || '',
  },
  {
    key: 'reference',
    label: 'Reference',
    group: 'Invoice',
    getValue: (inv) => inv?.reference || '',
  },
  {
    key: 'invoice_date',
    label: 'Invoice Date',
    group: 'Invoice',
    getValue: (inv) => inv?.invoice_date || '',
  },
  {
    key: 'service_period',
    label: 'Service Period',
    group: 'Invoice',
    getValue: (inv) => inv?.service_period || '',
  },
  {
    key: 'status',
    label: 'Status',
    group: 'Invoice',
    getValue: (inv) => inv?.status || '',
  },
  {
    key: 'payment_terms',
    label: 'Payment Terms',
    group: 'Invoice',
    getValue: (inv) => inv?.payment_terms || '',
  },
  {
    key: 'payment_due_date',
    label: 'Payment Due Date',
    group: 'Invoice',
    getValue: (inv) => inv?.payment_due_date || '',
  },
  {
    key: 'quantity',
    label: 'Quantity',
    group: 'Invoice',
    getValue: (inv) => inv?.quantity ?? '',
  },
  // Owner fields
  {
    key: 'owner_name',
    label: 'Invoice Owner',
    group: 'Owner',
    getValue: (inv) => {
      const o = inv?.invoice_owner || {};
      return `${o.firstname || ''} ${o.lastname || ''}`.trim();
    },
  },
  {
    key: 'owner_email',
    label: 'Owner Email',
    group: 'Owner',
    getValue: (inv) => (inv?.invoice_owner || {}).email || '',
  },
  {
    key: 'owner_department',
    label: 'Owner Department',
    group: 'Owner',
    getValue: (inv) => (inv?.invoice_owner || {}).department || '',
  },
  // Financial fields
  {
    key: 'currency',
    label: 'Origin Currency',
    group: 'Financial',
    getValue: (inv) => inv?.currency || '',
  },
  {
    key: 'amount',
    label: 'Original Amount',
    group: 'Financial',
    getValue: (inv) => inv?.amount ?? '',
  },
  {
    key: 'exchange_rate',
    label: 'Exchange Rate',
    group: 'Financial',
    getValue: (inv) => inv?.exchange_rate_to_usd ?? '',
  },
  {
    key: 'amount_in_usd',
    label: 'Amount in USD',
    group: 'Financial',
    getValue: (inv) => inv?.amount_in_usd ?? '',
  },
  // GL Line fields (shown per-line when expanded, summary/blank when collapsed)
  {
    key: 'gl_account',
    label: 'GL Account',
    group: 'GL Line',
    getValue: (inv, gl) =>
      gl
        ? resolveGLCode(gl)
        : inv?.gl_lines?.length
          ? `${inv.gl_lines.length} GL line(s)`
          : '-',
  },
  {
    key: 'gl_amount',
    label: 'GL Amount',
    group: 'GL Line',
    getValue: (inv, gl) => (gl ? (gl?.gl_amount ?? '') : ''),
  },
  {
    key: 'gl_amount_usd',
    label: 'GL Amount in USD',
    group: 'GL Line',
    getValue: (inv, gl) => (gl ? (gl?.gl_amount_in_usd ?? '') : ''),
  },
  {
    key: 'cost_center',
    label: 'Cost Center',
    group: 'GL Line',
    getValue: (inv, gl) => (gl ? resolveCostCenter(gl) : ''),
  },
  {
    key: 'location',
    label: 'Location',
    group: 'GL Line',
    getValue: (inv, gl) => (gl ? resolveLocation(gl) : ''),
  },
  {
    key: 'aircraft_type',
    label: 'Aircraft Type',
    group: 'GL Line',
    getValue: (inv, gl) => (gl ? resolveAircraftType(gl) : ''),
  },
  {
    key: 'route',
    label: 'Route',
    group: 'GL Line',
    getValue: (inv, gl) => (gl ? resolveRoute(gl) : ''),
  },
  // Timestamps
  {
    key: 'created_at',
    label: 'Created Date',
    group: 'Timestamps',
    getValue: (inv) =>
      inv?.created_at
        ? new Date(inv.created_at).toLocaleDateString('en-GB')
        : '',
  },
  {
    key: 'updated_at',
    label: 'Updated Date',
    group: 'Timestamps',
    getValue: (inv) =>
      inv?.updated_at
        ? new Date(inv.updated_at).toLocaleDateString('en-GB')
        : '',
  },
  // Pending-only fields — only meaningful when status is pending
  {
    key: 'addressed_to',
    label: 'Addressed To',
    group: 'Pending Info',
    getValue: (inv) =>
      inv?.status === 'pending' ? inv?.is_addressed_to?.name || '' : '',
  },
  {
    key: 'addressed_email',
    label: 'Addressed To Email',
    group: 'Pending Info',
    getValue: (inv) =>
      inv?.status === 'pending' ? inv?.is_addressed_to?.email || '' : '',
  },
  {
    key: 'days_pending',
    label: 'Days Pending (Verifier)',
    group: 'Pending Info',
    getValue: (inv) =>
      inv?.status === 'pending' ? (inv?.days_pending_with_verifier ?? '') : '',
  },
];

// Columns ON by default
const DEFAULT_ON = new Set([
  'supplier_number',
  'supplier_name',
  'invoice_number',
  'reference',
  'invoice_date',
  'service_period',
  'status',
  'currency',
  'amount',
  'gl_account',
  'gl_amount',
  'cost_center',
  'location',
  'aircraft_type',
  'route',
  'created_at',
  'addressed_to',
  'days_pending',
]);

// ── Build rows from invoices ──────────────────────────────────────────────────
function buildRows(invoices, expandGLLines, activeColumns) {
  const cols = ALL_COLUMNS.filter((c) => activeColumns.has(c.key));
  const hasGLCols = cols.some((c) => c.group === 'GL Line');
  const rows = [];

  (invoices?.results || []).forEach((inv) => {
    const glLines = inv?.gl_lines || inv?.invoice?.gl_lines || [];

    if (expandGLLines && hasGLCols && glLines.length > 0) {
      // One output row per GL line
      glLines.forEach((gl) => {
        rows.push(cols.map((c) => String(c.getValue(inv, gl) ?? '')));
      });
    } else {
      // One output row per invoice — GL cols show summary
      rows.push(cols.map((c) => String(c.getValue(inv, null) ?? '')));
    }
  });

  return { headers: cols.map((c) => c.label), rows };
}

// ── PDF Document ──────────────────────────────────────────────────────────────
const InvoicePDF = ({ invoices, title, expandGLLines, activeColumns }) => {
  const { headers, rows } = buildRows(invoices, expandGLLines, activeColumns);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <Text style={pdfStyles.header}>{title}</Text>
        <Text style={pdfStyles.subheader}>
          {`Generated: ${new Date().toLocaleString()}   |   ${rows.length} rows   |   GL Lines: ${expandGLLines ? 'Expanded' : 'Summarised'}`}
        </Text>

        <View style={pdfStyles.table}>
          {/* Header */}
          <View style={pdfStyles.tableRow}>
            {headers.map((h, i) => (
              <View key={i} style={pdfStyles.tableColHeader}>
                <Text>{h}</Text>
              </View>
            ))}
          </View>
          {/* Data — cap at 200 */}
          {rows.slice(0, 200).map((row, ri) => (
            <View key={ri} style={pdfStyles.tableRow}>
              {row.map((cell, ci) => (
                <View key={ci} style={pdfStyles.tableCol}>
                  <Text>{cell}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {rows.length > 200 && (
          <Text style={pdfStyles.subheader}>
            Note: PDF is limited to 200 rows. Use CSV for complete data.
          </Text>
        )}
        <Text style={pdfStyles.footer}>
          {title} • Generated by Invoice Management System
        </Text>
      </Page>
    </Document>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const EnhancedDownloadComponent = ({ invoices, title = 'Invoice Report' }) => {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState('csv'); // 'csv' | 'pdf'
  const [expandGLLines, setExpand] = useState(true);
  const [activeColumns, setActive] = useState(new Set(DEFAULT_ON));

  const toggleColumn = (key) => {
    setActive((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleGroup = (group) => {
    const groupKeys = ALL_COLUMNS.filter((c) => c.group === group).map(
      (c) => c.key,
    );
    const allOn = groupKeys.every((k) => activeColumns.has(k));
    setActive((prev) => {
      const next = new Set(prev);
      groupKeys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
      return next;
    });
  };

  const selectAll = () => setActive(new Set(ALL_COLUMNS.map((c) => c.key)));
  const deselectAll = () => setActive(new Set());

  // ── CSV generation ────────────────────────────────────────────────────────
  const downloadCSV = () => {
    try {
      const { headers, rows } = buildRows(
        invoices,
        expandGLLines,
        activeColumns,
      );
      const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

      let csv = `data:text/csv;charset=utf-8,`;
      csv += `"${title}"\n`;
      csv += `"Generated: ${new Date().toLocaleString()}"\n`;
      csv += `"GL Lines: ${expandGLLines ? 'Expanded' : 'Summarised'}"\n\n`;
      csv += headers.map(q).join(',') + '\n';
      rows.forEach((row) => {
        csv += row.map(q).join(',') + '\n';
      });

      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csv));
      link.setAttribute(
        'download',
        `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setOpen(false);
    } catch (e) {
      console.error('CSV error:', e);
      alert('Failed to generate CSV. Please try again.');
    }
  };

  const groups = [...new Set(ALL_COLUMNS.map((c) => c.group))];
  const activeCount = activeColumns.size;
  const totalRows = invoices?.results?.length || 0;

  return (
    <>
      <Button
        variant="contained"
        color="success"
        startIcon={<DownloadIcon />}
        onClick={() => setOpen(true)}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          fontSize: '13px',
        }}
      >
        Download Report
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '16px' }}>
              Customize &amp; Download
            </Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          {/* ── Format + GL expand ───────────────────────────────────── */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 3,
              mb: 2.5,
              mt: 0.5,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#555',
                  display: 'block',
                  mb: 0.75,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Format
              </Typography>
              <ToggleButtonGroup
                value={format}
                exclusive
                size="small"
                onChange={(_, v) => v && setFormat(v)}
                sx={{
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    px: 2,
                    fontSize: '12.5px',
                    borderRadius: '7px !important',
                  },
                }}
              >
                <ToggleButton value="csv">
                  <TableChartIcon sx={{ fontSize: 15, mr: 0.75 }} />
                  CSV
                </ToggleButton>
                <ToggleButton value="pdf">
                  <PictureAsPdfIcon sx={{ fontSize: 15, mr: 0.75 }} />
                  PDF
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#555',
                  display: 'block',
                  mb: 0.75,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                GL Lines
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={expandGLLines}
                    onChange={(e) => setExpand(e.target.checked)}
                    size="small"
                    sx={{ p: 0.5 }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '13px' }}>
                    Expand (one row per GL line)
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Box>

            <Box sx={{ ml: 'auto', textAlign: 'right' }}>
              <Typography
                variant="caption"
                sx={{ color: '#888', display: 'block', mb: 0.5 }}
              >
                {totalRows} invoice{totalRows !== 1 ? 's' : ''} &nbsp;·&nbsp;{' '}
                {activeCount}/{ALL_COLUMNS.length} columns
              </Typography>
              <Box
                sx={{ display: 'flex', gap: 0.75, justifyContent: 'flex-end' }}
              >
                <Button
                  size="small"
                  onClick={selectAll}
                  sx={{
                    fontSize: '11px',
                    textTransform: 'none',
                    py: 0.25,
                    px: 1,
                    minWidth: 0,
                    borderRadius: '6px',
                  }}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={deselectAll}
                  sx={{
                    fontSize: '11px',
                    textTransform: 'none',
                    py: 0.25,
                    px: 1,
                    minWidth: 0,
                    borderRadius: '6px',
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* ── Column picker ────────────────────────────────────────── */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: '#555',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'block',
              mb: 1.5,
            }}
          >
            Columns to Include
          </Typography>

          <Grid container spacing={1.5}>
            {groups.map((group) => {
              const groupCols = ALL_COLUMNS.filter((c) => c.group === group);
              const allOn = groupCols.every((c) => activeColumns.has(c.key));
              const someOn = groupCols.some((c) => activeColumns.has(c.key));
              return (
                <Grid item xs={12} sm={6} md={3} key={group}>
                  <Box
                    sx={{
                      border: '1px solid #e0e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      height: '100%',
                    }}
                  >
                    {/* Group header — clicking toggles the whole group */}
                    <Box
                      onClick={() => toggleGroup(group)}
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        bgcolor: '#f0f4f8',
                        borderBottom: '1px solid #e0e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#e3effc' },
                      }}
                    >
                      <Checkbox
                        checked={allOn}
                        indeterminate={someOn && !allOn}
                        size="small"
                        sx={{ p: 0, mr: 0.75 }}
                        onChange={() => toggleGroup(group)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Typography
                        sx={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#1565c0',
                        }}
                      >
                        {group}
                      </Typography>
                    </Box>
                    {/* Column checkboxes */}
                    <Box sx={{ px: 1, py: 0.5 }}>
                      {groupCols.map((col) => (
                        <FormControlLabel
                          key={col.key}
                          control={
                            <Checkbox
                              checked={activeColumns.has(col.key)}
                              onChange={() => toggleColumn(col.key)}
                              size="small"
                              sx={{ p: 0.5 }}
                            />
                          }
                          label={
                            <Typography sx={{ fontSize: '12px' }}>
                              {col.label}
                            </Typography>
                          }
                          sx={{ display: 'flex', m: 0, py: 0.2 }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* ── Warnings ─────────────────────────────────────────────── */}
          {format === 'pdf' && (
            <Box
              sx={{
                mt: 2,
                p: 1.25,
                bgcolor: '#fff3e0',
                borderRadius: '7px',
                border: '1px solid #ffcc80',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: '#e65100', fontSize: '12px' }}
              >
                ⚠ PDF is limited to 200 rows. Use CSV for the complete dataset.
              </Typography>
            </Box>
          )}
          {activeCount === 0 && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.25,
                bgcolor: '#ffebee',
                borderRadius: '7px',
                border: '1px solid #ef9a9a',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: '#c62828', fontSize: '12px' }}
              >
                Please select at least one column to download.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={() => setOpen(false)}
            sx={{ textTransform: 'none', color: '#555' }}
          >
            Cancel
          </Button>

          {format === 'csv' ? (
            <Button
              variant="contained"
              onClick={downloadCSV}
              disabled={activeCount === 0}
              startIcon={<TableChartIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                bgcolor: '#00529B',
                '&:hover': { bgcolor: '#003d75' },
                px: 2.5,
              }}
            >
              Download CSV
            </Button>
          ) : (
            <PDFDownloadLink
              document={
                <InvoicePDF
                  invoices={invoices}
                  title={title}
                  expandGLLines={expandGLLines}
                  activeColumns={activeColumns}
                />
              }
              fileName={`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`}
              style={{ textDecoration: 'none' }}
            >
              {({ loading }) => (
                <Button
                  variant="contained"
                  disabled={loading || activeCount === 0}
                  startIcon={
                    loading ? (
                      <CircularProgress size={15} color="inherit" />
                    ) : (
                      <PictureAsPdfIcon />
                    )
                  }
                  onClick={() => {
                    if (!loading) setOpen(false);
                  }}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                    bgcolor: '#c62828',
                    '&:hover': { bgcolor: '#b71c1c' },
                    px: 2.5,
                  }}
                >
                  {loading ? 'Generating PDF…' : 'Download PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EnhancedDownloadComponent;
