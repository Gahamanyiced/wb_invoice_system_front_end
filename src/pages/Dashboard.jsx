import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import {
  Box,
  Typography,
  Divider,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import DrawIcon from '@mui/icons-material/Draw';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import {
  getAllInvoiceDashboardByDepartmentAndYear,
  getInvoiceOwnedByYear,
  getInvoiceToSignByYear,
  getSupplierStats,
  setCardIndex,
} from '../features/dashboard/dashboardSlice';
import { getDepartmentByErp } from '../features/department/departmentSlice';
import { setIndex } from '../features/invoice/invoiceSlice';

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ number, label, icon, color, accent, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      flex: '1 1 160px',
      minWidth: 140,
      maxWidth: 220,
      p: 2,
      borderRadius: '12px',
      border: `1px solid ${accent}33`,
      backgroundColor: '#fff',
      cursor: 'pointer',
      transition: 'all 0.18s',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 6px 20px ${accent}22`,
        borderColor: `${accent}66`,
      },
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        backgroundColor: color,
        borderRadius: '12px 12px 0 0',
      },
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '9px',
          backgroundColor: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
    </Box>
    <Typography
      sx={{
        fontSize: '26px',
        fontWeight: 800,
        color: '#1a1a2e',
        lineHeight: 1,
        mb: 0.5,
      }}
    >
      {number ?? '—'}
    </Typography>
    <Typography
      sx={{
        fontSize: '11.5px',
        fontWeight: 500,
        color: '#888',
        lineHeight: 1.3,
      }}
    >
      {label}
    </Typography>
  </Box>
);

// ── Custom tooltip for chart ──────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #e0e8f0',
        borderRadius: '8px',
        px: 1.5,
        py: 1,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <Typography
        sx={{ fontSize: '12px', fontWeight: 700, color: '#333', mb: 0.5 }}
      >
        {label}
      </Typography>
      {payload.map((p, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.fill }}
          />
          <Typography sx={{ fontSize: '12px', color: '#555' }}>
            {p.value} {p.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anotherDashboardIndex, setAnotherDashboardIndex] = useState();
  const [user] = useState(JSON?.parse(localStorage?.getItem('user')));
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('');

  const { invoiceDashboard, index: dashboardStateIndex } = useSelector(
    (state) => state.invoiceDashboard,
  );
  const { index } = useSelector((state) => state.invoice);
  const { allDepartments } = useSelector((state) => state.department);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const canSeeSupplierInvoices =
    user?.role === 'admin' ||
    (user?.role === 'signer_admin' && !!user?.is_invoice_verifier);

  const getInvoiceIndex = () => {
    const activeIndex = dashboardStateIndex || index;
    if (user?.role === 'admin') return activeIndex || 1;
    if (user?.role === 'signer') return activeIndex || 3;
    return activeIndex || 2;
  };

  useEffect(() => {
    const dashboardIndex = getInvoiceIndex();
    setAnotherDashboardIndex(dashboardIndex);
    if (!user) return;
    if (user?.role === 'admin' && dashboardIndex === 1) {
      dispatch(getAllInvoiceDashboardByDepartmentAndYear({ department, year }));
      dispatch(getDepartmentByErp());
    } else if (
      (user?.role === 'signer' || user?.role === 'signer_admin') &&
      dashboardIndex === 3
    ) {
      dispatch(getInvoiceToSignByYear({ id: user?.id, year }));
    } else if (dashboardIndex === 4 && canSeeSupplierInvoices) {
      dispatch(getSupplierStats({ year }));
    } else if (dashboardIndex === 2) {
      dispatch(getInvoiceOwnedByYear({ id: user?.id, year }));
    }
  }, [dispatch, index, dashboardStateIndex, department, year]);

  const supplierCardStatusMap = {
    2: 'pending',
    3: 'approved',
    4: 'denied',
    5: 'rollback',
    6: 'processing',
    9: 'forwarded',
  };

  const handleCardClick = (cardIndex) => {
    if (isSupplierView) {
      dispatch(setIndex(4));
    }
    dispatch(setCardIndex({ cardIndex, year }));
    navigate('/');
  };

  // ── Monthly chart data ──────────────────────────────────────────────────────
  const chartData = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ].map((month) => ({
    month: month.slice(0, 3),
    Invoices: invoiceDashboard?.monthly_counts?.[month]?.invoices ?? 0,
  }));

  // ── Stat cards config ───────────────────────────────────────────────────────
  const isSignerView =
    (user?.role === 'signer' || user?.role === 'signer_admin') &&
    anotherDashboardIndex === 3;
  const isSupplierView = anotherDashboardIndex === 4 && canSeeSupplierInvoices;
  const isOwnerView = !isSignerView && !isSupplierView;

  const cards = isSupplierView
    ? [
        {
          number: invoiceDashboard?.total_invoices,
          label: 'Total Invoices',
          icon: <ReceiptLongIcon sx={{ fontSize: 18, color: '#1565c0' }} />,
          color: '#1565c0',
          accent: '#1565c0',
          cardIndex: 1,
        },
        {
          number: invoiceDashboard?.total_pending_invoices,
          label: 'Pending',
          icon: <PendingActionsIcon sx={{ fontSize: 18, color: '#e65100' }} />,
          color: '#e65100',
          accent: '#e65100',
          cardIndex: 2,
        },
        {
          number: invoiceDashboard?.total_approved_invoices,
          label: 'Approved',
          icon: (
            <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
          ),
          color: '#2e7d32',
          accent: '#2e7d32',
          cardIndex: 3,
        },
        {
          number: invoiceDashboard?.total_denied_invoices,
          label: 'Denied',
          icon: <CancelOutlinedIcon sx={{ fontSize: 18, color: '#c62828' }} />,
          color: '#c62828',
          accent: '#c62828',
          cardIndex: 4,
        },
        {
          number: invoiceDashboard?.total_rollback_invoices,
          label: 'Rollback',
          icon: <ReplayIcon sx={{ fontSize: 18, color: '#6a1b9a' }} />,
          color: '#6a1b9a',
          accent: '#6a1b9a',
          cardIndex: 5,
        },
        {
          number: invoiceDashboard?.total_processing_invoices,
          label: 'Processing',
          icon: <AutorenewIcon sx={{ fontSize: 18, color: '#00838f' }} />,
          color: '#00838f',
          accent: '#00838f',
          cardIndex: 6,
        },
        {
          number: invoiceDashboard?.total_forwarded_invoices,
          label: 'Forwarded',
          icon: <ForwardToInboxIcon sx={{ fontSize: 18, color: '#1565c0' }} />,
          color: '#1565c0',
          accent: '#1565c0',
          cardIndex: 9,
        },
      ]
    : [
        {
          number: invoiceDashboard?.total_invoices,
          label: 'Total Invoices',
          icon: <ReceiptLongIcon sx={{ fontSize: 18, color: '#1565c0' }} />,
          color: '#1565c0',
          accent: '#1565c0',
          cardIndex: 1,
        },
        {
          number: invoiceDashboard?.total_pending_invoices,
          label: 'Pending',
          icon: <PendingActionsIcon sx={{ fontSize: 18, color: '#e65100' }} />,
          color: '#e65100',
          accent: '#e65100',
          cardIndex: 2,
        },
        ...(isOwnerView
          ? [
              {
                number: invoiceDashboard?.total_approved_invoices,
                label: 'Approved',
                icon: (
                  <CheckCircleOutlineIcon
                    sx={{ fontSize: 18, color: '#2e7d32' }}
                  />
                ),
                color: '#2e7d32',
                accent: '#2e7d32',
                cardIndex: 3,
              },
            ]
          : []),
        {
          number: invoiceDashboard?.total_denied_invoices,
          label: 'Denied',
          icon: <CancelOutlinedIcon sx={{ fontSize: 18, color: '#c62828' }} />,
          color: '#c62828',
          accent: '#c62828',
          cardIndex: 4,
        },
        ...(isOwnerView
          ? [
              {
                number: invoiceDashboard?.total_rollback_invoices,
                label: 'Rollback',
                icon: <ReplayIcon sx={{ fontSize: 18, color: '#6a1b9a' }} />,
                color: '#6a1b9a',
                accent: '#6a1b9a',
                cardIndex: 5,
              },
            ]
          : []),
        ...(isOwnerView
          ? [
              {
                number: invoiceDashboard?.total_processing_invoices,
                label: 'Processing',
                icon: <AutorenewIcon sx={{ fontSize: 18, color: '#00838f' }} />,
                color: '#00838f',
                accent: '#00838f',
                cardIndex: 6,
              },
            ]
          : []),
        ...(isSignerView
          ? [
              {
                number: invoiceDashboard?.total_to_sign_invoices,
                label: 'To Sign',
                icon: <DrawIcon sx={{ fontSize: 18, color: '#00838f' }} />,
                color: '#00838f',
                accent: '#00838f',
                cardIndex: 7,
              },
            ]
          : []),
        ...(isSignerView
          ? [
              {
                number: invoiceDashboard?.total_signed_invoices,
                label: 'Signed',
                icon: <HowToRegIcon sx={{ fontSize: 18, color: '#2e7d32' }} />,
                color: '#2e7d32',
                accent: '#2e7d32',
                cardIndex: 8,
              },
            ]
          : []),
        ...(isOwnerView
          ? [
              {
                number: invoiceDashboard?.total_forwarded_invoices,
                label: 'Forwarded',
                icon: (
                  <ForwardToInboxIcon sx={{ fontSize: 18, color: '#1565c0' }} />
                ),
                color: '#1565c0',
                accent: '#1565c0',
                cardIndex: 9,
              },
            ]
          : []),
      ];

  // ── Role label ──────────────────────────────────────────────────────────────
  const viewLabel = isSupplierView
    ? 'Supplier Invoices Overview'
    : isSignerView
      ? 'Invoice Approval Overview'
      : anotherDashboardIndex === 1
        ? 'All Invoices Overview'
        : 'My Invoices Overview';

  return (
    <RootLayout>
      {/* ── Page header ──────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#00529B',
              lineHeight: 1.2,
            }}
          >
            Dashboard
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#888', mt: 0.25 }}>
            {viewLabel}
          </Typography>
        </Box>

        {/* Year + Department filters */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {user?.role === 'admin' && anotherDashboardIndex === 1 && (
            <Select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              size="small"
              sx={{
                fontSize: '12.5px',
                minWidth: 130,
                borderRadius: '8px',
                '& fieldset': { borderColor: '#e0e8f0' },
                '&:hover fieldset': { borderColor: '#90caf9' },
              }}
            >
              <MenuItem value="All" sx={{ fontSize: '12.5px' }}>
                All Departments
              </MenuItem>
              {allDepartments?.Departments?.map((d, i) => (
                <MenuItem key={i} value={d} sx={{ fontSize: '12.5px' }}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          )}
          <Select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            size="small"
            displayEmpty
            sx={{
              fontSize: '12.5px',
              minWidth: 110,
              borderRadius: '8px',
              '& fieldset': { borderColor: '#e0e8f0' },
              '&:hover fieldset': { borderColor: '#90caf9' },
            }}
          >
            <MenuItem value="" sx={{ fontSize: '12.5px' }}>
              All Years
            </MenuItem>
            {years.map((y, i) => (
              <MenuItem key={i} value={y} sx={{ fontSize: '12.5px' }}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
        {cards.map((card, i) => (
          <StatCard
            key={i}
            number={card.number}
            label={card.label}
            icon={card.icon}
            color={card.color}
            accent={card.accent}
            onClick={() => handleCardClick(card.cardIndex)}
          />
        ))}
      </Box>

      {/* ── Monthly bar chart ─────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{ border: '1px solid #e0e8f0', borderRadius: '12px', p: 2.5 }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: '14px', fontWeight: 700, color: '#222' }}
            >
              Monthly Invoice Activity
            </Typography>
            <Typography sx={{ fontSize: '11.5px', color: '#888' }}>
              {year || currentYear} — invoices per month
            </Typography>
          </Box>
        </Box>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f4f8"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#999' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#999' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0f4f8' }} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
            <Bar
              dataKey="Invoices"
              fill="#00529B"
              radius={[5, 5, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </RootLayout>
  );
}

export default Dashboard;
