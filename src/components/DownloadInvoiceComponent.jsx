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
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#001C64',
    fontWeight: 'bold',
  },
  subheader: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'left',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '4.17%',
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
    width: '4.17%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 3,
    fontSize: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: 'center',
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

// ── PDF Document ──────────────────────────────────────────────────────────────
// Creates separate rows for each GL line.
// invoice-level fields (amount, currency, status, quantity, payment info,
// created/updated) are shown ONLY on the LAST GL line row to avoid duplication.
const InvoicePDF = ({ invoices, title = 'My Invoices Report' }) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>{title}</Text>
        <Text style={styles.subheader}>
          Generated on: {new Date().toLocaleString()}
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
            <View style={styles.tableColHeader}>
              <Text>ORIGINAL AMOUNT (GL)</Text>
            </View>
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

          {/* Table Data */}
          {invoices?.results?.map((invoice, invoiceIndex) => {
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
                // Invoice-level fields shown only on the last GL line row
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
                    {/* GL fields — resolved from _detail */}
                    <View style={styles.tableCol}>
                      <Text>{resolveGLCode(glLine)}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{resolveLocation(glLine)}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{resolveCostCenter(glLine)}</Text>
                    </View>
                    {/* Invoice-level fields — only on last GL line to avoid duplication */}
                    <View style={styles.tableCol}>
                      <Text>{isLast ? baseData.currency : ''}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{isLast ? baseData.amount : ''}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      <Text>{glLine?.gl_amount || '-'}</Text>
                    </View>
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
              // No GL lines — single row with empty GL columns
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
                  <View style={styles.tableCol}>
                    <Text>-</Text>
                  </View>
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

        {/* Footer */}
        <Text style={styles.footer}>
          My Invoices Report • Page 1 of 1 • Generated by Invoice Management
          System
        </Text>
      </Page>
    </Document>
  );
};

// ── DownloadInvoiceComponent ──────────────────────────────────────────────────
const DownloadInvoiceComponent = ({
  invoices,
  title = 'My Invoices Report',
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handlePdfClick = () => {
    setShowPdfPreview(true);
    handleClose();
  };
  const handlePdfDialogClose = () => setShowPdfPreview(false);

  // ── CSV export ────────────────────────────────────────────────────────────
  // Each GL line gets its own row.
  // Invoice-level fields (amount, currency, status, quantity, payment info,
  // created/updated) appear ONLY on the LAST GL line row to avoid duplication.
  const generateCSV = () => {
    try {
      const currentDate = new Date().toLocaleString();
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += `"${title}"\n`;
      csvContent += `"Generated on: ${currentDate}"\n\n`;

      csvContent +=
        [
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
          'Original Amount (GL)',
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
        ].join(',') + '\n';

      const q = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

      invoices?.results?.forEach((invoice) => {
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
          status: invoice?.status || '',
          quantity: invoice?.quantity || '',
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
              q(glLine?.gl_amount || ''),
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
            q(''),
            q(''),
            q(''),
            q(baseData.currency),
            q(baseData.amount),
            q(''),
            q(baseData.exchange_rate),
            q(''),
            q(baseData.amount_in_usd),
            q(baseData.payment_terms),
            q(baseData.payment_due_date),
            q(baseData.status),
            q(baseData.quantity),
            q(''),
            q(''),
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
        `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      handleClose();
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Failed to generate CSV. Please try again.');
    }
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
        Download
      </Button>

      <Menu
        id="download-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'download-button' }}
      >
        <MenuItem onClick={handlePdfClick}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download as PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={generateCSV}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download as CSV</ListItemText>
        </MenuItem>
      </Menu>

      {/* PDF Preview Dialog */}
      <Dialog
        open={showPdfPreview}
        onClose={handlePdfDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Download PDF
          <IconButton
            aria-label="close"
            onClick={handlePdfDialogClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {invoices && invoices.results ? (
            <PDFDownloadLink
              document={<InvoicePDF invoices={invoices} title={title} />}
              fileName={`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`}
              style={{
                display: 'flex',
                justifyContent: 'center',
                textDecoration: 'none',
                padding: '10px',
                borderRadius: '4px',
                backgroundColor: '#00529B',
                color: 'white',
                width: '50%',
                margin: '20px auto',
              }}
            >
              {({ loading }) =>
                loading ? (
                  <>
                    <CircularProgress
                      size={20}
                      style={{ marginRight: '10px', color: 'white' }}
                    />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <PictureAsPdfIcon style={{ marginRight: '10px' }} />
                    Download PDF Report
                  </>
                )
              }
            </PDFDownloadLink>
          ) : (
            <p>No invoice data available to export</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePdfDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DownloadInvoiceComponent;
