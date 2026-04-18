// src/components/EnhancedDownloadComponent.jsx
import { formatCurrencyAmount as _fca } from '../utils/formatAmount';
import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 8,
  },
  header: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#001C64',
    fontWeight: 'bold',
  },
  subheader: {
    fontSize: 9,
    marginBottom: 15,
    textAlign: 'left',
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
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '7.69%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#00529B',
    color: '#FFFFFF',
    padding: 3,
    fontSize: 7,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '7.69%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 3,
    fontSize: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    fontSize: 7,
    textAlign: 'center',
  },
  summarySection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    fontSize: 8,
  },
});

// ── GL line _detail resolvers ─────────────────────────────────────────────────
const resolveGLCode = (glLine) => {
  if (glLine?.gl_account_detail)
    return `${glLine.gl_account_detail.gl_code} - ${glLine.gl_account_detail.gl_description}`;
  return glLine?.gl_description || '-';
};

const resolveCostCenter = (glLine) => {
  if (glLine?.cost_center_detail)
    return `${glLine.cost_center_detail.cc_code} - ${glLine.cost_center_detail.cc_description}`;
  return glLine?.cost_center ? String(glLine.cost_center) : '-';
};

const resolveLocation = (glLine) => {
  if (glLine?.location_detail)
    return `${glLine.location_detail.loc_code} - ${glLine.location_detail.loc_name}`;
  return '-';
};

const resolveAircraftType = (glLine) => {
  if (glLine?.aircraft_type_detail)
    return `${glLine.aircraft_type_detail.code} - ${glLine.aircraft_type_detail.description}`;
  return '-';
};

const resolveRoute = (glLine) => {
  if (glLine?.route_detail)
    return `${glLine.route_detail.code} - ${glLine.route_detail.description}`;
  return '-';
};

// ── Enhanced PDF Document ─────────────────────────────────────────────────────
// Mirrors DownloadInvoiceComponent column layout exactly.
// showGLAmount: true  → Full report  — ORIGINAL GL AMOUNT column included
// showGLAmount: false → Without GL Amount — ORIGINAL GL AMOUNT column omitted
// invoice-level fields shown ONLY on the LAST GL line row to avoid duplication.
const EnhancedInvoicePDF = ({
  invoices,
  title = 'Invoice Report',
  options = {},
  showGLAmount = true,
}) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.header}>{title}</Text>
        <Text style={styles.subheader}>
          {'Generated on: '}
          {new Date().toLocaleString()}
          {'   |   Report type: '}
          {showGLAmount ? 'Full Report' : 'Without GL Amount'}
        </Text>

        <View style={styles.table}>
          {/* Table Header — identical to DownloadInvoiceComponent */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text>SUPPLIER NO.</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>SUPPLIER NAME</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>INVOICE NO.</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>REFERENCE</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>INVOICE DATE</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>SERVICE PERIOD</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>GL ACCOUNT</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>LOCATION</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>COST CENTER</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>ORIGIN CURRENCY</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>ORIGINAL AMOUNT</Text>
            </View>
            {/* ORIGINAL GL AMOUNT — full report only */}
            {showGLAmount && (
              <View style={styles.tableColHeader}>
                <Text>ORIGINAL GL AMOUNT</Text>
              </View>
            )}
            <View style={styles.tableColHeader}>
              <Text>EXCHANGE RATE</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>GL AMOUNT IN USD</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>AMOUNT IN USD</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>PAY TERMS</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>PAY DUE DATE</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>QUANTITY</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>AIRCRAFT TYPE</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>ROUTE</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>STATUS</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>CREATED DATE</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>UPDATED DATE</Text>
            </View>
          </View>

          {/* Table Data — limit to 100 records for PDF */}
          {(invoices?.results || [])
            .slice(0, 100)
            .map((invoice, invoiceIndex) => {
              const baseData = {
                supplier_number: invoice?.supplier_number || '-',
                supplier_name: invoice?.supplier_name || '-',
                invoice_number: invoice?.invoice_number || '-',
                reference: invoice?.reference || '-',
                invoice_date: invoice?.invoice_date || '-',
                service_period: invoice?.service_period || '-',
                currency: invoice?.currency || '-',
                amount: invoice?.amount || '-',
                exchange_rate: invoice?.exchange_rate_to_usd ?? '-',
                amount_in_usd: invoice?.amount_in_usd ?? '-',
                payment_terms: invoice?.payment_terms || '-',
                payment_due_date: invoice?.payment_due_date || '-',
                quantity: invoice?.quantity || '-',
                status: invoice?.status || '-',
                created_at: invoice?.created_at
                  ? new Date(invoice.created_at).toLocaleDateString()
                  : '-',
                updated_at: invoice?.updated_at
                  ? new Date(invoice.updated_at).toLocaleDateString()
                  : '-',
              };

              if (invoice?.gl_lines && invoice.gl_lines.length > 0) {
                const lastIdx = invoice.gl_lines.length - 1;
                return invoice.gl_lines.map((glLine, glIndex) => {
                  const isLast = glIndex === lastIdx;
                  return (
                    <View
                      key={`${invoiceIndex}-${glIndex}`}
                      style={styles.tableRow}
                    >
                      <View style={styles.tableCol}>
                        <Text>{baseData.supplier_number}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{baseData.supplier_name}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{baseData.invoice_number}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{baseData.reference}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{baseData.invoice_date}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{baseData.service_period}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{resolveGLCode(glLine)}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{resolveLocation(glLine)}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{resolveCostCenter(glLine)}</Text>
                      </View>
                      {/* Invoice-level — last GL line only */}
                      <View style={styles.tableCol}>
                        <Text>{isLast ? baseData.currency : ''}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{isLast ? baseData.amount : ''}</Text>
                      </View>
                      {showGLAmount && (
                        <View style={styles.tableCol}>
                          <Text>{glLine?.gl_amount || '-'}</Text>
                        </View>
                      )}
                      <View style={styles.tableCol}>
                        <Text>{isLast ? baseData.exchange_rate : ''}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{glLine?.gl_amount_in_usd ?? '-'}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{isLast ? baseData.amount_in_usd : ''}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{isLast ? baseData.payment_terms : ''}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{isLast ? baseData.payment_due_date : ''}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{isLast ? baseData.quantity : ''}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{resolveAircraftType(glLine)}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{resolveRoute(glLine)}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{isLast ? baseData.status : ''}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{isLast ? baseData.created_at : ''}</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text>{isLast ? baseData.updated_at : ''}</Text>
                      </View>
                    </View>
                  );
                });
              } else {
                return (
                  <View key={invoiceIndex} style={styles.tableRow}>
                    <View style={styles.tableCol}>
                      <Text>{baseData.supplier_number}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.supplier_name}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.invoice_number}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.reference}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.invoice_date}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.service_period}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>-</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>-</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>-</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.currency}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.amount}</Text>
                    </View>
                    {showGLAmount && (
                      <View style={styles.tableCol}>
                        <Text>-</Text>
                      </View>
                    )}
                    <View style={styles.tableCol}>
                      <Text>{baseData.exchange_rate}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>-</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.amount_in_usd}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.payment_terms}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.payment_due_date}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.quantity}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>-</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>-</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.status}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.created_at}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{baseData.updated_at}</Text>
                    </View>
                  </View>
                );
              }
            })}
        </View>

        {(invoices?.results?.length || 0) > 100 && (
          <Text style={styles.subheader}>
            Note: Only first 100 records shown in PDF. Download CSV for complete
            data.
          </Text>
        )}

        <Text style={styles.footer}>
          {title} • Generated by Invoice Management System
        </Text>
      </Page>
    </Document>
  );
};

// ── EnhancedDownloadComponent ─────────────────────────────────────────────────
const EnhancedDownloadComponent = ({ invoices, title = 'Invoice Report' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [downloadOptions, setDownloadOptions] = useState({
    expandGLLines: true,
    includeOwnerDetails: true,
    includeTimestamps: true,
  });

  // downloadType: null | 'pdf_full' | 'pdf_without_gl' | 'csv_full' | 'csv_without_gl'
  const [downloadType, setDownloadType] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleDownloadOption = (type) => {
    setDownloadType(type);
    setShowOptionsDialog(true);
    handleClose();
  };

  const handleOptionsDialogClose = () => {
    setShowOptionsDialog(false);
    setDownloadType(null);
  };

  const handleOptionChange = (option, value) => {
    setDownloadOptions((prev) => ({ ...prev, [option]: value }));
  };

  // Derived flags
  const isPdf = downloadType?.startsWith('pdf');
  const showGLAmount =
    downloadType === 'pdf_full' || downloadType === 'csv_full';
  const dialogTitle = downloadType
    ? `Download Options — ${isPdf ? 'PDF' : 'CSV'} (${showGLAmount ? 'Full Report' : 'Without GL Amount'})`
    : 'Download Options';

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getInvoiceValue = (invoice, directPath, nestedPath = null) => {
    const path = nestedPath || directPath;
    return invoice?.[directPath] || invoice?.invoice?.[path] || '';
  };

  const getInvoiceOwner = (invoice) => {
    return invoice?.invoice_owner || invoice?.invoice?.invoice_owner || {};
  };

  const getGLLines = (invoice) => {
    return invoice?.gl_lines || invoice?.invoice?.gl_lines || [];
  };

  // ── CSV export ────────────────────────────────────────────────────────────
  // Mirrors DownloadInvoiceComponent column layout exactly.
  // showGLAmount controls whether ORIGINAL GL AMOUNT column is included.
  // invoice-level fields shown ONLY on the LAST GL line row.
  const generateEnhancedCSV = (includeGLAmount) => {
    try {
      const currentDate = new Date().toLocaleString();
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += `"${title}"\n`;
      csvContent += `"Generated on: ${currentDate}"\n`;
      csvContent += `"Report type: ${includeGLAmount ? 'Full Report' : 'Without GL Amount'}"\n\n`;

      const q = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

      // Headers — identical to DownloadInvoiceComponent, with conditional ORIGINAL GL AMOUNT
      const headers = [
        'Supplier Number',
        'Supplier Name',
        'Invoice Number',
        'Reference',
        'Invoice Date',
        'Service Period',
        'GL Account',
        'Location',
        'Cost Center',
        'Origin Currency',
        'Original Amount',
        ...(includeGLAmount ? ['Original GL Amount'] : []),
        'Exchange Rate',
        'GL Amount in USD',
        'Amount in USD',
        'Payment Terms',
        'Payment Due Date',
        'Status',
        'Quantity',
        'Aircraft Type',
        'Route',
        'Created Date',
        'Updated Date',
      ];

      csvContent += headers.map((h) => q(h)).join(',') + '\n';

      (invoices?.results || []).forEach((invoice) => {
        const baseData = {
          supplier_number: invoice?.supplier_number || '',
          supplier_name: invoice?.supplier_name || '',
          invoice_number: invoice?.invoice_number || '',
          reference: invoice?.reference || '',
          invoice_date: invoice?.invoice_date || '',
          service_period: invoice?.service_period || '',
          currency: invoice?.currency || '',
          amount: invoice?.amount || '',
          exchange_rate: invoice?.exchange_rate_to_usd ?? '',
          amount_in_usd: invoice?.amount_in_usd ?? '',
          payment_terms: invoice?.payment_terms || '',
          payment_due_date: invoice?.payment_due_date || '',
          quantity: invoice?.quantity || '',
          status: invoice?.status || '',
          created_at: invoice?.created_at
            ? new Date(invoice.created_at).toLocaleDateString()
            : '',
          updated_at: invoice?.updated_at
            ? new Date(invoice.updated_at).toLocaleDateString()
            : '',
        };

        if (invoice?.gl_lines && invoice.gl_lines.length > 0) {
          const lastIdx = invoice.gl_lines.length - 1;
          invoice.gl_lines.forEach((glLine, glIdx) => {
            const isLast = glIdx === lastIdx;
            const row = [
              q(baseData.supplier_number),
              q(baseData.supplier_name),
              q(baseData.invoice_number),
              q(baseData.reference),
              q(baseData.invoice_date),
              q(baseData.service_period),
              q(resolveGLCode(glLine)),
              q(resolveLocation(glLine)),
              q(resolveCostCenter(glLine)),
              // Invoice-level fields — only on last GL line
              q(isLast ? baseData.currency : ''),
              q(isLast ? baseData.amount : ''),
              ...(includeGLAmount ? [q(glLine?.gl_amount || '')] : []),
              q(isLast ? baseData.exchange_rate : ''),
              q(glLine?.gl_amount_in_usd ?? ''),
              q(isLast ? baseData.amount_in_usd : ''),
              q(isLast ? baseData.payment_terms : ''),
              q(isLast ? baseData.payment_due_date : ''),
              q(isLast ? baseData.status : ''),
              q(isLast ? baseData.quantity : ''),
              q(resolveAircraftType(glLine)),
              q(resolveRoute(glLine)),
              q(isLast ? baseData.created_at : ''),
              q(isLast ? baseData.updated_at : ''),
            ].join(',');
            csvContent += row + '\n';
          });
        } else {
          // No GL lines — single row
          const row = [
            q(baseData.supplier_number),
            q(baseData.supplier_name),
            q(baseData.invoice_number),
            q(baseData.reference),
            q(baseData.invoice_date),
            q(baseData.service_period),
            q(''), // GL Account
            q(''), // Location
            q(''), // Cost Center
            q(baseData.currency),
            q(baseData.amount),
            ...(includeGLAmount ? [q('')] : []), // Original GL Amount
            q(baseData.exchange_rate),
            q(''), // GL Amount in USD
            q(baseData.amount_in_usd),
            q(baseData.payment_terms),
            q(baseData.payment_due_date),
            q(baseData.status),
            q(baseData.quantity),
            q(''), // Aircraft Type
            q(''), // Route
            q(baseData.created_at),
            q(baseData.updated_at),
          ].join(',');
          csvContent += row + '\n';
        }
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `${title.replace(/\s+/g, '_')}_${
          includeGLAmount ? 'Full_Report' : 'Without_GL_Amount'
        }_${new Date().toISOString().split('T')[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      handleOptionsDialogClose();
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Failed to generate CSV. Please try again.');
    }
  };

  const handleConfirmDownload = () => {
    if (!isPdf) generateEnhancedCSV(showGLAmount);
  };

  return (
    <>
      <Button
        variant="contained"
        color="success"
        startIcon={<DownloadIcon />}
        onClick={handleClick}
        aria-controls={open ? 'download-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        Download Report
      </Button>

      <Menu
        id="download-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'download-button' }}
      >
        {/* ── PDF ── */}
        <MenuItem disabled sx={{ opacity: '1 !important' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            PDF
          </Typography>
        </MenuItem>

        <MenuItem onClick={() => handleDownloadOption('pdf_full')}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Full Report"
            secondary="Includes Original GL Amount"
          />
        </MenuItem>

        <MenuItem onClick={() => handleDownloadOption('pdf_without_gl')}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" sx={{ color: '#9e9e9e' }} />
          </ListItemIcon>
          <ListItemText
            primary="Without GL Amount"
            secondary="Excludes Original GL Amount column"
          />
        </MenuItem>

        <Divider />

        {/* ── CSV ── */}
        <MenuItem disabled sx={{ opacity: '1 !important' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            CSV
          </Typography>
        </MenuItem>

        <MenuItem onClick={() => handleDownloadOption('csv_full')}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Full Report"
            secondary="Includes Original GL Amount"
          />
        </MenuItem>

        <MenuItem onClick={() => handleDownloadOption('csv_without_gl')}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" sx={{ color: '#9e9e9e' }} />
          </ListItemIcon>
          <ListItemText
            primary="Without GL Amount"
            secondary="Excludes Original GL Amount column"
          />
        </MenuItem>
      </Menu>

      {/* ── Download Options Dialog ── */}
      <Dialog
        open={showOptionsDialog}
        onClose={handleOptionsDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialogTitle}
          <IconButton
            aria-label="close"
            onClick={handleOptionsDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {/* Report type banner */}
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: showGLAmount ? '#f0f7ff' : '#fff8e1',
              borderRadius: 1,
              border: `1px solid ${showGLAmount ? '#90caf9' : '#ffe082'}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {showGLAmount
                ? '✅ Full Report — all columns included, with the Original GL Amount column.'
                : '⚠️ Without GL Amount — the Original GL Amount column will be excluded from this report.'}
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Customize your download:
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={downloadOptions.expandGLLines}
                  onChange={(e) =>
                    handleOptionChange('expandGLLines', e.target.checked)
                  }
                />
              }
              label="Expand GL Lines (show each GL line as separate row)"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={downloadOptions.includeOwnerDetails}
                  onChange={(e) =>
                    handleOptionChange('includeOwnerDetails', e.target.checked)
                  }
                />
              }
              label="Include Invoice Owner Details"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={downloadOptions.includeTimestamps}
                  onChange={(e) =>
                    handleOptionChange('includeTimestamps', e.target.checked)
                  }
                />
              }
              label="Include Created/Updated Timestamps"
            />

            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Records:</strong> {invoices?.results?.length || 0}{' '}
                invoices
                {downloadOptions.expandGLLines && (
                  <span>
                    {' '}
                    (may result in more rows due to GL line expansion)
                  </span>
                )}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleOptionsDialogClose}>Cancel</Button>
          {isPdf ? (
            <PDFDownloadLink
              document={
                <EnhancedInvoicePDF
                  invoices={invoices}
                  title={title}
                  options={downloadOptions}
                  showGLAmount={showGLAmount}
                />
              }
              fileName={`${title.replace(/\s+/g, '_')}_${
                showGLAmount ? 'Full_Report' : 'Without_GL_Amount'
              }_${new Date().toISOString().split('T')[0]}.pdf`}
              style={{ textDecoration: 'none' }}
            >
              {({ loading }) => (
                <Button
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <PictureAsPdfIcon />
                    )
                  }
                  onClick={handleOptionsDialogClose}
                >
                  {loading ? 'Generating...' : 'Download PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          ) : (
            <Button
              variant="contained"
              onClick={handleConfirmDownload}
              startIcon={<TableChartIcon />}
            >
              Download CSV
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EnhancedDownloadComponent;
