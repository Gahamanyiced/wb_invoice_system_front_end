// src/pages/PettyCashDashboard.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RootLayout from '../layouts/RootLayout';
import {
  Box,
  Typography,
  Divider,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ReplayIcon from '@mui/icons-material/Replay';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
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
import { getPettyCashDashboard } from '../features/pettyCash/pettyCashSlice';

// ── Stat card — same design as Invoice Dashboard ──────────────────────────────
const StatCard = ({ number, label, icon, color, accent }) => (
  <Box
    sx={{
      flex: '1 1 150px',
      minWidth: 130,
      maxWidth: 210,
      p: 2,
      borderRadius: '12px',
      border: `1px solid ${accent}33`,
      backgroundColor: '#fff',
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
    <Box sx={{ mb: 1.5 }}>
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
        fontSize: '24px',
        fontWeight: 800,
        color: '#1a1a2e',
        lineHeight: 1,
        mb: 0.5,
      }}
    >
      {number ?? '—'}
    </Typography>
    <Typography
      sx={{ fontSize: '11px', fontWeight: 500, color: '#888', lineHeight: 1.3 }}
    >
      {label}
    </Typography>
  </Box>
);

// ── Section heading ───────────────────────────────────────────────────────────
const SectionHeading = ({ label }) => (
  <Typography
    sx={{
      fontSize: '11px',
      fontWeight: 700,
      color: '#00529B',
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
      mb: 1.5,
    }}
  >
    {label}
  </Typography>
);

// ── Custom tooltip ────────────────────────────────────────────────────────────
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

// ── Card configs per section ──────────────────────────────────────────────────
const PC_CARDS = [
  {
    key: 'total',
    label: 'Total Issuances',
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 18, color: '#00529B' }} />,
    color: '#00529B',
    accent: '#00529B',
  },
  {
    key: 'active',
    label: 'Active',
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#2e7d32' }} />,
    color: '#2e7d32',
    accent: '#2e7d32',
  },
  {
    key: 'exhausted',
    label: 'Exhausted',
    icon: <PauseCircleOutlineIcon sx={{ fontSize: 18, color: '#e65100' }} />,
    color: '#e65100',
    accent: '#e65100',
  },
  {
    key: 'closed',
    label: 'Closed',
    icon: <CancelOutlinedIcon sx={{ fontSize: 18, color: '#616161' }} />,
    color: '#616161',
    accent: '#616161',
  },
  {
    key: 'pending_acknowledgment',
    label: 'Pending Acknowledgment',
    icon: <HourglassEmptyIcon sx={{ fontSize: 18, color: '#f57c00' }} />,
    color: '#f57c00',
    accent: '#f57c00',
  },
  {
    key: 'total_issued_amount',
    label: 'Total Issued',
    icon: <AttachMoneyIcon sx={{ fontSize: 18, color: '#1565c0' }} />,
    color: '#1565c0',
    accent: '#1565c0',
  },
  {
    key: 'total_remaining_amount',
    label: 'Total Remaining',
    icon: <AttachMoneyIcon sx={{ fontSize: 18, color: '#2e7d32' }} />,
    color: '#2e7d32',
    accent: '#2e7d32',
  },
];

const EXPENSE_CARDS = [
  {
    key: 'total',
    label: 'Total Expenses',
    icon: <ReceiptIcon sx={{ fontSize: 18, color: '#00529B' }} />,
    color: '#00529B',
    accent: '#00529B',
  },
  {
    key: 'approved',
    label: 'Approved',
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#2e7d32' }} />,
    color: '#2e7d32',
    accent: '#2e7d32',
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: <PendingActionsIcon sx={{ fontSize: 18, color: '#e65100' }} />,
    color: '#e65100',
    accent: '#e65100',
  },
  {
    key: 'denied',
    label: 'Denied',
    icon: <CancelOutlinedIcon sx={{ fontSize: 18, color: '#c62828' }} />,
    color: '#c62828',
    accent: '#c62828',
  },
  {
    key: 'processing',
    label: 'Processing',
    icon: <AutorenewIcon sx={{ fontSize: 18, color: '#00838f' }} />,
    color: '#00838f',
    accent: '#00838f',
  },
  {
    key: 'rollback',
    label: 'Rollback',
    icon: <ReplayIcon sx={{ fontSize: 18, color: '#6a1b9a' }} />,
    color: '#6a1b9a',
    accent: '#6a1b9a',
  },
  {
    key: 'total_approved_amount',
    label: 'Approved Amount',
    icon: <AttachMoneyIcon sx={{ fontSize: 18, color: '#2e7d32' }} />,
    color: '#2e7d32',
    accent: '#2e7d32',
  },
];

const REQUEST_CARDS = [
  {
    key: 'total',
    label: 'Total Requests',
    icon: <AssignmentIcon sx={{ fontSize: 18, color: '#00529B' }} />,
    color: '#00529B',
    accent: '#00529B',
  },
  {
    key: 'approved',
    label: 'Approved',
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#2e7d32' }} />,
    color: '#2e7d32',
    accent: '#2e7d32',
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: <PendingActionsIcon sx={{ fontSize: 18, color: '#e65100' }} />,
    color: '#e65100',
    accent: '#e65100',
  },
  {
    key: 'denied',
    label: 'Denied',
    icon: <CancelOutlinedIcon sx={{ fontSize: 18, color: '#c62828' }} />,
    color: '#c62828',
    accent: '#c62828',
  },
  {
    key: 'processing',
    label: 'Processing',
    icon: <AutorenewIcon sx={{ fontSize: 18, color: '#00838f' }} />,
    color: '#00838f',
    accent: '#00838f',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#1565c0' }} />,
    color: '#1565c0',
    accent: '#1565c0',
  },
  {
    key: 'rollback',
    label: 'Rollback',
    icon: <ReplayIcon sx={{ fontSize: 18, color: '#6a1b9a' }} />,
    color: '#6a1b9a',
    accent: '#6a1b9a',
  },
  {
    key: 'total_approved_amount',
    label: 'Approved Amount',
    icon: <AttachMoneyIcon sx={{ fontSize: 18, color: '#2e7d32' }} />,
    color: '#2e7d32',
    accent: '#2e7d32',
  },
];

const MONTHS = [
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
];

function PettyCashDashboard() {
  const dispatch = useDispatch();
  const { pettyCashDashboard, isLoading } = useSelector(
    (state) => state.pettyCash,
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const [year, setYear] = useState('');

  useEffect(() => {
    dispatch(getPettyCashDashboard());
  }, [dispatch, year]);

  // ── Monthly chart data from monthly_counts ────────────────────────────────
  const chartData = MONTHS.map((month) => ({
    month: month.slice(0, 3),
    'Petty Cash': Number(
      pettyCashDashboard?.monthly_counts?.[month]?.petty_cash ?? 0,
    ),
    Expenses: Number(
      pettyCashDashboard?.monthly_counts?.[month]?.expenses ?? 0,
    ),
    Requests: Number(
      pettyCashDashboard?.monthly_counts?.[month]?.requests ?? 0,
    ),
  }));

  const pc = pettyCashDashboard?.petty_cash || {};
  const expenses = pettyCashDashboard?.expenses || {};
  const requests = pettyCashDashboard?.requests || {};

  return (
    <RootLayout>
      {/* ── Page header ───────────────────────────────────────────────── */}
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
            {pettyCashDashboard?.title || 'Petty Cash Overview'}
          </Typography>
        </Box>

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
          {years.map((y) => (
            <MenuItem key={y} value={y} sx={{ fontSize: '12.5px' }}>
              {y}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#00529B' }} />
        </Box>
      ) : (
        <>
          {/* ── Petty Cash Issuances ─────────────────────────────────── */}
          <SectionHeading label="Issuances" />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
            {PC_CARDS.map((card) => (
              <StatCard
                key={card.key}
                number={pc[card.key]}
                label={card.label}
                icon={card.icon}
                color={card.color}
                accent={card.accent}
              />
            ))}
          </Box>

          {/* ── Expenses ─────────────────────────────────────────────── */}
          <SectionHeading label="Expenses" />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
            {EXPENSE_CARDS.map((card) => (
              <StatCard
                key={card.key}
                number={expenses[card.key]}
                label={card.label}
                icon={card.icon}
                color={card.color}
                accent={card.accent}
              />
            ))}
          </Box>

          {/* ── Requests ─────────────────────────────────────────────── */}
          <SectionHeading label="Requests" />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
            {REQUEST_CARDS.map((card) => (
              <StatCard
                key={card.key}
                number={requests[card.key]}
                label={card.label}
                icon={card.icon}
                color={card.color}
                accent={card.accent}
              />
            ))}
          </Box>

          {/* ── Monthly activity chart ────────────────────────────────── */}
          <Paper
            elevation={0}
            sx={{ border: '1px solid #e0e8f0', borderRadius: '12px', p: 2.5 }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{ fontSize: '14px', fontWeight: 700, color: '#222' }}
              >
                Monthly Activity
              </Typography>
              <Typography sx={{ fontSize: '11.5px', color: '#888' }}>
                {year || currentYear} — issuances, expenses & requests per month
              </Typography>
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
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: '#f0f4f8' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                />
                <Bar
                  dataKey="Petty Cash"
                  fill="#00529B"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="Expenses"
                  fill="#6a1b9a"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="Requests"
                  fill="#00838f"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </>
      )}
    </RootLayout>
  );
}

export default PettyCashDashboard;
