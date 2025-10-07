import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  Paper,
  TableContainer,
  TableCell,
  Stack,
  Pagination,
  Box,
  Tooltip,
  Chip,
} from '@mui/material';
import { toast } from 'react-toastify';
import InvoiceModal from '../components/InvoiceModal';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RootLayout from '../layouts/RootLayout';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { useNavigate } from 'react-router-dom';
import {
  getAllApprovedInvoices,
  getAllDeniedInvoices,
  getAllForwardedInvoices,
  getAllInvoice,
  getAllInvoicesWithToSignStatus,
  getAllOwnApprovedInvoicesToSign,
  getAllOwnDeniedInvoicesToSign,
  getAllOwnPendingInvoicesToSign,
  getAllOwnProcessingInvoicesToSign,
  getAllOwnRollbackedInvoicesToSign,
  getAllPendingInvoices,
  getAllProcessingInvoices,
  getAllRollBackedInvoices,
  getAllSignedInvoices,
  getInvoiceByUser,
  getUserApprovedInvoices,
  getUserDeniedInvoices,
  getUserForwardedInvoices,
  getUserPendingInvoices,
  getUserProcessingInvoices,
  getUserRollBackedInvoices,
} from '../features/invoice/invoiceSlice';
import ViewInvoiceModal from '../components/ViewInvoiceModal';
import UpdateInvoiceModal from '../components/UpdateInvoiceModal';
import DeleteInvoiceDialog from '../components/DeleteInvoiceDialog';
import InvoiceTracking from './InvoiceTracking';
import { getInvoiceToSign } from '../features/invoice/invoiceSlice';
import FilterPanel from '../components/global/FilterPanel';
import { setFilters } from '../features/invoice/invoiceSlice';
import DownloadInvoiceComponent from '../components/DownloadInvoiceComponent';
import { getAllUsersWithNoPagination } from '../features/user/userSlice';

const styles = {
  table: {
    minWidth: 650,
    maxWidth: '90vw',
    margin: 'auto',
  },
  header: {
    color: '#00529B',
    fontSize: '14px',
    textAlign: 'left',
  },
  rowChip: {
    width: '100px',
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '0 8px',
    fontSize: '12px',
    bgcolor: '#00529B',
    color: 'white',
  },
  rowChipDelete: {
    width: '100px',
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '0 8px',
    fontSize: '12px',
    bgcolor: '#FF5733',
    color: 'white',
  },
  expandedRow: {
    backgroundColor: '#f5f5f5',
  },
  totalAmountCell: {
    fontWeight: 'bold',
    color: '#00529B',
  },
};

export default function Invoice() {
  const [closeInvoiceTrackingModalTrigger, setCloseInvoiceTrackingTrigger] =
    useState(false);
  const { allUsers } = useSelector((state) => state.user);
  const { invoices, index, filters } = useSelector((state) => state.invoice);
  console.log('invoices', invoices);
  const { cardIndex, year } = useSelector((state) => state.invoiceDashboard);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState();
  const [openView, setOpenView] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState();
  const [openDelete, setOpenDelete] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState();
  const [selectedTracking, setSelectedTracking] = useState();
  const [openTracking, setOpenTracking] = useState(false);
  const [user, setUser] = useState(JSON?.parse(localStorage?.getItem('user')));
  const [searchQuery, setSearchQuery] = useState();
  const [page, setPage] = useState(1);
  const [indexInvoice, setIndexInvoice] = useState();
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [hoverView, setHoverView] = useState(false);
  const [hoverEdit, setHoverEdit] = useState(false);
  const [hoverDelete, setHoverDelete] = useState(false);
  const [hoverTrack, setHoverTrack] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Helper function to normalize invoice data structure
  const normalizeInvoiceData = (item) => {
    // Check if invoice data is nested under 'invoice' property
    if (item.invoice) {
      return {
        ...item.invoice,
        // Preserve top-level properties that might be needed
        row_number: item.row_number,
        signer: item.signer,
        // Use nested status if available, otherwise fall back to top-level
        status: item.status || item.invoice.status,
        created_at: item.created_at || item.invoice.created_at,
        updated_at: item.updated_at || item.invoice.updated_at,
      };
    }
    // If data is already flat, return as is
    return item;
  };

  // Helper function to get GL lines - now supports both structures
  const getGLLines = (invoice) => {
    const normalized = normalizeInvoiceData(invoice);
    return normalized?.gl_lines || [];
  };

  // Helper function to get documents
  const getDocuments = (invoice) => {
    const normalized = normalizeInvoiceData(invoice);
    return normalized?.documents || [];
  };

  // Helper function to get invoice owner information
  const getInvoiceOwner = (invoice) => {
    const normalized = normalizeInvoiceData(invoice);
    return normalized?.invoice_owner || {};
  };

  const filterData = (query, result) => {
    if (!query) {
      return result?.results;
    } else {
      const data = result?.results?.filter((item) => {
        const normalized = normalizeInvoiceData(item);
        const owner = normalized?.invoice_owner || {};
        return (
          normalized?.created_at?.includes(query) ||
          normalized?.supplier_name
            ?.toLowerCase()
            ?.includes(query?.toLowerCase()) ||
          normalized?.supplier_number
            ?.toLowerCase()
            ?.includes(query?.toLowerCase()) ||
          normalized?.status?.toLowerCase()?.includes(query?.toLowerCase()) ||
          normalized?.invoice_number
            ?.toLowerCase()
            ?.includes(query?.toLowerCase()) ||
          owner?.firstname?.toLowerCase()?.includes(query?.toLowerCase()) ||
          owner?.lastname?.toLowerCase()?.includes(query?.toLowerCase())
        );
      });
      return data;
    }
  };

  const dataFiltered = filterData(searchQuery, invoices);

  const getInvoiceIndex = () => {
    if (user?.role === 'admin') {
      return index || 1;
    } else if (user?.role === 'signer' || user?.role === 'signer_admin') {
      return index || 3;
    } else {
      return index || 2;
    }
  };

  const dispatchInvoices = () => {
    const invoiceIndex = getInvoiceIndex();
    const params = { page, year, ...filters };
    setIndexInvoice(invoiceIndex);

    if (!user) return;

    if (user.role === 'admin' && invoiceIndex === 1) {
      switch (cardIndex) {
        case 1:
          dispatch(getAllInvoice(params));
          break;
        case 2:
          dispatch(getAllPendingInvoices({ page, year }));
          break;
        case 3:
          dispatch(getAllApprovedInvoices({ page, year }));
          break;
        case 4:
          dispatch(getAllDeniedInvoices({ page, year }));
          break;
        case 5:
          dispatch(getAllRollBackedInvoices({ page, year }));
          break;
        case 6:
          dispatch(getAllProcessingInvoices({ page, year }));
          break;
        case 9:
          dispatch(getAllForwardedInvoices({ page, year }));
          break;
        default:
          dispatch(getAllInvoice(params));
      }
    } else if (
      (user?.role === 'signer' || user?.role === 'signer_admin') &&
      invoiceIndex === 3
    ) {
      switch (cardIndex) {
        case 1:
          dispatch(getInvoiceToSign(params));
          break;
        case 2:
          dispatch(getAllOwnPendingInvoicesToSign({ page, year }));
          break;
        case 4:
          dispatch(getAllOwnDeniedInvoicesToSign({ page, year }));
          break;
        case 7:
          dispatch(getAllInvoicesWithToSignStatus({ page, year }));
          break;
        case 8:
          dispatch(getAllSignedInvoices({ page, year }));
          break;
        default:
          dispatch(getInvoiceToSign(params));
      }
    } else if (invoiceIndex === 2) {
      switch (cardIndex) {
        case 1:
          dispatch(getInvoiceByUser(params));
          break;
        case 2:
          dispatch(getUserPendingInvoices({ page, year }));
          break;
        case 3:
          dispatch(getUserApprovedInvoices({ page, year }));
          break;
        case 4:
          dispatch(getUserDeniedInvoices({ page, year }));
          break;
        case 5:
          dispatch(getUserRollBackedInvoices({ page, year }));
          break;
        case 6:
          dispatch(getUserProcessingInvoices({ page, year }));
          break;
        case 9:
          dispatch(getUserForwardedInvoices({ page, year }));
          break;
        default:
          dispatch(getInvoiceByUser(params));
      }
    }
  };

  useEffect(() => {
    dispatch(getAllUsersWithNoPagination());
  }, [dispatch]);

  useEffect(() => {
    try {
      dispatchInvoices();
    } catch (error) {
      toast.error(error);
      navigate('/');
    }
  }, [
    dispatch,
    index,
    page,
    user,
    updateTrigger,
    closeInvoiceTrackingModalTrigger,
    cardIndex,
    filters,
  ]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleUpdate = (data) => {
    if (
      ((user?.role === 'staff' ||
        user?.role === 'supplier' ||
        user?.role === 'signer_admin') &&
        isInvoiceEditable(data)) ||
      (user?.role === 'admin' &&
        indexInvoice === 2 &&
        isInvoiceEditable(data)) ||
      (user?.role === 'signer' && indexInvoice === 2 && isInvoiceEditable(data))
    ) {
      setSelectedUpdate(data);
      setOpenUpdate(true);
    } else {
      toast.error('You are not allowed to update the invoice');
    }
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
    setSelectedUpdate();
  };

  const handleView = (data) => {
    setSelectedView(data);
    setOpenView(true);
  };

  const handleCloseView = () => {
    setOpenView(false);
    setSelectedView();
  };

  const handleDelete = (data) => {
    const status = data?.status;
    if (indexInvoice === 2 && (status === 'pending' || status === 'denied')) {
      setSelectedDelete(data);
      setOpenDelete(true);
    } else {
      toast.error('You are allowed to delete your pending & denied invoice');
    }
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setSelectedDelete();
  };

  const handleInvoiceTracking = (data) => {
    setSelectedTracking(data);
    setOpenTracking(true);
  };

  const handleCloseTracking = async () => {
    setOpenTracking(false);
    setCloseInvoiceTrackingTrigger((prev) => !prev);
    setSelectedTracking();
  };

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const isInvoiceEditable = (invoice) => {
    const normalized = normalizeInvoiceData(invoice);
    const status = normalized?.status;
    return (
      status === 'pending' || status === 'rollback' || status === 'to sign'
    );
  };

  const toggleRowExpansion = (invoiceId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(invoiceId)) {
      newExpandedRows.delete(invoiceId);
    } else {
      newExpandedRows.add(invoiceId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Helper function to get GL lines display
  const getGLLinesDisplay = (invoice, isExpanded = false) => {
    const glLines = getGLLines(invoice);
    if (glLines.length === 0)
      return {
        code: '-',
        description: '-',
        costCenter: '-',
        amount: '-',
        location: '-',
        aircraftType: '-',
        route: '-',
      };

    if (glLines.length === 1 || !isExpanded) {
      const firstLine = glLines[0];
      return {
        code: firstLine?.gl_code || '-',
        description: firstLine?.gl_description || '-',
        costCenter: firstLine?.cost_center || '-',
        amount: firstLine?.gl_amount || '-',
        location: firstLine?.location || '-',
        aircraftType: firstLine?.aircraft_type || '-',
        route: firstLine?.route || '-',
      };
    }

    // For multiple lines, show summary
    const totalAmount = glLines.reduce(
      (sum, line) => sum + parseFloat(line?.gl_amount || 0),
      0
    );
    return {
      code: `${glLines.length} lines`,
      description: `Multiple GL accounts`,
      costCenter: `Multiple centers`,
      amount: totalAmount.toFixed(2),
      location: 'Multiple',
      aircraftType: 'Multiple',
      route: 'Multiple',
    };
  };

  // Helper function to calculate and format total amount
  const getTotalAmount = (invoice) => {
    const normalized = normalizeInvoiceData(invoice);
    // First try to get from amount field
    const amount = normalized?.amount;
    if (amount) {
      return parseFloat(amount).toFixed(2);
    }

    // If no direct amount, calculate from GL lines
    const glLines = getGLLines(invoice);
    if (glLines.length > 0) {
      const total = glLines.reduce(
        (sum, line) => sum + parseFloat(line?.gl_amount || 0),
        0
      );
      return total.toFixed(2);
    }

    return '-';
  };

  // Helper function to format currency with amount
  const formatCurrencyAmount = (amount, currency) => {
    if (amount === '-' || !amount) return '-';
    return `${currency || ''} ${amount}`;
  };

  // Generate dynamic options from allUsers
  const userOptions =
    allUsers?.map((user) => ({
      value: user.id,
      label: `${user.firstname} ${user.lastname}`,
    })) || [];

  const filterConfig = {
    title: 'Invoice Filters',
    fields: [
      {
        name: 'supplier_name',
        label: 'Supplier Name',
        type: 'text',
        showSearchIcon: true,
      },
      {
        name: 'invoice_number',
        label: 'Invoice Number',
        type: 'text',
        showSearchIcon: true,
      },
      {
        name: 'invoice_owner',
        label: 'Invoice Owner',
        type: 'select',
        options: [...userOptions],
      },
      { name: 'created_date', label: 'Created Date', type: 'date' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'denied', label: 'Denied' },
          { value: 'rollback', label: 'Rollback' },
          { value: 'processing', label: 'Processing' },
          { value: 'forwarded', label: 'Forwarded' },
          { value: 'to sign', label: 'To sign' },
          { value: 'signed', label: 'Signed' },
        ],
      },
    ],
  };

  // Determine the report title based on user role and current view
  const getReportTitle = () => {
    let title = 'Invoices Report';

    if (user?.role === 'admin' && indexInvoice === 1) {
      title = 'All Invoices Report';
      if (cardIndex === 2) title = 'Pending Invoices Report';
      if (cardIndex === 3) title = 'Approved Invoices Report';
      if (cardIndex === 4) title = 'Denied Invoices Report';
      if (cardIndex === 5) title = 'Rollbacked Invoices Report';
      if (cardIndex === 6) title = 'Processing Invoices Report';
      if (cardIndex === 9) title = 'Forwarded Invoices Report';
    } else if (
      (user?.role === 'signer' || user?.role === 'signer_admin') &&
      indexInvoice === 3
    ) {
      title = 'Invoices To Sign Report';
      if (cardIndex === 2) title = 'Pending Invoices To Sign Report';
      if (cardIndex === 4) title = 'Denied Invoices To Sign Report';
      if (cardIndex === 7) title = 'Invoices With To Sign Status Report';
      if (cardIndex === 8) title = 'Signed Invoices Report';
    } else {
      title = 'My Invoices Report';
      if (cardIndex === 2) title = 'My Pending Invoices Report';
      if (cardIndex === 3) title = 'My Approved Invoices Report';
      if (cardIndex === 4) title = 'My Denied Invoices Report';
      if (cardIndex === 5) title = 'My Rollbacked Invoices Report';
      if (cardIndex === 6) title = 'My Processing Invoices Report';
      if (cardIndex === 9) title = 'My Forwarded Invoices Report';
    }

    return title;
  };

  // Function to render expanded GL lines
  const renderExpandedGLLines = (glLines) => {
    return glLines.map((line, index) => (
      <TableRow key={`gl-${index}`} sx={styles.expandedRow}>
        <TableCell colSpan={4} />
        <TableCell align="left">{line?.gl_code || '-'}</TableCell>
        <TableCell align="left">{line?.gl_description || '-'}</TableCell>
        <TableCell align="left">{line?.location || '-'}</TableCell>
        <TableCell align="left">{line?.cost_center || '-'}</TableCell>
        <TableCell align="left">{line?.aircraft_type || '-'}</TableCell>
        <TableCell align="left">{line?.route || '-'}</TableCell>
        <TableCell colSpan={1} />
        <TableCell align="left">{line?.gl_amount || '-'}</TableCell>
        <TableCell colSpan={2} />
      </TableRow>
    ));
  };

  return (
    <RootLayout>
      <InvoiceModal />
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        config={filterConfig}
      />
      <Box
        display="flex"
        justifyContent="end"
        alignItems="stretch"
        sx={{ marginBottom: 2 }}
      >
        <DownloadInvoiceComponent
          invoices={invoices}
          title={getReportTitle()}
        />
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: '100%',
          overflow: 'scroll',
        }}
      >
        <Table sx={styles.table} aria-label="invoice table">
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={styles.header}>
                SUPPLIER NUMBER
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                SUPPLIER NAME
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                INVOICE NUMBER
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                SERVICE PERIOD
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                GL CODE
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                GL DESCRIPTION
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                LOCATION
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                COST CENTER
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                AIRCRAFT TYPE
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                ROUTE
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                CURRENCY
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                GL AMOUNT
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                TOTAL AMOUNT
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                STATUS
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                ACTION
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices?.results?.map((item, index) => {
              const invoice = normalizeInvoiceData(item); // Normalize the data first
              const glDisplay = getGLLinesDisplay(invoice, false);
              const glLines = getGLLines(invoice);
              const hasMultipleGLLines = glLines.length > 1;
              const isExpanded = expandedRows.has(invoice.id);
              const totalAmount = getTotalAmount(invoice);
              const status = invoice?.status;
              const currency = invoice?.currency;

              return (
                <>
                  <TableRow
                    key={invoice.id}
                    sx={{
                      cursor: hasMultipleGLLines ? 'pointer' : 'default',
                      '&:hover': hasMultipleGLLines
                        ? { backgroundColor: '#f5f5f5' }
                        : {},
                    }}
                    onClick={() =>
                      hasMultipleGLLines && toggleRowExpansion(invoice.id)
                    }
                  >
                    <TableCell align="left">
                      {invoice?.supplier_number || '-'}
                    </TableCell>
                    <TableCell align="left">
                      {invoice?.supplier_name || '-'}
                    </TableCell>
                    <TableCell align="left">
                      {invoice?.invoice_number || '-'}
                    </TableCell>
                    <TableCell align="left">
                      {invoice?.service_period || '-'}
                    </TableCell>
                    <TableCell align="left">
                      {glDisplay.code}
                      {hasMultipleGLLines && (
                        <span
                          style={{
                            marginLeft: '8px',
                            fontSize: '12px',
                            color: '#666',
                          }}
                        >
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell align="left">{glDisplay.description}</TableCell>
                    <TableCell align="left">{glDisplay.location}</TableCell>
                    <TableCell align="left">{glDisplay.costCenter}</TableCell>
                    <TableCell align="left">{glDisplay.aircraftType}</TableCell>
                    <TableCell align="left">{glDisplay.route}</TableCell>
                    <TableCell align="left">{currency || '-'}</TableCell>
                    <TableCell align="left">{glDisplay.amount}</TableCell>
                    <TableCell align="left" sx={styles.totalAmountCell}>
                      {formatCurrencyAmount(totalAmount, currency)}
                    </TableCell>
                    <TableCell align="left">
                      <Chip
                        label={status || '-'}
                        size="small"
                        color={
                          status === 'pending'
                            ? 'warning'
                            : status === 'approved'
                            ? 'success'
                            : status === 'denied'
                            ? 'error'
                            : status === 'to sign'
                            ? 'info'
                            : status === 'signed'
                            ? 'success'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        minWidth: '200px',
                      }}
                    >
                      <Tooltip title={hoverView ? 'View' : ''}>
                        <Chip
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(invoice);
                          }}
                          icon={<VisibilityOutlinedIcon />}
                          onMouseEnter={() => setHoverView(true)}
                          onMouseLeave={() => setHoverView(false)}
                          label="View"
                          sx={styles.rowChip}
                          size="small"
                          color="primary"
                        />
                      </Tooltip>

                      {user?.role === 'staff' ||
                      user?.role === 'supplier' ||
                      user?.role === 'signer_admin' ||
                      (user?.role === 'admin' && indexInvoice === 2) ||
                      (user?.role === 'signer' && indexInvoice === 2) ? (
                        <Tooltip title={hoverEdit ? 'Edit' : ''}>
                          <Chip
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdate(invoice);
                            }}
                            icon={<EditOutlinedIcon />}
                            onMouseEnter={() => setHoverEdit(true)}
                            onMouseLeave={() => setHoverEdit(false)}
                            sx={styles.rowChip}
                            label="Edit"
                            size="small"
                            color="primary"
                          />
                        </Tooltip>
                      ) : null}

                      {indexInvoice === 2 ? (
                        <Tooltip title={hoverDelete ? 'Delete' : ''}>
                          <Chip
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(invoice);
                            }}
                            icon={<DeleteOutlineIcon />}
                            onMouseEnter={() => setHoverDelete(true)}
                            onMouseLeave={() => setHoverDelete(false)}
                            sx={styles.rowChipDelete}
                            label="Delete"
                            size="small"
                            color="primary"
                          />
                        </Tooltip>
                      ) : null}

                      <Tooltip title={hoverTrack ? 'Track&Sign' : ''}>
                        <Chip
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvoiceTracking(invoice);
                          }}
                          icon={<TrackChangesIcon />}
                          onMouseEnter={() => setHoverTrack(true)}
                          onMouseLeave={() => setHoverTrack(false)}
                          sx={styles.rowChip}
                          label="Track&Sign"
                          size="small"
                          color="primary"
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>

                  {/* Render expanded GL lines if invoice is expanded and has multiple GL lines */}
                  {isExpanded &&
                    hasMultipleGLLines &&
                    renderExpandedGLLines(glLines)}
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedView && (
        <ViewInvoiceModal
          defaultValues={selectedView}
          open={openView}
          handleClose={handleCloseView}
        />
      )}

      {selectedUpdate && (
        <UpdateInvoiceModal
          defaultValues={selectedUpdate}
          open={openUpdate}
          handleClose={handleCloseUpdate}
          setUpdateTrigger={setUpdateTrigger}
        />
      )}

      {selectedTracking && (
        <InvoiceTracking
          selected={selectedTracking}
          openModal={openTracking}
          handleCloseModal={handleCloseTracking}
        />
      )}

      {selectedDelete && (
        <DeleteInvoiceDialog
          open={openDelete}
          handleClose={handleCloseDelete}
          defaultValues={selectedDelete}
          page={page}
        />
      )}

      <Box display="flex" justifyContent="flex-end" m={2}>
        <Stack spacing={2}>
          <Pagination
            count={Math.ceil(invoices?.count / 10) || 1}
            page={page}
            onChange={handlePageChange}
            showFirstButton
            showLastButton
          />
        </Stack>
      </Box>
    </RootLayout>
  );
}
