import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  Paper,
  TableContainer,
  TableCell,
  Pagination,
  Box,
  Tooltip,
  Chip,
  Typography,
  Divider,
  IconButton,
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
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import ReplayIcon from '@mui/icons-material/Replay';
import RollbackInvoiceToSupplierDialog from '../components/RollbackInvoiceToSupplierDialog';
import AddressInvoiceDialog from '../components/AddressInvoiceDialog';
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
  getSupplierInvoices,
  getStaffInvoices,
  getAddressedToMeInvoices,
} from '../features/invoice/invoiceSlice';
import ViewInvoiceModal from '../components/ViewInvoiceModal';
import UpdateInvoiceModal from '../components/UpdateInvoiceModal';
import DeleteInvoiceDialog from '../components/DeleteInvoiceDialog';
import InvoiceTracking from './InvoiceTracking';
import { getInvoiceToSign } from '../features/invoice/invoiceSlice';
import FilterPanel from '../components/global/FilterPanel';
import { setFilters } from '../features/invoice/invoiceSlice';
import EnhancedDownloadComponent from '../components/EnhancedDownloadComponent';
import { getAllUsersWithNoPagination } from '../features/user/userSlice';
import {
  formatAmount,
  formatCurrencyAmount as _formatCurrencyAmount,
} from '../utils/formatAmount';

const styles = {
  table: {
    minWidth: 800,
  },
  header: {
    color: '#00529B',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    py: 1.5,
    backgroundColor: '#f0f4f8',
    borderBottom: '2px solid #e0e8f0',
  },
  rowChip: {
    fontSize: '11px',
    bgcolor: '#00529B',
    color: 'white',
    height: '26px',
    '& .MuiChip-icon': { fontSize: '14px' },
  },
  rowChipDelete: {
    fontSize: '11px',
    bgcolor: '#d32f2f',
    color: 'white',
    height: '26px',
    '& .MuiChip-icon': { fontSize: '14px' },
  },
  expandedRow: {
    backgroundColor: '#f8fafc',
  },
  totalAmountCell: {
    fontWeight: 700,
    color: '#00529B',
    fontSize: '13px',
  },
};

export default function Invoice() {
  const [closeInvoiceTrackingModalTrigger, setCloseInvoiceTrackingTrigger] =
    useState(false);
  const { allUsers } = useSelector((state) => state.user);
  const { invoices, addressedToMeInvoices, index, filters } = useSelector(
    (state) => state.invoice,
  );
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
  const [openAddress, setOpenAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [hoverAddress, setHoverAddress] = useState(false);
  const [openRollbackSupplier, setOpenRollbackSupplier] = useState(false);
  const [selectedRollbackSupplier, setSelectedRollbackSupplier] =
    useState(null);
  const [hoverRollbackSupplier, setHoverRollbackSupplier] = useState(false);

  // Helper function to normalize invoice data structure
  const normalizeInvoiceData = (item) => {
    if (item.invoice) {
      return {
        ...item.invoice,
        row_number: item.row_number,
        signer: item.signer,
        status: item.status || item.invoice.status,
        created_at: item.created_at || item.invoice.created_at,
        updated_at: item.updated_at || item.invoice.updated_at,
      };
    }
    return item;
  };

  const getGLLines = (invoice) => {
    const normalized = normalizeInvoiceData(invoice);
    return normalized?.gl_lines || [];
  };

  const getDocuments = (invoice) => {
    const normalized = normalizeInvoiceData(invoice);
    return normalized?.documents || [];
  };

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

  // ── Permission flags ──────────────────────────────────────────────────────
  const isAdmin = user?.role === 'admin';
  const isSignerAdmin = user?.role === 'signer_admin';
  const isSigner = user?.role === 'signer';
  const isSupplier = user?.role === 'supplier';
  const isStaff = user?.role === 'staff';

  // signer / signer_admin / staff are always invoice users too
  const isInvoiceUser =
    isAdmin ||
    isSupplier ||
    isSignerAdmin ||
    isSigner ||
    isStaff ||
    !!user?.is_invoice_user;

  const getInvoiceIndex = () => {
    if (isAdmin) return index || 1;
    if (isSigner || isSignerAdmin) return index || 3;
    return index || 2;
  };

  // ── Per-table permission flags (mirror the sidebar summary table) ─────────
  //
  // | Role                        | All Inv | Upload | Approval | Sup/Staff | AddrToMe |
  // | admin                       |   ✅    |   ✅   |    —     |    ✅     |    —     |
  // | supplier                    |   —     |   ✅   |    —     |    —      |    —     |
  // | staff (always invoice user) |   —     |   ✅   |    —     |    —      |    —     |
  // | signer (always inv user)    |   —     |   ✅   |    ✅    |    —      |    —     |
  // | signer_admin (always inv u) |   —     |   ✅   |    ✅    |✅(verif.) |✅(verif.)|
  // | any + is_invoice_verifier   |   ✅    |   ✅   |    —     |    ✅     |    ✅    |

  // All Invoices — admin OR any is_invoice_verifier
  const canSeeAllInvoices = isAdmin || !!user?.is_invoice_verifier;

  // Supplier Invoices — admin OR (signer_admin + is_invoice_verifier) OR any is_invoice_verifier
  const canSeeSupplierInvoices =
    isAdmin ||
    (isSignerAdmin && !!user?.is_invoice_verifier) ||
    !!user?.is_invoice_verifier;

  // Staff Invoices — same gate as Supplier Invoices
  const canSeeStaffInvoices =
    isAdmin ||
    (isSignerAdmin && !!user?.is_invoice_verifier) ||
    !!user?.is_invoice_verifier;

  // Addressed To Me — signer_admin+verifier OR any is_invoice_verifier
  const canSeeAddressedToMe =
    (isSignerAdmin && !!user?.is_invoice_verifier) ||
    !!user?.is_invoice_verifier;

  // Shared card→status map used by supplier (4), staff (5), and addressed-to-me (6) views
  const cardStatusMap = {
    2: 'pending',
    3: 'approved',
    4: 'denied',
    5: 'rollback',
    6: 'processing',
    9: 'forwarded',
  };

  const dispatchInvoices = () => {
    const invoiceIndex = getInvoiceIndex();
    const params = { page, year, ...filters };
    setIndexInvoice(invoiceIndex);

    if (!user) return;

    // ── Addressed To Me (index 6) ─────────────────────────────────────────────
    if (invoiceIndex === 6 && canSeeAddressedToMe) {
      dispatch(getAddressedToMeInvoices());
      return;
    }

    // ── Staff Invoices (index 5) ─────────────────────────────────────────────
    if (invoiceIndex === 5 && canSeeStaffInvoices) {
      const statusFromCard = cardIndex ? cardStatusMap[cardIndex] : undefined;
      dispatch(
        getStaffInvoices({
          ...params,
          ...(statusFromCard && !filters.status
            ? { status: statusFromCard }
            : {}),
        }),
      );
      return;
    }

    // ── Supplier Invoices (index 4) ──────────────────────────────────────────
    if (invoiceIndex === 4 && canSeeSupplierInvoices) {
      const statusFromCard = cardIndex ? cardStatusMap[cardIndex] : undefined;
      dispatch(
        getSupplierInvoices({
          ...params,
          ...(statusFromCard && !filters.status
            ? { status: statusFromCard }
            : {}),
        }),
      );
      return;
    }

    // ── All Invoices (index 1) — admin OR is_invoice_verifier ────────────────
    if (invoiceIndex === 1 && canSeeAllInvoices) {
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
      return;
    }

    // ── Invoice Approval (index 3) — signer OR signer_admin ──────────────────
    if ((isSigner || isSignerAdmin) && invoiceIndex === 3) {
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
      return;
    }

    // ── Invoices Upload (index 2) — all invoice users ─────────────────────────
    if (invoiceIndex === 2 && isInvoiceUser) {
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

  // ── Active dataset — addressed-to-me (index 6) uses its own state key ─────
  const activeInvoices =
    indexInvoice === 6 && canSeeAddressedToMe
      ? addressedToMeInvoices
      : invoices;

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleUpdate = (data) => {
    if (
      // Upload view (index 2) — all invoice users can edit their own
      (isInvoiceUser && indexInvoice === 2 && isInvoiceEditable(data)) ||
      // Supplier Invoices view (index 4)
      (canSeeSupplierInvoices &&
        indexInvoice === 4 &&
        isInvoiceEditable(data)) ||
      // Staff Invoices view (index 5)
      (canSeeStaffInvoices && indexInvoice === 5 && isInvoiceEditable(data)) ||
      // Addressed To Me view (index 6)
      (canSeeAddressedToMe && indexInvoice === 6 && isInvoiceEditable(data))
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

  const handleAddress = (data) => {
    const normalized = normalizeInvoiceData(data);
    if (normalized?.status !== 'pending') {
      toast.error('Only pending invoices can be addressed to a signer');
      return;
    }
    setSelectedAddress(data);
    setOpenAddress(true);
  };

  const handleCloseAddress = () => {
    setOpenAddress(false);
    setSelectedAddress(null);
  };

  const handleAddressSuccess = () => {
    setUpdateTrigger((prev) => !prev);
  };

  const handleRollbackSupplier = (data) => {
    const normalized = normalizeInvoiceData(data);
    const status = normalized?.status;
    if (status !== 'pending' && status !== 'rollback') {
      toast.error('Only pending or rollback invoices can change the status');
      return;
    }
    setSelectedRollbackSupplier(data);
    setOpenRollbackSupplier(true);
  };

  const handleCloseRollbackSupplier = () => {
    setOpenRollbackSupplier(false);
    setSelectedRollbackSupplier(null);
  };

  const handleRollbackSupplierSuccess = () => {
    setUpdateTrigger((prev) => !prev);
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

  // ── GL line field resolvers ───────────────────────────────────────────────
  const resolveGLCode = (line) => {
    if (line?.gl_account_detail)
      return `${line.gl_account_detail.gl_code} - ${line.gl_account_detail.gl_description}`;
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
      const line = glLines[0];
      return {
        code: resolveGLCode(line),
        description:
          line?.gl_account_detail?.gl_description ||
          line?.gl_description ||
          '-',
        costCenter: resolveCostCenter(line),
        amount: line?.gl_amount || '-',
        location: resolveLocation(line),
        aircraftType: resolveAircraftType(line),
        route: resolveRoute(line),
      };
    }

    // Multiple lines — show summary
    const totalAmount = glLines.reduce(
      (sum, line) => sum + parseFloat(line?.gl_amount || 0),
      0,
    );
    return {
      code: `${glLines.length} lines`,
      description: 'Multiple GL accounts',
      costCenter: 'Multiple centers',
      amount: formatAmount(totalAmount),
      location: 'Multiple',
      aircraftType: 'Multiple',
      route: 'Multiple',
    };
  };

  // Helper function to calculate and format total amount
  const getTotalAmount = (invoice) => {
    const normalized = normalizeInvoiceData(invoice);
    const amount = normalized?.amount;
    if (amount) return formatAmount(amount);
    const glLines = getGLLines(invoice);
    if (glLines.length > 0) {
      const total = glLines.reduce(
        (sum, line) => sum + parseFloat(line?.gl_amount || 0),
        0,
      );
      return formatAmount(total);
    }
    return '-';
  };

  const formatCurrencyAmount = (amount, currency) =>
    _formatCurrencyAmount(amount, currency);

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

  const getReportTitle = () => {
    // ── Addressed To Me (index 6) ─────────────────────────────────────────
    if (indexInvoice === 6 && canSeeAddressedToMe)
      return 'Addressed To Me Invoices';
    // ── All Invoices (index 1) ────────────────────────────────────────────
    if (indexInvoice === 1 && canSeeAllInvoices) {
      let title = 'All Invoices Report';
      if (cardIndex === 2) title = 'Pending Invoices Report';
      if (cardIndex === 3) title = 'Approved Invoices Report';
      if (cardIndex === 4) title = 'Denied Invoices Report';
      if (cardIndex === 5) title = 'Rollbacked Invoices Report';
      if (cardIndex === 6) title = 'Processing Invoices Report';
      if (cardIndex === 9) title = 'Forwarded Invoices Report';
      return title;
    }
    // ── Invoice Approval (index 3) ────────────────────────────────────────
    if ((isSigner || isSignerAdmin) && indexInvoice === 3) {
      let title = 'Invoices To Sign Report';
      if (cardIndex === 2) title = 'Pending Invoices To Sign Report';
      if (cardIndex === 4) title = 'Denied Invoices To Sign Report';
      if (cardIndex === 7) title = 'Invoices With To Sign Status Report';
      if (cardIndex === 8) title = 'Signed Invoices Report';
      return title;
    }
    // ── Supplier Invoices (index 4) ───────────────────────────────────────
    if (indexInvoice === 4 && canSeeSupplierInvoices)
      return 'Supplier Invoices Report';
    // ── Staff Invoices (index 5) ──────────────────────────────────────────
    if (indexInvoice === 5 && canSeeStaffInvoices)
      return 'Staff Invoices Report';
    // ── Invoices Upload (index 2) — default ──────────────────────────────
    let title = 'My Invoices Report';
    if (cardIndex === 2) title = 'My Pending Invoices Report';
    if (cardIndex === 3) title = 'My Approved Invoices Report';
    if (cardIndex === 4) title = 'My Denied Invoices Report';
    if (cardIndex === 5) title = 'My Rollbacked Invoices Report';
    if (cardIndex === 6) title = 'My Processing Invoices Report';
    if (cardIndex === 9) title = 'My Forwarded Invoices Report';
    return title;
  };

  // Render expanded GL lines
  const renderExpandedGLLines = (glLines) => {
    return glLines.map((line, idx) => (
      <TableRow
        key={`gl-${idx}`}
        sx={{ backgroundColor: '#f8fafc', borderLeft: '3px solid #00529B' }}
      >
        <TableCell colSpan={4} />
        <TableCell sx={{ fontSize: '11.5px', color: '#444', py: 1 }}>
          {resolveGLCode(line)}
        </TableCell>
        <TableCell sx={{ fontSize: '11.5px', color: '#555', py: 1 }}>
          {line?.gl_description || '-'}
        </TableCell>
        <TableCell sx={{ fontSize: '11.5px', color: '#555', py: 1 }}>
          {resolveLocation(line)}
        </TableCell>
        <TableCell sx={{ fontSize: '11.5px', color: '#555', py: 1 }}>
          {resolveCostCenter(line)}
        </TableCell>
        <TableCell sx={{ fontSize: '11.5px', color: '#555', py: 1 }}>
          {resolveAircraftType(line)}
        </TableCell>
        <TableCell sx={{ fontSize: '11.5px', color: '#555', py: 1 }}>
          {resolveRoute(line)}
        </TableCell>
        <TableCell />
        <TableCell
          sx={{ fontSize: '12px', fontWeight: 600, color: '#333', py: 1 }}
        >
          {line?.gl_amount || '-'}
        </TableCell>
        {/* ── added: empty cell to align with the now-permanent Addressed To column ── */}
        <TableCell />
        <TableCell colSpan={2} />
      </TableRow>
    ));
  };

  // ── Status chip color map ─────────────────────────────────────────────────
  const statusColor = (s) => {
    if (s === 'pending')
      return { bg: '#fff3e0', color: '#e65100', border: '#ffcc80' };
    if (s === 'approved')
      return { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' };
    if (s === 'denied')
      return { bg: '#ffebee', color: '#c62828', border: '#ef9a9a' };
    if (s === 'processing')
      return { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' };
    if (s === 'rollback')
      return { bg: '#f3e5f5', color: '#6a1b9a', border: '#ce93d8' };
    if (s === 'to sign')
      return { bg: '#e0f7fa', color: '#006064', border: '#80deea' };
    if (s === 'signed')
      return { bg: '#e8eaf6', color: '#283593', border: '#9fa8da' };
    if (s === 'forwarded')
      return { bg: '#fce4ec', color: '#880e4f', border: '#f48fb1' };
    return { bg: '#f5f5f5', color: '#616161', border: '#e0e0e0' };
  };

  // ── Resolve status for display ────────────────────────────────────────────
  const getDisplayStatus = (invoice) => {
    if (indexInvoice !== 3) return invoice?.status;
    const histories = invoice?.invoice_histories || [];
    const match = histories.find((h) => h?.signer?.id === user?.id);
    return match ? match.status : invoice?.status;
  };

  // ── Verifier view: supplier (4), staff (5), addressed-to-me (6) ───────────
  // Used only for Address & Change Status action buttons
  const isVerifierView =
    (indexInvoice === 4 && canSeeSupplierInvoices) ||
    (indexInvoice === 5 && canSeeStaffInvoices) ||
    (indexInvoice === 6 && canSeeAddressedToMe);

  return (
    <RootLayout>
      <InvoiceModal />

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.5,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#00529B',
                fontSize: '18px',
                lineHeight: 1.2,
              }}
            >
              {getReportTitle()}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#888', fontSize: '12px' }}
            >
              {activeInvoices?.count ?? 0} invoice
              {activeInvoices?.count !== 1 ? 's' : ''} found
            </Typography>
          </Box>
          <EnhancedDownloadComponent
            invoices={activeInvoices}
            title={getReportTitle()}
          />
        </Box>
        <Divider sx={{ mt: 1.5 }} />
      </Box>

      {/* ── Filters — hidden for addressed-to-me (no server-side filtering) ── */}
      {indexInvoice !== 6 && (
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          config={filterConfig}
        />
      )}

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e0e8f0',
          borderRadius: '10px',
          overflow: 'hidden',
          mt: 1.5,
        }}
      >
        <TableContainer
          sx={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}
        >
          <Table sx={styles.table} stickyHeader aria-label="invoice table">
            <TableHead>
              <TableRow>
                <TableCell sx={styles.header}>Supplier No.</TableCell>
                <TableCell sx={styles.header}>Supplier Name</TableCell>
                <TableCell sx={styles.header}>Invoice No.</TableCell>
                <TableCell sx={styles.header}>Service Period</TableCell>
                <TableCell sx={styles.header}>Created At</TableCell>
                <TableCell sx={styles.header}>GL Code</TableCell>
                <TableCell sx={styles.header}>GL Description</TableCell>
                <TableCell sx={styles.header}>Location</TableCell>
                <TableCell sx={styles.header}>Cost Center</TableCell>
                <TableCell sx={styles.header}>Aircraft Type</TableCell>
                <TableCell sx={styles.header}>Route</TableCell>
                <TableCell sx={styles.header}>Currency</TableCell>
                <TableCell sx={styles.header}>GL Amount</TableCell>
                <TableCell sx={styles.header}>Total Amount</TableCell>
                <TableCell sx={styles.header}>Status</TableCell>
                {/* ── Addressed To — now visible on ALL sub-menus ── */}
                <TableCell sx={styles.header}>Addressed To</TableCell>
                <TableCell sx={styles.header}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeInvoices?.results?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={17}
                    align="center"
                    sx={{ py: 6, color: '#999' }}
                  >
                    <Typography variant="body2">No invoices found.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {activeInvoices?.results?.map((item) => {
                const invoice = normalizeInvoiceData(item);
                const glDisplay = getGLLinesDisplay(invoice, false);
                const glLines = getGLLines(invoice);
                const hasMultipleGLLines = glLines.length > 1;
                const isExpanded = expandedRows.has(invoice.id);
                const totalAmount = getTotalAmount(invoice);
                const status = getDisplayStatus(invoice);
                const currency = invoice?.currency;
                const sc = statusColor(status);

                return (
                  <>
                    <TableRow
                      key={invoice.id}
                      sx={{
                        cursor: hasMultipleGLLines ? 'pointer' : 'default',
                        transition: 'background 0.15s',
                        '&:hover': { backgroundColor: '#f5f9ff' },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                      onClick={() =>
                        hasMultipleGLLines && toggleRowExpansion(invoice.id)
                      }
                    >
                      {/* Supplier No */}
                      <TableCell
                        sx={{ fontSize: '12px', color: '#555', py: 1.2 }}
                      >
                        {invoice?.supplier_number || '-'}
                      </TableCell>
                      {/* Supplier Name */}
                      <TableCell
                        sx={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#222',
                          py: 1.2,
                          maxWidth: 160,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {invoice?.supplier_name || '-'}
                      </TableCell>
                      {/* Invoice No */}
                      <TableCell sx={{ py: 1.2 }}>
                        <Typography
                          sx={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#00529B',
                          }}
                        >
                          {invoice?.invoice_number || '-'}
                        </Typography>
                      </TableCell>
                      {/* Service Period */}
                      <TableCell
                        sx={{
                          fontSize: '12px',
                          color: '#555',
                          py: 1.2,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {invoice?.service_period || '-'}
                      </TableCell>
                      {/* Created At */}
                      <TableCell
                        sx={{
                          fontSize: '11.5px',
                          color: '#777',
                          py: 1.2,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {invoice?.created_at
                          ? new Date(invoice.created_at).toLocaleDateString(
                              'en-GB',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              },
                            )
                          : '-'}
                      </TableCell>
                      {/* GL Code */}
                      <TableCell
                        sx={{ fontSize: '11.5px', color: '#444', py: 1.2 }}
                      >
                        {glDisplay.code}
                        {hasMultipleGLLines && (
                          <Box
                            component="span"
                            sx={{
                              ml: 0.75,
                              fontSize: '10px',
                              color: '#00529B',
                              fontWeight: 700,
                            }}
                          >
                            {isExpanded ? '▼' : '▶'}
                          </Box>
                        )}
                      </TableCell>
                      {/* GL Description */}
                      <TableCell
                        sx={{
                          fontSize: '11.5px',
                          color: '#555',
                          py: 1.2,
                          maxWidth: 120,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {glDisplay.description}
                      </TableCell>
                      {/* Location */}
                      <TableCell
                        sx={{ fontSize: '11.5px', color: '#555', py: 1.2 }}
                      >
                        {glDisplay.location}
                      </TableCell>
                      {/* Cost Center */}
                      <TableCell
                        sx={{ fontSize: '11.5px', color: '#555', py: 1.2 }}
                      >
                        {glDisplay.costCenter}
                      </TableCell>
                      {/* Aircraft Type */}
                      <TableCell
                        sx={{ fontSize: '11.5px', color: '#555', py: 1.2 }}
                      >
                        {glDisplay.aircraftType}
                      </TableCell>
                      {/* Route */}
                      <TableCell
                        sx={{ fontSize: '11.5px', color: '#555', py: 1.2 }}
                      >
                        {glDisplay.route}
                      </TableCell>
                      {/* Currency */}
                      <TableCell sx={{ py: 1.2 }}>
                        <Box
                          sx={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#666',
                            bgcolor: '#f0f0f0',
                            borderRadius: '4px',
                            px: 0.75,
                            py: 0.25,
                            display: 'inline-block',
                          }}
                        >
                          {currency || '-'}
                        </Box>
                      </TableCell>
                      {/* GL Amount */}
                      <TableCell
                        sx={{
                          fontSize: '12px',
                          color: '#333',
                          py: 1.2,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {glDisplay.amount}
                      </TableCell>
                      {/* Total Amount */}
                      <TableCell sx={{ py: 1.2 }}>
                        <Typography
                          sx={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#00529B',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {formatCurrencyAmount(totalAmount, currency)}
                        </Typography>
                      </TableCell>
                      {/* Status */}
                      <TableCell sx={{ py: 1.2 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            px: 1,
                            py: 0.35,
                            borderRadius: '20px',
                            backgroundColor: sc.bg,
                            border: `1px solid ${sc.border}`,
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: sc.color,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: sc.color,
                              textTransform: 'capitalize',
                              lineHeight: 1,
                            }}
                          >
                            {status || '-'}
                          </Typography>
                        </Box>
                      </TableCell>
                      {/* ── Addressed To — visible on ALL sub-menus ── */}
                      <TableCell
                        sx={{ fontSize: '12px', color: '#444', py: 1.2 }}
                      >
                        {invoice?.is_addressed_to?.name ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: '#1565c0',
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: '11.5px',
                                color: '#1565c0',
                                fontWeight: 600,
                              }}
                            >
                              {invoice.is_addressed_to.name}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: '11px', color: '#bbb' }}>
                            —
                          </Typography>
                        )}
                      </TableCell>
                      {/* Actions */}
                      <TableCell
                        sx={{ py: 1, whiteSpace: 'nowrap' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            gap: '4px',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                          }}
                        >
                          <Tooltip title="View">
                            <Chip
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(invoice);
                              }}
                              icon={<VisibilityOutlinedIcon />}
                              label="View"
                              sx={styles.rowChip}
                              size="small"
                            />
                          </Tooltip>

                          {/* Edit — upload view (2), verifier views (4,5,6) */}
                          {((isInvoiceUser && indexInvoice === 2) ||
                            (canSeeSupplierInvoices && indexInvoice === 4) ||
                            (canSeeStaffInvoices && indexInvoice === 5) ||
                            (canSeeAddressedToMe && indexInvoice === 6)) && (
                            <Tooltip title="Edit">
                              <Chip
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdate(invoice);
                                }}
                                icon={<EditOutlinedIcon />}
                                label="Edit"
                                sx={styles.rowChip}
                                size="small"
                              />
                            </Tooltip>
                          )}

                          {/* Delete — upload view only */}
                          {indexInvoice === 2 && (
                            <Tooltip title="Delete">
                              <Chip
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(invoice);
                                }}
                                icon={<DeleteOutlineIcon />}
                                label="Delete"
                                sx={styles.rowChipDelete}
                                size="small"
                              />
                            </Tooltip>
                          )}

                          <Tooltip title="Track & Sign">
                            <Chip
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInvoiceTracking(invoice);
                              }}
                              icon={<TrackChangesIcon />}
                              label="Track"
                              sx={styles.rowChip}
                              size="small"
                            />
                          </Tooltip>

                          {/* Address & Change Status — verifier views (4, 5, 6) */}
                          {isVerifierView && (
                            <Tooltip title="Address to Signer">
                              <Chip
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddress(invoice);
                                }}
                                icon={<PersonSearchIcon />}
                                label="Address"
                                sx={{ ...styles.rowChip, bgcolor: '#6a1b9a' }}
                                size="small"
                              />
                            </Tooltip>
                          )}

                          {isVerifierView && (
                            <Tooltip title="Change Status">
                              <Chip
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRollbackSupplier(invoice);
                                }}
                                icon={<ReplayIcon />}
                                label="Change Status"
                                sx={{ ...styles.rowChip, bgcolor: '#e65100' }}
                                size="small"
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>

                    {/* Expanded GL lines */}
                    {isExpanded &&
                      hasMultipleGLLines &&
                      renderExpandedGLLines(glLines)}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 2,
          px: 0.5,
        }}
      >
        <Typography variant="caption" sx={{ color: '#888', fontSize: '12px' }}>
          Page {page} of {Math.ceil((activeInvoices?.count || 0) / 10) || 1}{' '}
          &nbsp;·&nbsp; {activeInvoices?.count ?? 0} total records
        </Typography>
        <Pagination
          count={Math.ceil(activeInvoices?.count / 10) || 1}
          page={page}
          onChange={handlePageChange}
          showFirstButton
          showLastButton
          size="small"
          sx={{
            '& .MuiPaginationItem-root': { fontSize: '12px' },
            '& .Mui-selected': {
              backgroundColor: '#00529B',
              color: '#fff',
              '&:hover': { backgroundColor: '#003d75' },
            },
          }}
        />
      </Box>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
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
      {selectedAddress && (
        <AddressInvoiceDialog
          open={openAddress}
          handleClose={handleCloseAddress}
          invoice={selectedAddress}
          onSuccess={handleAddressSuccess}
        />
      )}
      {selectedRollbackSupplier && (
        <RollbackInvoiceToSupplierDialog
          open={openRollbackSupplier}
          handleClose={handleCloseRollbackSupplier}
          invoice={selectedRollbackSupplier}
          onSuccess={handleRollbackSupplierSuccess}
        />
      )}
    </RootLayout>
  );
}
