import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  PDFViewer,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import qrcode from 'qrcode';
import backgroundImage from '../assets/images/background_download_form.jpg';

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    padding: 40,
    paddingTop: 100, // Leave space for the logo
    fontSize: 12,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    paddingBottom: 80, // Reduced padding to maximize space
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    objectFit: 'cover',
    zIndex: -1,
  },
  contentWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  headerSection: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  headerLabel: {
    fontWeight: 'bold',
    width: '40%',
  },
  headerValue: {
    width: '60%',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    width: '40%',
    fontWeight: 'bold',
  },
  detailValue: {
    width: '60%',
  },
  approvalWrapper: {
    marginTop: 20,
  },
  approvalSection: {
    flexDirection: 'row', // All approval blocks in one row
    flexWrap: 'wrap', // Allow wrapping to next line
    justifyContent: 'space-between', // Changed to space-between for better distribution
  },
  approvalBlockWrapper: {
    width: '30%', // Slightly reduced from 32% to give more margin between blocks
    marginBottom: 20, // Keep vertical spacing between rows
    marginHorizontal: '1.5%', // Add horizontal margin for better spacing
    break: 'avoid', // Prevents the block from splitting across pages
  },
  approvalBlock: {
    height: 200, // Increased height to accommodate QR codes better
    flexDirection: 'column',
    border: '1pt solid #CCCCCC',
    padding: 10, // Increased padding for better visual separation
    backgroundColor: '#FFFFFF',
    borderRadius: 4, // Slight rounding of corners for more modern look
  },
  approvalInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    padding: 5,
    minHeight: 60, // Slightly reduced to give more space to QR
    marginBottom: 10, // Increased space between info and QR
  },
  approvalContent: {
    breakInside: 'avoid',
  },
  approvalTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    marginBottom: 8, // Increased spacing
  },
  approvalName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  approvalDate: {
    fontSize: 10,
  },
  qrContainer: {
    height: 120, // Fixed height for QR container
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5, // Add a little padding at top
  },
  qrImage: {
    width: 110, // Increased QR code size
    height: 110, // Increased QR code size
    objectFit: 'contain', // Ensure QR code fits within container
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 10,
    fontStyle: 'italic',
  },
  documentsSection: {
    marginBottom: 20,
  },
  documentItem: {
    marginBottom: 5,
  },
});

// Updated ApprovalBlock with improved QR code handling and non-wrapping container
const ApprovalBlock = ({ title, name, date, qrDataURL }) => (
  <View style={styles.approvalBlockWrapper} wrap={false}>
    <View style={styles.approvalBlock}>
      <View style={styles.approvalContent}>
        <View style={styles.approvalInfo}>
          <Text style={styles.approvalTitle}>{title || ''}</Text>
          <Text style={styles.approvalName}>{name || ''}</Text>
          <Text style={styles.approvalDate}>{date || ''}</Text>
        </View>
        <View style={styles.qrContainer}>
          {qrDataURL ? (
            <Image 
              style={styles.qrImage} 
              src={qrDataURL} 
              cache={false} // Disable caching for better rendering
            />
          ) : (
            <Text style={{ fontSize: 10, color: '#999999', textAlign: 'center' }}>
              
            </Text>
          )}
        </View>
      </View>
    </View>
  </View>
);

// Modified helper function to include time (HH:MM) in the formatted string
const formatDateNoSlash = (dateString) => {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return ''; // Return empty string if date is invalid
    
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    // Returns string as MMDDYYYY HH:MM
    return `${month}${day}${year}${hours}${minutes}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

const MyDocument = ({ invoice, user }) => {
  // Make sure we have valid data before processing
  if (!invoice) return null;
  
  let allHistoryItems = invoice?.invoice_histories || [];

  // Filter out items with CEO or DCEO office emails
  const hasCeoOfficeEmail = allHistoryItems.some(
    (item) => item?.signer?.email === process.env.REACT_APP_CEO_OFFICE_EMAIL
  );
  const hasDceoOfficeEmail = allHistoryItems.some(
    (item) => item?.signer?.email === process.env.REACT_APP_DCEO_OFFICE_EMAIL
  );
  if (hasCeoOfficeEmail) {
    allHistoryItems = allHistoryItems.filter(
      (item) => item?.signer?.email !== process.env.REACT_APP_CEO_OFFICE_EMAIL
    );
  }
  if (hasDceoOfficeEmail) {
    allHistoryItems = allHistoryItems.filter(
      (item) => item?.signer?.email !== process.env.REACT_APP_DCEO_OFFICE_EMAIL
    );
  }

  // Get all signed items
  const signedItems = allHistoryItems?.filter(
    (item) => item.status === 'signed'
  ) || [];

  // Find the current approver - the last person in the workflow
  const toApprover =
    allHistoryItems.length > 0
      ? allHistoryItems[allHistoryItems.length - 1]
      : null;

  // Find the final approver - should be the last person in the workflow
  // AND they must have signed status
  const lastPersonInWorkflow = allHistoryItems[allHistoryItems.length - 1];
  const finalApprover = 
    lastPersonInWorkflow && lastPersonInWorkflow.status === 'signed' 
      ? lastPersonInWorkflow 
      : null;

  // The intermediate approvers should be all signed items except the final approver
  let intermediateApprovers = signedItems;
  if (finalApprover) {
    intermediateApprovers = signedItems.filter(item => item.id !== finalApprover.id);
  }
  
  // Safely prepare approval blocks
  // Always add prepared by first
  const preparedBy = {
    title: 'Prepared by',
    name: invoice?.invoice?.invoice_owner 
      ? `${invoice.invoice.invoice_owner.firstname || ''} ${invoice.invoice.invoice_owner.lastname || ''}` 
      : '',
    date: invoice?.invoice?.created_at
      ? new Date(invoice.invoice.created_at).toLocaleString()
      : '',
  };

  // Add intermediate approvers - MODIFIED: First approver is now "Verifier"
  const approvers = intermediateApprovers.map((item, index) => ({
    title: index === 0 ? 'Verifier' : `Approver ${index}`, // First approver is "Verifier", others are "Approver X"
    name: item?.signer 
      ? `${item.signer.firstname || ''} ${item.signer.lastname || ''}` 
      : '',
    date: item?.updated_at ? new Date(item.updated_at).toLocaleString() : '',
    qrDataURL: item?.qrDataURL || null,
  }));

  // Add final approver if exists and has signed
  const finalApproverBlock = finalApprover
    ? {
        title: 'Final Approver',
        name: finalApprover?.signer 
          ? `${finalApprover.signer.firstname || ''} ${finalApprover.signer.lastname || ''}` 
          : '',
        date: finalApprover?.updated_at
          ? new Date(finalApprover.updated_at).toLocaleString()
          : '',
        qrDataURL: finalApprover?.qrDataURL || null,
      }
    : null;

  // Combine all approvers into one array for rendering
  const allApprovers = [preparedBy, ...approvers];
  if (finalApproverBlock) {
    allApprovers.push(finalApproverBlock);
  }

  // Helper to chunk array into groups of 3 for better layout control
  const chunkArray = (array, size) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  };

  // Group approvers into rows of 3
  const approverRows = chunkArray(allApprovers, 3);

  // Access the actual invoice data (handles both response structures)
  const invoiceData = invoice?.invoice || invoice;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Image style={styles.backgroundImage} src={backgroundImage} fixed />
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>INVOICE DETAILS</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supplier Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Supplier Number:</Text>
              <Text style={styles.detailValue}>{invoiceData?.supplier_number || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Supplier Name:</Text>
              <Text style={styles.detailValue}>{invoiceData?.supplier_name || '-'}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invoice Number:</Text>
              <Text style={styles.detailValue}>{invoiceData?.invoice_number || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service Period:</Text>
              <Text style={styles.detailValue}>{invoiceData?.service_period || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>GL Code:</Text>
              <Text style={styles.detailValue}>{invoiceData?.gl_code || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>GL Description:</Text>
              <Text style={styles.detailValue}>{invoiceData?.gl_description || '-'}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{invoiceData?.location || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cost Center:</Text>
              <Text style={styles.detailValue}>{invoiceData?.cost_center || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Currency:</Text>
              <Text style={styles.detailValue}>{invoiceData?.currency || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>{invoiceData?.amount || '-'}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={styles.detailValue}>{invoiceData?.status || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created At:</Text>
              <Text style={styles.detailValue}>
                {invoiceData?.created_at ? new Date(invoiceData.created_at).toLocaleString() : '-'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Prepared By:</Text>
              <Text style={styles.detailValue}>
                {invoiceData?.invoice_owner 
                  ? `${invoiceData.invoice_owner.firstname || ''} ${invoiceData.invoice_owner.lastname || ''}` 
                  : '-'}
              </Text>
            </View>
          </View>
          
          {/* Documents section - Safely display only filename */}
          {invoiceData?.documents && invoiceData.documents.length > 0 && (
            <View style={styles.documentsSection}>
              <Text style={styles.sectionTitle}>Attached Documents</Text>
              {invoiceData.documents.map((doc, index) => {
                // Safely extract only the filename from the file_data path
                let displayName = `Document ${index + 1}`;
                
                try {
                  if (doc.filename) {
                    // If filename property exists, use it directly
                    displayName = doc.filename;
                  } else if (doc.file_data && typeof doc.file_data === 'string') {
                    // Try to extract just the filename from the path
                    const pathParts = doc.file_data.split('/');
                    if (pathParts.length > 0) {
                      let fileName = pathParts[pathParts.length - 1];
                      // If the path contains query parameters, remove them
                      if (fileName && fileName.includes('?')) {
                        fileName = fileName.split('?')[0];
                      }
                      if (fileName) {
                        displayName = fileName;
                      }
                    }
                  }
                } catch (error) {
                  console.error('Error processing document name:', error);
                  // Fall back to default name on error
                }
                
                return (
                  <View key={index} style={styles.documentItem}>
                    <Text>{`Document ${index + 1}: ${displayName}`}</Text>
                  </View>
                );
              })}
            </View>
          )}
          
          {/* Approvals section with improved layout and error handling */}
          <View style={styles.approvalWrapper}>
            <Text style={styles.sectionTitle}>Approvals</Text>
            {approverRows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.approvalSection}>
                {row.map((approver, idx) => (
                  <ApprovalBlock
                    key={`${rowIndex}-${idx}`}
                    title={approver.title || ''}
                    name={approver.name || ''}
                    date={approver.date || ''}
                    qrDataURL={approver.qrDataURL}
                  />
                ))}
                {/* Add empty blocks to maintain grid if row is not complete */}
                {row.length < 3 &&
                  Array(3 - row.length)
                    .fill()
                    .map((_, i) => (
                      <View key={`empty-${i}`} style={styles.approvalBlockWrapper} />
                    ))}
              </View>
            ))}
          </View>
          
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber || 1} of ${totalPages || 1}`
            }
            fixed
          />
        </View>
      </Page>
    </Document>
  );
};

const DownloadPdf = () => {
  const location = useLocation();
  const { invoice } = location.state || {};
  const [preparedInvoice, setPreparedInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON?.parse(localStorage?.getItem('user') || '{}');

  useEffect(() => {
    const prepareData = async () => {
      if (!invoice) {
        setError('No invoice data available');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        if (invoice?.invoice_histories && Array.isArray(invoice.invoice_histories)) {
          try {
            const updatedHistories = await Promise.all(
              invoice.invoice_histories.map(async (item) => {
                if (item?.status === 'signed' && item?.signature) {
                  try {
                    const public_key = item?.public_key
                      ?.replace('-----BEGIN PUBLIC KEY-----\n', '')
                      ?.replace('\n-----END PUBLIC KEY-----', '')
                      ?.replace(/\n/g, '');
                      
                    if (!public_key) return item;
                    
                    const url = `${process.env.REACT_APP_URL}/verify-signature/${
                      invoice?.invoice?.id || invoice?.id
                    }/${encodeURIComponent(public_key)}/${encodeURIComponent(
                      item.signature
                    )}`;
                    
                    // Generate QR code with improved settings
                    try {
                      const qrDataURL = await qrcode.toDataURL(url, {
                        errorCorrectionLevel: 'H',
                        type: 'image/png',
                        quality: 0.92,
                        margin: 2,
                      });
                      return { ...item, qrDataURL };
                    } catch (qrError) {
                      console.error('Error generating QR code:', qrError);
                      return item;
                    }
                  } catch (itemError) {
                    console.error('Error processing history item:', itemError);
                    return item;
                  }
                }
                return item;
              })
            );
            setPreparedInvoice({ ...invoice, invoice_histories: updatedHistories });
          } catch (historiesError) {
            console.error('Error processing invoice histories:', historiesError);
            setPreparedInvoice(invoice);
          }
        } else {
          setPreparedInvoice(invoice);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error preparing invoice data:', error);
        setError('Failed to prepare PDF data');
        setPreparedInvoice(invoice);
        setIsLoading(false);
      }
    };
    
    prepareData();
  }, [invoice]);

  if (isLoading) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>Loading PDF...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  if (!preparedInvoice) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        No invoice data available
      </div>
    );
  }

  // Wrap the PDF rendering in an error boundary
  try {
    return (
      <div style={{ width: '100%', height: '100vh' }}>
        <PDFViewer style={{ width: '100%', height: '100%' }}>
          <MyDocument invoice={preparedInvoice} user={user} />
        </PDFViewer>
      </div>
    );
  } catch (renderError) {
    console.error('Error rendering PDF:', renderError);
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>Error rendering PDF</div>
        <pre>{renderError.message}</pre>
      </div>
    );
  }
};

export default DownloadPdf;