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
};

export default function Invoice() {
  const [closeInvoiceTrackingModalTrigger, setCloseInvoiceTrackingTrigger] =
    useState(false);
  const { allUsers } = useSelector((state) => state.user);

  const { invoices, index, filters } = useSelector((state) => state.invoice);
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

  const filterData = (query, result) => {
    if (!query) {
      return result?.results;
    } else {
      const data = result?.results?.filter((item) => {
        return (
          item?.created_at?.includes(query) ||
          item?.invoice?.created_at?.includes(query) ||
          item?.title?.toLowerCase()?.includes(query?.toLowerCase()) ||
          item?.invoice?.title?.toLowerCase()?.includes(query?.toLowerCase()) ||
          item?.station?.toLowerCase()?.includes(query?.toLowerCase()) ||
          item?.invoice?.station
            ?.toLowerCase()
            ?.includes(query?.toLowerCase()) ||
          item?.description?.toLowerCase()?.includes(query?.toLowerCase()) ||
          item?.invoice?.description
            ?.toLowerCase()
            ?.includes(query?.toLowerCase()) ||
          item?.status?.toLowerCase()?.includes(query?.toLowerCase()) ||
          item?.invoice?.status
            ?.toLowerCase()
            ?.includes(query?.toLowerCase()) ||
          item?.invoice_owner?.firstname
            ?.toLowerCase()
            .includes(query?.toLowerCase()) ||
          item?.invoice?.invoice_owner?.firstname
            ?.toLowerCase()
            ?.includes(query?.toLowerCase()) ||
          item?.invoice_owner?.lastname
            ?.toLowerCase()
            ?.includes(query?.toLowerCase()) ||
          item?.invoice?.invoice_owner?.lastname
            ?.toLowerCase()
            ?.includes(query?.toLowerCase())
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
    if (
      indexInvoice === 2 &&
      (data?.status === 'pending' || data?.invoice?.status === 'pending')
    ) {
      setSelectedDelete(data);
      setOpenDelete(true);
    } else {
      toast.error('You are allowed to delete your pending invoice');
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

  const isInvoiceEditable = (invoice) =>
    invoice?.status === 'pending' ||
    invoice?.status === 'rollback' ||
    invoice?.invoice?.status === 'pending' ||
    invoice?.invoice?.status === 'rollback';

  // Generate dynamic options from allUsers
  const userOptions =
    allUsers?.map((user) => ({
      value: user.id,
      label: `${user.firstname} ${user.lastname}`,
    })) || [];

  const filterConfig = {
    title: 'Invoice Filters',
    fields: [
      { name: 'title', label: 'Title', type: 'text', showSearchIcon: true },
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
    } else if ((user?.role === 'signer' || user?.role === 'signer_admin') && indexInvoice === 3) {
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
        {/* Use the new React-PDF based component */}
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
        <Table sx={styles.table} aria-label="user table">
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
                CURRENCY
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                AMOUNT
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
            {invoices?.results?.map((invoice, index) => (
              <TableRow key={index}>
                <TableCell align="left">
                  {invoice?.supplier_number ||
                    invoice?.invoice?.supplier_number ||
                    '-'}
                </TableCell>
                <TableCell align="left">
                  {invoice?.supplier_name ||
                    invoice?.invoice?.supplier_name ||
                    '-'}
                </TableCell>
                <TableCell align="left">
                  {invoice?.invoice_number ||
                    invoice?.invoice?.invoice_number ||
                    '-'}
                </TableCell>
                <TableCell align="left">
                  {invoice?.service_period ||
                    invoice?.invoice?.service_period ||
                    '-'}
                </TableCell>
                <TableCell align="left">
                  {invoice?.gl_code || invoice?.invoice?.gl_code || '-'}
                </TableCell>
                <TableCell align="left">
                  {invoice?.gl_description ||
                    invoice?.invoice?.gl_description ||
                    '-'}
                </TableCell>
                <TableCell align="left">
                  {invoice?.location || invoice?.invoice?.location || '-'}
                </TableCell>
                <TableCell align="left">
                  {invoice?.cost_center || invoice?.invoice?.cost_center || '-'}
                </TableCell>
                <TableCell align="left">
                  {invoice?.currency || invoice?.invoice?.currency || '-'}
                </TableCell>
                <TableCell align="left">
                  {invoice?.amount || invoice?.invoice?.amount || '-'}
                </TableCell>
                <TableCell align="left">
                  {invoice?.status || invoice?.invoice?.status || '-'}
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
                      onClick={() => handleView(invoice)}
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
                        onClick={() => handleUpdate(invoice)}
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
                        onClick={() => handleDelete(invoice)}
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
                      onClick={() => handleInvoiceTracking(invoice)}
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
            ))}
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