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
    width: '8.33%', 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0,
    backgroundColor: '#00529B',
    color: '#FFFFFF',
    padding: 5,
    fontSize: 8,
    fontWeight: 'bold'
  },
  tableCol: { 
    width: '8.33%', 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderLeftWidth: 0, 
    borderTopWidth: 0,
    padding: 5,
    fontSize: 7
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

// PDF Document component
const InvoicePDF = ({ invoices, title = "My Invoices Report" }) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>{title}</Text>
        <Text style={styles.subheader}>Generated on: {new Date().toLocaleString()}</Text>
        
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
              <Text>PAY TERMS</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>STATUS</Text>
            </View>
          </View>
          
          {/* Table Data */}
          {invoices?.results?.map((invoice, index) => {
            // Process invoice data to handle different structures
            const processedData = {
              supplier_number: invoice?.supplier_number || invoice?.invoice?.supplier_number || '-',
              supplier_name: invoice?.supplier_name || invoice?.invoice?.supplier_name || '-',
              invoice_number: invoice?.invoice_number || invoice?.invoice?.invoice_number || '-',
              service_period: invoice?.service_period || invoice?.invoice?.service_period || '-',
              gl_code: invoice?.gl_code || invoice?.invoice?.gl_code || '-',
              gl_description: invoice?.gl_description || invoice?.invoice?.gl_description || '-',
              location: invoice?.location || invoice?.invoice?.location || '-',
              cost_center: invoice?.cost_center || invoice?.invoice?.cost_center || '-',
              currency: invoice?.currency || invoice?.invoice?.currency || '-',
              amount: invoice?.amount || invoice?.invoice?.amount || '-',
              payment_terms: invoice?.payment_terms || invoice?.invoice?.payment_terms || '-',
              status: invoice?.status || invoice?.invoice?.status || '-'
            };
            
            return (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text>{processedData.supplier_number}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{processedData.supplier_name}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{processedData.invoice_number}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{processedData.service_period}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{processedData.gl_code}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{processedData.gl_description}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{processedData.location}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{processedData.cost_center}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{processedData.currency}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{processedData.amount}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{processedData.payment_terms}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text>{processedData.status}</Text>
                </View>
              </View>
            );
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

  // Process data for CSV export
  const generateCSV = () => {
    try {
      // Create CSV header with title and date
      const currentDate = new Date().toLocaleString();
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add static title and generation date (on separate rows)
      csvContent += `"My Invoices Report"\n`;
      csvContent += `"Generated on: ${currentDate}"\n\n`;
      
      // Add column headers
      csvContent += "Supplier Number,Supplier Name,Invoice Number,Service Period,GL Code,GL Description,Location,Cost Center,Currency,Amount,Payment Terms,Status,Created Date\n";
      
      // Add rows data
      invoices?.results?.forEach(invoice => {
        const processedData = {
          supplier_number: invoice?.supplier_number || invoice?.invoice?.supplier_number || '',
          supplier_name: invoice?.supplier_name || invoice?.invoice?.supplier_name || '',
          invoice_number: invoice?.invoice_number || invoice?.invoice?.invoice_number || '',
          service_period: invoice?.service_period || invoice?.invoice?.service_period || '',
          gl_code: invoice?.gl_code || invoice?.invoice?.gl_code || '',
          gl_description: invoice?.gl_description || invoice?.invoice?.gl_description || '',
          location: invoice?.location || invoice?.invoice?.location || '',
          cost_center: invoice?.cost_center || invoice?.invoice?.cost_center || '',
          currency: invoice?.currency || invoice?.invoice?.currency || '',
          amount: invoice?.amount || invoice?.invoice?.amount || '',
          payment_terms: invoice?.payment_terms || invoice?.invoice?.payment_terms || '',
          status: invoice?.status || invoice?.invoice?.status || '',
          created_at: invoice?.created_at || invoice?.invoice?.created_at || ''
        };
        
        // Properly escape fields with commas
        const row = [
          `"${processedData.supplier_number}"`,
          `"${processedData.supplier_name}"`,
          `"${processedData.invoice_number}"`,
          `"${processedData.service_period}"`,
          `"${processedData.gl_code}"`,
          `"${processedData.gl_description}"`,
          `"${processedData.location}"`,
          `"${processedData.cost_center}"`,
          `"${processedData.currency}"`,
          `"${processedData.amount}"`,
          `"${processedData.payment_terms}"`,
          `"${processedData.status}"`,
          `"${processedData.created_at}"`
        ].join(',');
        
        csvContent += row + "\n";
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