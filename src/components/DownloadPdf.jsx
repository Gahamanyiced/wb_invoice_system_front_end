import { formatCurrencyAmount as _fca } from '../utils/formatAmount';
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

// ── COA data from DB instead of Excel file ────────────────────────────────────
import useCOAData from '../hooks/useCOAData';

// Payment terms — kept for getDescriptiveValue lookup (no API equivalent)
const paymentTermsOptions = [
  { value: 'net_30', label: 'Net 30 - Payment due within 30 days' },
  { value: 'net_45', label: 'Net 45 - Payment due within 45 days' },
  { value: 'net_60', label: 'Net 60 - Payment due within 60 days' },
  { value: 'net_90', label: 'Net 90 - Payment due within 90 days' },
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'end_of_month', label: 'End of Month' },
  { value: '15_mfg', label: '15 MFG - 15th of month following goods receipt' },
  {
    value: '15_mfi',
    label: '15 MFI - 15th of month following invoice receipt',
  },
  { value: 'custom', label: 'Custom - Enter your own terms' },
];

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    padding: 40,
    paddingTop: 100,
    fontSize: 12,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    paddingBottom: 80,
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
  contentWrapper: { flex: 1, display: 'flex', flexDirection: 'column' },
  headerSection: { marginBottom: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  headerLabel: { fontWeight: 'bold', width: '40%' },
  headerValue: { width: '60%' },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  detailRow: { flexDirection: 'row', marginBottom: 6 },
  detailLabel: { width: '40%', fontWeight: 'bold' },
  detailValue: { width: '60%' },
  glLinesSection: { marginBottom: 20 },
  glLineBlock: {
    border: '1pt solid #CCCCCC',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f9f9f9',
  },
  glLineHeader: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
    color: '#00529B',
  },
  glLineRow: { flexDirection: 'row', marginBottom: 4 },
  glLineLabel: { width: '35%', fontSize: 10, fontWeight: 'bold' },
  glLineValue: { width: '65%', fontSize: 10 },
  paymentSection: { marginBottom: 20 },
  approvalWrapper: { marginTop: 20 },
  approvalSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  approvalBlockWrapper: {
    width: '30%',
    marginBottom: 20,
    marginHorizontal: '1.5%',
    break: 'avoid',
  },
  approvalBlock: {
    height: 200,
    flexDirection: 'column',
    border: '1pt solid #CCCCCC',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  approvalInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    padding: 5,
    minHeight: 60,
    marginBottom: 10,
  },
  approvalContent: { breakInside: 'avoid' },
  approvalTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    marginBottom: 8,
  },
  approvalName: { fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
  approvalDate: { fontSize: 10 },
  qrContainer: {
    height: 120,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
  },
  qrImage: { width: 110, height: 110, objectFit: 'contain' },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 10,
    fontStyle: 'italic',
  },
  documentsSection: { marginBottom: 20 },
  documentItem: { marginBottom: 5 },
});

// ── ApprovalBlock — unchanged ─────────────────────────────────────────────────
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
            <Image style={styles.qrImage} src={qrDataURL} cache={false} />
          ) : (
            <Text
              style={{ fontSize: 10, color: '#999999', textAlign: 'center' }}
            />
          )}
        </View>
      </View>
    </View>
  </View>
);

const formatDateNoSlash = (dateString) => {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${month}${day}${year}${hours}${minutes}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

const formatCurrency = (amount, currency) => {
  if (!amount) return '-';
  return _fca(amount, currency) === '-' ? '-' : _fca(amount, currency);
};

// ── GL line _detail resolvers (used inside MyDocument) ───────────────────────
// API returns _detail nested objects alongside raw IDs.
// Always prefer _detail; fall back to raw value if detail is absent.

const resolveGLCode = (line) => {
  if (line?.gl_account_detail)
    return `${line.gl_account_detail.gl_code} - ${line.gl_account_detail.gl_description}`;
  return line?.gl_description || '-';
};

// GL Description: prefer gl_account_detail.gl_description (gl_description on
// the line itself is now null for new invoices — it was the old free-text field)
const resolveGLDescription = (line) => {
  if (line?.gl_account_detail?.gl_description)
    return line.gl_account_detail.gl_description;
  return line?.gl_description || '-';
};

const resolveCostCenter = (line) => {
  if (line?.cost_center_detail)
    return `${line.cost_center_detail.cc_code} - ${line.cost_center_detail.cc_description}`;
  return line?.cost_center ? String(line.cost_center) : '-';
};

const resolveLocation = (line) => {
  if (line?.location_detail)
    return `${line.location_detail.loc_code} - ${line.location_detail.loc_name}`;
  return line?.location ? String(line.location) : '-';
};

const resolveAircraftType = (line) => {
  if (line?.aircraft_type_detail)
    return `${line.aircraft_type_detail.code} - ${line.aircraft_type_detail.description}`;
  return line?.aircraft_type ? String(line.aircraft_type) : '-';
};

const resolveRoute = (line) => {
  if (line?.route_detail)
    return `${line.route_detail.code} - ${line.route_detail.description}`;
  return line?.route ? String(line.route) : '-';
};

// ── MyDocument ────────────────────────────────────────────────────────────────
const MyDocument = ({ invoice, user, excelData }) => {
  if (!invoice) return null;

  // getDescriptiveValue: only used for supplier_number and payment_terms
  // (those fields have no _detail equivalents in the API response)
  const getDescriptiveValue = (field, value) => {
    if (!value || value === '-') return '-';
    switch (field) {
      case 'payment_terms': {
        const pt = paymentTermsOptions.find((option) => option.value === value);
        return pt ? pt.label : value;
      }
      case 'supplier_number': {
        const supplier = excelData?.suppliers?.find(
          (item) => item.value === value,
        );
        return supplier ? supplier.label : value;
      }
      default:
        return value;
    }
  };

  let allHistoryItems = invoice?.invoice_histories || [];

  const hasCeoOfficeEmail = allHistoryItems.some(
    (item) => item?.signer?.email === process.env.REACT_APP_CEO_OFFICE_EMAIL,
  );
  const hasDceoOfficeEmail = allHistoryItems.some(
    (item) => item?.signer?.email === process.env.REACT_APP_DCEO_OFFICE_EMAIL,
  );
  if (hasCeoOfficeEmail)
    allHistoryItems = allHistoryItems.filter(
      (item) => item?.signer?.email !== process.env.REACT_APP_CEO_OFFICE_EMAIL,
    );
  if (hasDceoOfficeEmail)
    allHistoryItems = allHistoryItems.filter(
      (item) => item?.signer?.email !== process.env.REACT_APP_DCEO_OFFICE_EMAIL,
    );

  const signedItems =
    allHistoryItems?.filter((item) => item.status === 'signed') || [];

  const lastPersonInWorkflow = allHistoryItems[allHistoryItems.length - 1];
  const finalApprover =
    lastPersonInWorkflow && lastPersonInWorkflow.status === 'signed'
      ? lastPersonInWorkflow
      : null;

  let intermediateApprovers = signedItems;
  if (finalApprover) {
    intermediateApprovers = signedItems.filter(
      (item) => item.id !== finalApprover.id,
    );
  }

  const preparedBy = {
    title: 'Prepared by',
    name: invoice?.invoice?.invoice_owner
      ? `${invoice.invoice.invoice_owner.firstname || ''} ${invoice.invoice.invoice_owner.lastname || ''}`
      : '',
    date: invoice?.invoice?.created_at
      ? new Date(invoice.invoice.created_at).toLocaleString()
      : '',
  };

  const approvers = intermediateApprovers.map((item, index) => ({
    title: index === 0 ? 'Verifier' : `Approver ${index}`,
    name: item?.signer
      ? `${item.signer.firstname || ''} ${item.signer.lastname || ''}`
      : '',
    date: item?.updated_at ? new Date(item.updated_at).toLocaleString() : '',
    qrDataURL: item?.qrDataURL || null,
  }));

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

  const allApprovers = [preparedBy, ...approvers];
  if (finalApproverBlock) allApprovers.push(finalApproverBlock);

  const chunkArray = (array, size) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size)
      chunked.push(array.slice(i, i + size));
    return chunked;
  };

  const approverRows = chunkArray(allApprovers, 3);
  const invoiceData = invoice?.invoice || invoice;
  const glLines = invoiceData?.gl_lines || [];

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Image style={styles.backgroundImage} src={backgroundImage} fixed />
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>INVOICE DETAILS</Text>

          {/* Supplier Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supplier Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Supplier Number:</Text>
              <Text style={styles.detailValue}>
                {getDescriptiveValue(
                  'supplier_number',
                  invoiceData?.supplier_number,
                ) || '-'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Supplier Name:</Text>
              <Text style={styles.detailValue}>
                {invoiceData?.supplier_name || '-'}
              </Text>
            </View>
          </View>

          {/* Invoice Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invoice Number:</Text>
              <Text style={styles.detailValue}>
                {invoiceData?.invoice_number || '-'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reference:</Text>
              <Text style={styles.detailValue}>
                {invoiceData?.reference || '-'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invoice Date:</Text>
              <Text style={styles.detailValue}>
                {(() => {
                  try {
                    return invoiceData?.invoice_date
                      ? new Date(invoiceData.invoice_date).toLocaleDateString()
                      : '-';
                  } catch {
                    return invoiceData?.invoice_date || '-';
                  }
                })()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service Period:</Text>
              <Text style={styles.detailValue}>
                {invoiceData?.service_period || '-'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quantity:</Text>
              <Text style={styles.detailValue}>
                {invoiceData?.quantity || '-'}
              </Text>
            </View>
          </View>

          {/* GL Lines */}
          {glLines && glLines.length > 0 && (
            <View style={styles.glLinesSection}>
              <Text style={styles.sectionTitle}>
                GL Lines ({glLines.length})
              </Text>
              {glLines.map((line, index) => (
                <View key={index} style={styles.glLineBlock} wrap={false}>
                  <Text style={styles.glLineHeader}>GL Line {index + 1}</Text>

                  {/* GL Code — from _detail */}
                  <View style={styles.glLineRow}>
                    <Text style={styles.glLineLabel}>GL Code:</Text>
                    <Text style={styles.glLineValue}>
                      {resolveGLCode(line)}
                    </Text>
                  </View>

                  {/* GL Description — from gl_account_detail, fallback to legacy gl_description */}
                  <View style={styles.glLineRow}>
                    <Text style={styles.glLineLabel}>Description:</Text>
                    <Text style={styles.glLineValue}>
                      {resolveGLDescription(line)}
                    </Text>
                  </View>

                  {/* Cost Center — from _detail */}
                  <View style={styles.glLineRow}>
                    <Text style={styles.glLineLabel}>Cost Center:</Text>
                    <Text style={styles.glLineValue}>
                      {resolveCostCenter(line)}
                    </Text>
                  </View>

                  {/* Location — from _detail */}
                  <View style={styles.glLineRow}>
                    <Text style={styles.glLineLabel}>Location:</Text>
                    <Text style={styles.glLineValue}>
                      {resolveLocation(line)}
                    </Text>
                  </View>

                  {/* Aircraft Type — from _detail */}
                  <View style={styles.glLineRow}>
                    <Text style={styles.glLineLabel}>Aircraft Type:</Text>
                    <Text style={styles.glLineValue}>
                      {resolveAircraftType(line)}
                    </Text>
                  </View>

                  {/* Route — from _detail */}
                  <View style={styles.glLineRow}>
                    <Text style={styles.glLineLabel}>Route:</Text>
                    <Text style={styles.glLineValue}>{resolveRoute(line)}</Text>
                  </View>

                  {/* Amount */}
                  <View style={styles.glLineRow}>
                    <Text style={styles.glLineLabel}>Amount:</Text>
                    <Text style={styles.glLineValue}>
                      {formatCurrency(line?.gl_amount, invoiceData?.currency)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Legacy GL Information — no gl_lines */}
          {(!glLines || glLines.length === 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>GL Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>GL Code:</Text>
                <Text style={styles.detailValue}>
                  {invoiceData?.gl_description || '-'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>GL Description:</Text>
                <Text style={styles.detailValue}>
                  {invoiceData?.gl_description || '-'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cost Center:</Text>
                <Text style={styles.detailValue}>
                  {invoiceData?.cost_center
                    ? String(invoiceData.cost_center)
                    : '-'}
                </Text>
              </View>
            </View>
          )}

          {/* Financial Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financial Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Currency:</Text>
              <Text style={styles.detailValue}>
                {invoiceData?.currency || '-'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount:</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(invoiceData?.amount, invoiceData?.currency)}
              </Text>
            </View>
          </View>

          {/* Payment Information */}
          {(invoiceData?.payment_terms || invoiceData?.payment_due_date) && (
            <View style={styles.paymentSection}>
              <Text style={styles.sectionTitle}>Payment Information</Text>
              {invoiceData?.payment_terms && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Terms:</Text>
                  <Text style={styles.detailValue}>
                    {getDescriptiveValue(
                      'payment_terms',
                      invoiceData.payment_terms,
                    )}
                  </Text>
                </View>
              )}
              {invoiceData?.payment_due_date && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Due Date:</Text>
                  <Text style={styles.detailValue}>
                    {(() => {
                      try {
                        return new Date(
                          invoiceData.payment_due_date,
                        ).toLocaleDateString();
                      } catch {
                        return invoiceData.payment_due_date;
                      }
                    })()}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Status Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={styles.detailValue}>
                {invoiceData?.status || '-'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created At:</Text>
              <Text style={styles.detailValue}>
                {(() => {
                  try {
                    return invoiceData?.created_at
                      ? new Date(invoiceData.created_at).toLocaleString()
                      : '-';
                  } catch {
                    return invoiceData?.created_at || '-';
                  }
                })()}
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

          {/* Documents */}
          {invoiceData?.documents && invoiceData.documents.length > 0 && (
            <View style={styles.documentsSection}>
              <Text style={styles.sectionTitle}>Attached Documents</Text>
              {invoiceData.documents.map((doc, index) => {
                let displayName = `Document ${index + 1}`;
                try {
                  if (doc.filename) {
                    displayName = doc.filename;
                  } else if (
                    doc.file_data &&
                    typeof doc.file_data === 'string'
                  ) {
                    const pathParts = doc.file_data.split('/');
                    if (pathParts.length > 0) {
                      let fileName = pathParts[pathParts.length - 1];
                      if (fileName && fileName.includes('?'))
                        fileName = fileName.split('?')[0];
                      if (fileName) displayName = fileName;
                    }
                  }
                } catch (error) {
                  console.error('Error processing document name:', error);
                }
                return (
                  <View key={index} style={styles.documentItem}>
                    <Text>{`Document ${index + 1}: ${displayName}`}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Approvals */}
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
                {row.length < 3 &&
                  Array(3 - row.length)
                    .fill()
                    .map((_, i) => (
                      <View
                        key={`empty-${i}`}
                        style={styles.approvalBlockWrapper}
                      />
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

// ══ DownloadPdf page component ════════════════════════════════════════════════
const DownloadPdf = () => {
  const location = useLocation();
  const { invoice } = location.state || {};

  const [preparedInvoice, setPreparedInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON?.parse(localStorage?.getItem('user') || '{}');

  const { excelData, isLoading: coaLoading } = useCOAData();

  const isLoading = invoiceLoading || coaLoading;

  useEffect(() => {
    const prepareData = async () => {
      if (!invoice) {
        setError('No invoice data available');
        setInvoiceLoading(false);
        return;
      }

      try {
        setInvoiceLoading(true);

        if (
          invoice?.invoice_histories &&
          Array.isArray(invoice.invoice_histories)
        ) {
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
                    }/${encodeURIComponent(public_key)}/${encodeURIComponent(item.signature)}`;

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
              }),
            );
            setPreparedInvoice({
              ...invoice,
              invoice_histories: updatedHistories,
            });
          } catch (historiesError) {
            console.error(
              'Error processing invoice histories:',
              historiesError,
            );
            setPreparedInvoice(invoice);
          }
        } else {
          setPreparedInvoice(invoice);
        }

        setInvoiceLoading(false);
      } catch (err) {
        console.error('Error preparing invoice data:', err);
        setError('Failed to prepare PDF data');
        setPreparedInvoice(invoice);
        setInvoiceLoading(false);
      }
    };

    prepareData();
  }, [invoice]);

  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>Loading PDF...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {coaLoading ? 'Loading reference data...' : 'Preparing invoice...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>Error: {error}</div>
      </div>
    );
  }

  if (!preparedInvoice) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        No invoice data available
      </div>
    );
  }

  try {
    return (
      <div style={{ width: '100%', height: '100vh' }}>
        <PDFViewer style={{ width: '100%', height: '100%' }}>
          <MyDocument
            invoice={preparedInvoice}
            user={user}
            excelData={excelData}
          />
        </PDFViewer>
      </div>
    );
  } catch (renderError) {
    console.error('Error rendering PDF:', renderError);
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>Error rendering PDF</div>
        <pre>{renderError.message}</pre>
      </div>
    );
  }
};

export default DownloadPdf;
