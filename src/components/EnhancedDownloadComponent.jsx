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
// Always prefer _detail objects; fall back gracefully for legacy records.

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
// GL-specific fields print on every GL line row.
// Invoice-level fields (supplier, invoice#, owner, service period, currency,
// total amount, status) print only on the FIRST GL line row (is_gl_line: false).
const EnhancedInvoicePDF = ({
  invoices,
  title = 'Invoice Report',
  options = {},
}) => {
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

  const formatCurrency = (amount, currency = '') => {
    if (!amount || amount === '-') return '-';
    return _fca(amount, currency);
  };

  // Flatten invoices — each GL line becomes its own row.
  // is_gl_line = true means it is NOT the first GL line of an invoice
  // (invoice-level fields are suppressed on these rows).
  const prepareDataForExport = () => {
    if (!options.expandGLLines) {
      return invoices?.results || [];
    }

    const flattenedData = [];
    (invoices?.results || []).forEach((invoice) => {
      const glLines = getGLLines(invoice);
      const owner = getInvoiceOwner(invoice);
      const lastIdx = glLines.length - 1;

      if (glLines.length === 0) {
        flattenedData.push({
          ...invoice,
          // resolved GL fields
          _gl_account: '-',
          _cost_center: '-',
          _location: '-',
          _aircraft_type: '-',
          _route: '-',
          _gl_amount: '-',
          _gl_amount_in_usd: '-',
          owner_name:
            `${owner?.firstname || ''} ${owner?.lastname || ''}`.trim(),
          is_gl_line: false,
          is_last_gl: true,
        });
      } else {
        glLines.forEach((glLine, index) => {
          flattenedData.push({
            ...invoice,
            // resolved GL fields from _detail objects
            _gl_account: resolveGLCode(glLine),
            _cost_center: resolveCostCenter(glLine),
            _location: resolveLocation(glLine),
            _aircraft_type: resolveAircraftType(glLine),
            _route: resolveRoute(glLine),
            _gl_amount: glLine?.gl_amount || '-',
            _gl_amount_in_usd: glLine?.gl_amount_in_usd ?? '-',
            owner_name:
              `${owner?.firstname || ''} ${owner?.lastname || ''}`.trim(),
            is_gl_line: index > 0, // suppress invoice-level fields on non-first rows
            is_last_gl: index === lastIdx, // show total amount only on last GL line
          });
        });
      }
    });

    return flattenedData;
  };

  const exportData = prepareDataForExport();
  const totalRecords = exportData.length;
  const uniqueInvoices = invoices?.results?.length || 0;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>{title}</Text>
        <Text style={styles.subheader}>
          Generated: {new Date().toLocaleString()} | Invoices: {uniqueInvoices}{' '}
          | Records: {totalRecords}
        </Text>

        {/* Table Header */}
        <View style={styles.table}>
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
              <Text>OWNER</Text>
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
              <Text>ORIGINAL AMOUNT (GL)</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>GL AMOUNT IN USD</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>ORIGINAL AMOUNT</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>EXCHANGE RATE</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>AMOUNT IN USD</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>STATUS</Text>
            </View>
          </View>

          {/* Table Data — limit to 100 records for PDF */}
          {exportData.slice(0, 100).map((record, index) => (
            <View key={index} style={styles.tableRow}>
              {/* Invoice-level fields — blank on non-first GL line rows */}
              <View style={styles.tableCol}>
                <Text>
                  {record.is_gl_line
                    ? ''
                    : getInvoiceValue(record, 'supplier_number')}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text>
                  {record.is_gl_line
                    ? ''
                    : getInvoiceValue(record, 'supplier_name')}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text>
                  {record.is_gl_line
                    ? ''
                    : getInvoiceValue(record, 'invoice_number')}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{record.is_gl_line ? '' : record.owner_name}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>
                  {record.is_gl_line
                    ? ''
                    : getInvoiceValue(record, 'service_period')}
                </Text>
              </View>
              {/* GL-specific fields — from _detail resolvers */}
              <View style={styles.tableCol}>
                <Text>{record._gl_account}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{record._location}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{record._cost_center}</Text>
              </View>
              {/* currency — first GL line only */}
              <View style={styles.tableCol}>
                <Text>
                  {record.is_gl_line ? '' : getInvoiceValue(record, 'currency')}
                </Text>
              </View>
              {/* GL amount — every row */}
              <View style={styles.tableCol}>
                <Text>{record._gl_amount}</Text>
              </View>
              {/* GL amount in USD — every row */}
              <View style={styles.tableCol}>
                <Text>{record._gl_amount_in_usd}</Text>
              </View>
              {/* Total amount — last GL line only to avoid duplication */}
              <View style={styles.tableCol}>
                <Text>
                  {record.is_last_gl ? getInvoiceValue(record, 'amount') : ''}
                </Text>
              </View>
              {/* Exchange rate — last GL line only */}
              <View style={styles.tableCol}>
                <Text>
                  {record.is_last_gl ? (record.exchange_rate_to_usd ?? '') : ''}
                </Text>
              </View>
              {/* Amount in USD — last GL line only */}
              <View style={styles.tableCol}>
                <Text>
                  {record.is_last_gl ? (record.amount_in_usd ?? '') : ''}
                </Text>
              </View>
              {/* Status — first GL line only */}
              <View style={styles.tableCol}>
                <Text>
                  {record.is_gl_line ? '' : getInvoiceValue(record, 'status')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {exportData.length > 100 && (
          <Text style={styles.subheader}>
            Note: Only first 100 records shown in PDF. Download CSV for complete
            data.
          </Text>
        )}

        {/* Footer */}
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

  // Helper functions
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

  // ── CSV export ──────────────────────────────────────────────────────────────
  // GL-specific fields on every GL line row.
  // Invoice-level fields on first GL line only; total amount on last GL line only.
  const generateEnhancedCSV = () => {
    try {
      const currentDate = new Date().toLocaleString();
      let csvContent = 'data:text/csv;charset=utf-8,';

      csvContent += `"${title}"\n`;
      csvContent += `"Generated on: ${currentDate}"\n`;
      csvContent += `"Total Invoices: ${invoices?.results?.length || 0}"\n\n`;

      const q = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

      // Build headers
      let headers = [
        'Supplier Number',
        'Supplier Name',
        'Invoice Number',
        'Service Period',
        'Location',
        'Origin Currency',
        'Original Amount',
        'Exchange Rate',
        'Amount in USD',
        'Status',
      ];

      if (downloadOptions.includeOwnerDetails) {
        headers.splice(3, 0, 'Owner Name', 'Owner Email');
      }

      if (downloadOptions.expandGLLines) {
        // Insert GL columns before Currency
        const currencyIdx = headers.indexOf('Currency');
        headers.splice(
          currencyIdx,
          0,
          'GL Account',
          'Location (GL)',
          'Cost Center',
          'Aircraft Type',
          'Route',
          'GL Amount (Original)',
          'GL Amount in USD',
        );
        // Remove the original 'Location' (invoice-level) since location now comes from GL detail
        const locIdx = headers.indexOf('Location');
        if (locIdx !== -1) headers.splice(locIdx, 1);
      }

      if (downloadOptions.includeTimestamps) {
        headers.push('Created Date', 'Updated Date');
      }

      csvContent += headers.map((h) => q(h)).join(',') + '\n';

      // Process data
      (invoices?.results || []).forEach((invoice) => {
        const owner = getInvoiceOwner(invoice);
        const glLines = getGLLines(invoice);
        const lastIdx = glLines.length - 1;

        const baseData = {
          supplier_number: getInvoiceValue(invoice, 'supplier_number'),
          supplier_name: getInvoiceValue(invoice, 'supplier_name'),
          invoice_number: getInvoiceValue(invoice, 'invoice_number'),
          service_period: getInvoiceValue(invoice, 'service_period'),
          currency: getInvoiceValue(invoice, 'currency'),
          total_amount: getInvoiceValue(invoice, 'amount'),
          exchange_rate: invoice?.exchange_rate_to_usd ?? '',
          amount_in_usd: invoice?.amount_in_usd ?? '',
          status: getInvoiceValue(invoice, 'status'),
          created_at: invoice?.created_at || invoice?.invoice?.created_at || '',
          updated_at: invoice?.updated_at || invoice?.invoice?.updated_at || '',
          owner_name:
            `${owner?.firstname || ''} ${owner?.lastname || ''}`.trim(),
          owner_email: owner?.email || '',
        };

        if (downloadOptions.expandGLLines && glLines.length > 0) {
          glLines.forEach((glLine, index) => {
            const isFirst = index === 0;
            const isLast = index === lastIdx;

            let row = [
              q(isFirst ? baseData.supplier_number : ''),
              q(isFirst ? baseData.supplier_name : ''),
              q(isFirst ? baseData.invoice_number : ''),
              q(isFirst ? baseData.service_period : ''),
              // GL-specific fields — every row
              q(resolveGLCode(glLine)),
              q(resolveLocation(glLine)),
              q(resolveCostCenter(glLine)),
              q(resolveAircraftType(glLine)),
              q(resolveRoute(glLine)),
              q(glLine?.gl_amount || ''),
              q(glLine?.gl_amount_in_usd ?? ''),
              // Invoice-level financial — first/last only
              q(isFirst ? baseData.currency : ''),
              q(isLast ? baseData.total_amount : ''),
              q(isLast ? (invoice?.exchange_rate_to_usd ?? '') : ''),
              q(isLast ? (invoice?.amount_in_usd ?? '') : ''),
              q(isFirst ? baseData.status : ''),
            ];

            if (downloadOptions.includeOwnerDetails) {
              row.splice(
                3,
                0,
                q(isFirst ? baseData.owner_name : ''),
                q(isFirst ? baseData.owner_email : ''),
              );
            }

            if (downloadOptions.includeTimestamps) {
              row.push(
                q(isFirst ? baseData.created_at : ''),
                q(isFirst ? baseData.updated_at : ''),
              );
            }

            csvContent += row.join(',') + '\n';
          });
        } else {
          // No GL lines or expandGLLines disabled — single row
          let row = [
            q(baseData.supplier_number),
            q(baseData.supplier_name),
            q(baseData.invoice_number),
            q(baseData.service_period),
            q(baseData.currency),
            q(baseData.total_amount),
            q(baseData.exchange_rate),
            q(baseData.amount_in_usd),
            q(baseData.status),
          ];

          if (downloadOptions.includeOwnerDetails) {
            row.splice(3, 0, q(baseData.owner_name), q(baseData.owner_email));
          }

          if (downloadOptions.expandGLLines) {
            // Insert empty GL columns in same position (7 GL cols: account, location, cost center, aircraft, route, gl_amount, gl_amount_in_usd)
            const currencyIdx =
              row.length - (downloadOptions.includeOwnerDetails ? 1 : 5);
            row.splice(
              currencyIdx,
              0,
              q(''),
              q(''),
              q(''),
              q(''),
              q(''),
              q(''),
              q(''),
            );
          }

          if (downloadOptions.includeTimestamps) {
            row.push(q(baseData.created_at), q(baseData.updated_at));
          }

          csvContent += row.join(',') + '\n';
        }
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`,
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
    if (downloadType === 'csv') generateEnhancedCSV();
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
        fullWidth
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
        <MenuItem onClick={() => handleDownloadOption('pdf')}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download as PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDownloadOption('csv')}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download as CSV</ListItemText>
        </MenuItem>
      </Menu>

      {/* Download Options Dialog */}
      <Dialog
        open={showOptionsDialog}
        onClose={handleOptionsDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Download Options - {downloadType?.toUpperCase()}
          <IconButton
            aria-label="close"
            onClick={handleOptionsDialogClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
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
          {downloadType === 'pdf' ? (
            <PDFDownloadLink
              document={
                <EnhancedInvoicePDF
                  invoices={invoices}
                  title={title}
                  options={downloadOptions}
                />
              }
              fileName={`${title.replace(/\s+/g, '_')}_${
                new Date().toISOString().split('T')[0]
              }.pdf`}
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
