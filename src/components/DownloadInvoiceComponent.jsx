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
  CircularProgress
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
  StyleSheet
} from '@react-pdf/renderer';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#001C64',
    fontWeight: 'bold'
  },
  subheader: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'left'
  },
  table: { 
    display: 'flex', 
    width: 'auto', 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderRightWidth: 0, 
    borderBottomWidth: 0 
  },
  tableRow: { 
    margin: 'auto', 
    flexDirection: 'row' 
  },
  tableColHeader: { 
    width: '4.76%',
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0,
    backgroundColor: '#00529B',
    color: '#FFFFFF',
    padding: 3,
    fontSize: 6,
    fontWeight: 'bold'
  },
  tableCol: { 
    width: '4.76%',
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0,
    padding: 3,
    fontSize: 5
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: 'center'
  }
});

// PDF Document component - creates separate rows for each GL line
const InvoicePDF = ({ invoices, title = "My Invoices Report" }) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>{title}</Text>
        <Text style={styles.subheader}>Generated on: {new Date().toLocaleString()}</Text>
        
        {/* Table Header with all fields */}
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
              <Text>GL CODE</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>GL DESCRIPTION</Text>
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
              <Text>AMOUNT</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>GL AMOUNT</Text>
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
          
          {/* Table Data - Create separate row for each GL line */}
          {invoices?.results?.map((invoice, invoiceIndex) => {
            const baseData = {
              supplier_number: invoice?.supplier_number || '-',
              supplier_name: invoice?.supplier_name || '-',
              invoice_number: invoice?.invoice_number || '-',
              reference: invoice?.reference || '-',
              invoice_date: invoice?.invoice_date || '-',
              service_period: invoice?.service_period || '-',
              location: invoice?.location || '-',
              currency: invoice?.currency || '-',
              amount: invoice?.amount || '-',
              payment_terms: invoice?.payment_terms || '-',
              payment_due_date: invoice?.payment_due_date || '-',
              quantity: invoice?.quantity || '-',
              aircraft_type: invoice?.aircraft_type || '-',
              route: invoice?.route || '-',
              status: invoice?.status || '-',
              created_at: invoice?.created_at ? new Date(invoice.created_at).toLocaleDateString() : '-',
              updated_at: invoice?.updated_at ? new Date(invoice.updated_at).toLocaleDateString() : '-'
            };

            // If invoice has GL lines, create a row for each GL line
            if (invoice?.gl_lines && invoice.gl_lines.length > 0) {
              return invoice.gl_lines.map((glLine, glIndex) => (
                <View key={`${invoiceIndex}-${glIndex}`} style={styles.tableRow}>
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
                    <Text>{glLine?.gl_code || '-'}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{glLine?.gl_description || '-'}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{baseData.location}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{glLine?.cost_center || '-'}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{baseData.currency}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{baseData.amount}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{glLine?.gl_amount || '-'}</Text>
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
                    <Text>{baseData.aircraft_type}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{baseData.route}</Text>
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
              ));
            } else {
              // If no GL lines, create a single row with empty GL data
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
                    <Text>{baseData.location}</Text>
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
                    <Text>{baseData.payment_terms}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{baseData.payment_due_date}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{baseData.quantity}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{baseData.aircraft_type}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text>{baseData.route}</Text>
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
          My Invoices Report • Page 1 of 1 • Generated by Invoice Management System
        </Text>
      </Page>
    </Document>
  );
};

const DownloadInvoiceComponent = ({ invoices, title = "My Invoices Report" }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePdfClick = () => {
    setShowPdfPreview(true);
    handleClose();
  };

  const handlePdfDialogClose = () => {
    setShowPdfPreview(false);
  };

  // Process data for CSV export - create separate rows for each GL line
  const generateCSV = () => {
    try {
      // Create CSV header with title and date
      const currentDate = new Date().toLocaleString();
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add static title and generation date (on separate rows)
      csvContent += `"My Invoices Report"\n`;
      csvContent += `"Generated on: ${currentDate}"\n\n`;
      
      // Add column headers
      csvContent += [
        "Supplier Number",
        "Supplier Name", 
        "Invoice Number",
        "Reference",
        "Invoice Date",
        "Service Period",
        "GL Code",
        "GL Description",
        "Location",
        "Cost Center",
        "Currency",
        "Amount",
        "GL Amount",
        "Payment Terms",
        "Payment Due Date",
        "Status",
        "Quantity",
        "Aircraft Type",
        "Route",
        "Created Date",
        "Updated Date"
      ].join(',') + "\n";
      
      // Add rows data - create separate row for each GL line
      invoices?.results?.forEach(invoice => {
        const baseData = {
          supplier_number: invoice?.supplier_number || '',
          supplier_name: invoice?.supplier_name || '',
          invoice_number: invoice?.invoice_number || '',
          reference: invoice?.reference || '',
          invoice_date: invoice?.invoice_date || '',
          service_period: invoice?.service_period || '',
          location: invoice?.location || '',
          currency: invoice?.currency || '',
          amount: invoice?.amount || '',
          payment_terms: invoice?.payment_terms || '',
          payment_due_date: invoice?.payment_due_date || '',
          status: invoice?.status || '',
          quantity: invoice?.quantity || '',
          aircraft_type: invoice?.aircraft_type || '',
          route: invoice?.route || '',
          created_at: invoice?.created_at ? new Date(invoice.created_at).toLocaleDateString() : '',
          updated_at: invoice?.updated_at ? new Date(invoice.updated_at).toLocaleDateString() : ''
        };

        // If invoice has GL lines, create a row for each GL line
        if (invoice?.gl_lines && invoice.gl_lines.length > 0) {
          invoice.gl_lines.forEach(glLine => {
            const row = [
              `"${baseData.supplier_number}"`,
              `"${baseData.supplier_name}"`,
              `"${baseData.invoice_number}"`,
              `"${baseData.reference}"`,
              `"${baseData.invoice_date}"`,
              `"${baseData.service_period}"`,
              `"${glLine?.gl_code || ''}"`,
              `"${glLine?.gl_description || ''}"`,
              `"${baseData.location}"`,
              `"${glLine?.cost_center || ''}"`,
              `"${baseData.currency}"`,
              `"${baseData.amount}"`,
              `"${glLine?.gl_amount || ''}"`,
              `"${baseData.payment_terms}"`,
              `"${baseData.payment_due_date}"`,
              `"${baseData.status}"`,
              `"${baseData.quantity}"`,
              `"${baseData.aircraft_type}"`,
              `"${baseData.route}"`,
              `"${baseData.created_at}"`,
              `"${baseData.updated_at}"`
            ].join(',');
            
            csvContent += row + "\n";
          });
        } else {
          // If no GL lines, create a single row with empty GL data
          const row = [
            `"${baseData.supplier_number}"`,
            `"${baseData.supplier_name}"`,
            `"${baseData.invoice_number}"`,
            `"${baseData.reference}"`,
            `"${baseData.invoice_date}"`,
            `"${baseData.service_period}"`,
            `""`,
            `""`,
            `"${baseData.location}"`,
            `""`,
            `"${baseData.currency}"`,
            `"${baseData.amount}"`,
            `""`,
            `"${baseData.payment_terms}"`,
            `"${baseData.payment_due_date}"`,
            `"${baseData.status}"`,
            `"${baseData.quantity}"`,
            `"${baseData.aircraft_type}"`,
            `"${baseData.route}"`,
            `"${baseData.created_at}"`,
            `"${baseData.updated_at}"`
          ].join(',');
          
          csvContent += row + "\n";
        }
      });
      
      // Create and trigger download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `My_Invoices_Report_${new Date().toISOString().split('T')[0]}.csv`);
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
        MenuListProps={{
          'aria-labelledby': 'download-button',
        }}
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
                margin: '20px auto'
              }}
            >
              {({ blob, url, loading, error }) => 
                loading ? 
                <>
                  <CircularProgress size={20} style={{ marginRight: '10px', color: 'white' }} />
                  Generating PDF...
                </> : 
                <>
                  <PictureAsPdfIcon style={{ marginRight: '10px' }} />
                  Download PDF Report
                </>
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