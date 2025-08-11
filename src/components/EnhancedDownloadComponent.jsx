// src/components/EnhancedDownloadComponent.jsx
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

// Enhanced PDF Document component that handles GL lines
const EnhancedInvoicePDF = ({
  invoices,
  title = 'Invoice Report',
  options = {},
}) => {
  // Helper functions to safely get nested values
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
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  };

  // Flatten invoices with GL lines if option is enabled
  const prepareDataForExport = () => {
    if (!options.expandGLLines) {
      return invoices?.results || [];
    }

    const flattenedData = [];
    (invoices?.results || []).forEach((invoice) => {
      const glLines = getGLLines(invoice);
      const owner = getInvoiceOwner(invoice);

      if (glLines.length === 0) {
        flattenedData.push({
          ...invoice,
          gl_code: '-',
          gl_description: '-',
          cost_center: '-',
          gl_amount: '-',
          owner_name: `${owner?.firstname || ''} ${
            owner?.lastname || ''
          }`.trim(),
        });
      } else {
        glLines.forEach((glLine, index) => {
          flattenedData.push({
            ...invoice,
            gl_code: glLine?.gl_code || '-',
            gl_description: glLine?.gl_description || '-',
            cost_center: glLine?.cost_center || '-',
            gl_amount: glLine?.gl_amount || '-',
            owner_name: `${owner?.firstname || ''} ${
              owner?.lastname || ''
            }`.trim(),
            is_gl_line: index > 0, // Flag to identify additional GL lines
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
              <Text>GL CODE</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>GL DESC</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>LOCATION</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>COST CENTER</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>CURRENCY</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>GL AMOUNT</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>TOTAL</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>STATUS</Text>
            </View>
          </View>

          {/* Table Data */}
          {exportData.slice(0, 100).map((record, index) => {
            // Limit to 100 records for PDF
            const owner = getInvoiceOwner(record);
            return (
              <View key={index} style={styles.tableRow}>
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
                <View style={styles.tableCol}>
                  <Text>{record.gl_code}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{record.gl_description}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>
                    {record.is_gl_line
                      ? ''
                      : getInvoiceValue(record, 'location')}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{record.cost_center}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>
                    {record.is_gl_line
                      ? ''
                      : getInvoiceValue(record, 'currency')}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{record.gl_amount}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>
                    {record.is_gl_line ? '' : getInvoiceValue(record, 'amount')}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>
                    {record.is_gl_line ? '' : getInvoiceValue(record, 'status')}
                  </Text>
                </View>
              </View>
            );
          })}
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

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
    setDownloadOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
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

  // Generate CSV with enhanced options
  const generateEnhancedCSV = () => {
    try {
      const currentDate = new Date().toLocaleString();
      let csvContent = 'data:text/csv;charset=utf-8,';

      // Add title and metadata
      csvContent += `"${title}"\n`;
      csvContent += `"Generated on: ${currentDate}"\n`;
      csvContent += `"Total Invoices: ${invoices?.results?.length || 0}"\n\n`;

      // Prepare headers
      let headers = [
        'Supplier Number',
        'Supplier Name',
        'Invoice Number',
        'Service Period',
        'Location',
        'Currency',
        'Total Amount',
        'Status',
      ];

      if (downloadOptions.includeOwnerDetails) {
        headers.splice(3, 0, 'Owner Name', 'Owner Email');
      }

      if (downloadOptions.expandGLLines) {
        headers.splice(
          -3,
          0,
          'GL Code',
          'GL Description',
          'Cost Center',
          'GL Amount'
        );
      }

      if (downloadOptions.includeTimestamps) {
        headers.push('Created Date', 'Updated Date');
      }

      csvContent += headers.map((h) => `"${h}"`).join(',') + '\n';

      // Process data
      (invoices?.results || []).forEach((invoice) => {
        const owner = getInvoiceOwner(invoice);
        const glLines = getGLLines(invoice);

        const baseData = {
          supplier_number: getInvoiceValue(invoice, 'supplier_number'),
          supplier_name: getInvoiceValue(invoice, 'supplier_name'),
          invoice_number: getInvoiceValue(invoice, 'invoice_number'),
          service_period: getInvoiceValue(invoice, 'service_period'),
          location: getInvoiceValue(invoice, 'location'),
          currency: getInvoiceValue(invoice, 'currency'),
          total_amount: getInvoiceValue(invoice, 'amount'),
          status: getInvoiceValue(invoice, 'status'),
          created_at: invoice?.created_at || invoice?.invoice?.created_at || '',
          updated_at: invoice?.updated_at || invoice?.invoice?.updated_at || '',
        };

        if (downloadOptions.expandGLLines && glLines.length > 0) {
          glLines.forEach((glLine, index) => {
            let row = [
              index === 0 ? baseData.supplier_number : '',
              index === 0 ? baseData.supplier_name : '',
              index === 0 ? baseData.invoice_number : '',
              index === 0 ? baseData.service_period : '',
              index === 0 ? baseData.location : '',
              glLine?.gl_code || '',
              glLine?.gl_description || '',
              glLine?.cost_center || '',
              glLine?.gl_amount || '',
              index === 0 ? baseData.currency : '',
              index === 0 ? baseData.total_amount : '',
              index === 0 ? baseData.status : '',
            ];

            if (downloadOptions.includeOwnerDetails) {
              row.splice(
                3,
                0,
                index === 0
                  ? `${owner?.firstname || ''} ${owner?.lastname || ''}`.trim()
                  : '',
                index === 0 ? owner?.email || '' : ''
              );
            }

            if (downloadOptions.includeTimestamps) {
              row.push(
                index === 0 ? baseData.created_at : '',
                index === 0 ? baseData.updated_at : ''
              );
            }

            csvContent += row.map((field) => `"${field}"`).join(',') + '\n';
          });
        } else {
          let row = [
            baseData.supplier_number,
            baseData.supplier_name,
            baseData.invoice_number,
            baseData.service_period,
            baseData.location,
            baseData.currency,
            baseData.total_amount,
            baseData.status,
          ];

          if (downloadOptions.includeOwnerDetails) {
            row.splice(
              3,
              0,
              `${owner?.firstname || ''} ${owner?.lastname || ''}`.trim(),
              owner?.email || ''
            );
          }

          if (downloadOptions.expandGLLines) {
            row.splice(-3, 0, '', '', '', '');
          }

          if (downloadOptions.includeTimestamps) {
            row.push(baseData.created_at, baseData.updated_at);
          }

          csvContent += row.map((field) => `"${field}"`).join(',') + '\n';
        }
      });

      // Create and trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `${title.replace(/\s+/g, '_')}_${
          new Date().toISOString().split('T')[0]
        }.csv`
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
    if (downloadType === 'csv') {
      generateEnhancedCSV();
    }
    // PDF download is handled by PDFDownloadLink component
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
        MenuListProps={{
          'aria-labelledby': 'download-button',
        }}
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
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
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
              {({ blob, url, loading, error }) => (
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
