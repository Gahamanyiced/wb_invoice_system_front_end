import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import { Grid, Typography, Select, MenuItem, Box } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import PendingIcon from '@mui/icons-material/Pending'; // Replace with actual icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DashboardCard from '../components/DashboardCard';
import ForwardIcon from '@mui/icons-material/Forward';
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
} from '../features/dashboard/dashboardSlice';
import { getDepartmentByErp } from '../features/department/departmentSlice';

// Sample data for BarChart
const data1 = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  // Add more data as needed
];

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anotherDashboardIndex, setAnotherDashboardIndex] = useState();
  const [user, setUser] = useState(JSON?.parse(localStorage?.getItem('user')));
  const { invoiceDashboard } = useSelector((state) => state.invoiceDashboard);
  const { index } = useSelector((state) => state.invoice);
  const { allDepartments } = useSelector((state) => state.department);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('');

  const getInvoiceIndex = () => {
    if (user?.role === 'admin') {
      return index || 1;
    } else if (user?.role === 'signer') {
      return index || 3;
    } else {
      return index || 2;
    }
  };

  useEffect(() => {
    const dashboardIndex = getInvoiceIndex();
    setAnotherDashboardIndex(dashboardIndex);
    if (user) {
      if (user?.role === 'admin' && dashboardIndex === 1) {
        dispatch(
          getAllInvoiceDashboardByDepartmentAndYear({
            department,
            year,
          })
        );
        dispatch(getDepartmentByErp());
      } else if (
        (user?.role === 'signer' || user?.role === 'signer_admin') &&
        dashboardIndex === 3
      ) {
        dispatch(getInvoiceToSignByYear({ id: user?.id, year }));
      } else if (dashboardIndex === 2) {
        dispatch(getInvoiceOwnedByYear({ id: user?.id, year }));
      }
    }
  }, [dispatch, index, department, year, user]);
  
  const data = [
    { month: 'January', Invoices: invoiceDashboard?.monthly_counts?.January?.invoices },
    {
      month: 'February',
      Invoices: invoiceDashboard?.monthly_counts?.February?.invoices,
    },
    { month: 'March', Invoices: invoiceDashboard?.monthly_counts?.March?.invoices },
    { month: 'April', Invoices: invoiceDashboard?.monthly_counts?.April?.invoices },
    { month: 'May', Invoices: invoiceDashboard?.monthly_counts?.May?.invoices },
    { month: 'June', Invoices: invoiceDashboard?.monthly_counts?.June?.invoices },
    { month: 'July', Invoices: invoiceDashboard?.monthly_counts?.July?.invoices },
    { month: 'August', Invoices: invoiceDashboard?.monthly_counts?.August?.invoices },
    {
      month: 'September',
      Invoices: invoiceDashboard?.monthly_counts?.September?.invoices,
    },
    { month: 'October', Invoices: invoiceDashboard?.monthly_counts?.October?.invoices },
    {
      month: 'November',
      Invoices: invoiceDashboard?.monthly_counts?.November?.invoices,
    },
    {
      month: 'December',
      Invoices: invoiceDashboard?.monthly_counts?.December?.invoices,
    },
  ];

  return (
    <RootLayout>
      <Grid container spacing={2}>
        <Grid style={{ width: '100%' }}>
          <Typography variant="h2" sx={{ mb: 5 }}>
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            {[
              {
                number: invoiceDashboard?.total_invoices,
                status: 'Total Invoices',
                icon: <DoneIcon />,
                bgcolor: '#1e88e5',
                cardIndex: 1,
              },
              {
                number: invoiceDashboard?.total_pending_invoices,
                status: 'Pending Invoices',
                icon: <PendingIcon />,
                bgcolor: '#5e35b1',
                cardIndex: 2,
              },

              ...(((user?.role === 'signer' || user?.role === 'signer_admin') &&
                anotherDashboardIndex === 2) ||
              user.role === 'admin' ||
              user.role === 'staff'
                ? [
                    {
                      number: invoiceDashboard?.total_approved_invoices,
                      status: 'Approved Invoices',
                      icon: <CheckCircleIcon />,
                      bgcolor: '#4b4a46',
                      cardIndex: 3,
                    },
                  ]
                : []),

              {
                number: invoiceDashboard?.total_denied_invoices,
                status: 'Denied Invoices',
                icon: <CancelIcon />,
                bgcolor: '#a10000',
                cardIndex: 4,
              },

              ...(((user?.role === 'signer' || user?.role === 'signer_admin') &&
                anotherDashboardIndex === 2) ||
              user.role === 'admin' ||
              user.role === 'staff'
                ? [
                    {
                      number: invoiceDashboard?.total_rollback_invoices,
                      status: 'Rollback Invoices',
                      icon: <CancelIcon />,
                      bgcolor: '#008000',
                      cardIndex: 5,
                    },
                  ]
                : []),

              ...(((user?.role === 'signer' || user?.role === 'signer_admin') &&
                anotherDashboardIndex === 2) ||
              user.role === 'admin' ||
              user.role === 'staff'
                ? [
                    {
                      number: invoiceDashboard?.total_processing_invoices,
                      status: 'Processing Invoices',
                      icon: <CancelIcon />,
                      bgcolor: '#000080',
                      cardIndex: 6,
                    },
                  ]
                : []),

              ...((user?.role === 'signer' || user?.role === 'signer_admin') &&
              anotherDashboardIndex === 3
                ? [
                    {
                      number: invoiceDashboard?.total_to_sign_invoices,
                      status: 'To sign Invoices',
                      icon: <CancelIcon />,
                      bgcolor: '#008000',
                      cardIndex: 7,
                    },
                  ]
                : []),
              ...((user?.role === 'signer' || user?.role === 'signer_admin') &&
              anotherDashboardIndex === 3
                ? [
                    {
                      number: invoiceDashboard?.total_signed_invoices,
                      status: 'Signed Invoices',
                      icon: <CheckCircleIcon />,
                      bgcolor: '#4b4a46',
                      cardIndex: 8,
                    },
                  ]
                : []),
              ...(((user?.role === 'signer' || user?.role === 'signer_admin') &&
                anotherDashboardIndex === 2) ||
              user.role === 'admin' ||
              user.role === 'staff'
                ? [
                    {
                      number: invoiceDashboard?.total_forwarded_invoices,
                      status: 'Forwarded Invoices',
                      icon: <ForwardIcon />,
                      bgcolor: '#008000',
                      cardIndex: 9,
                    },
                  ]
                : []),
            ].map((item, index) => (
              <Box
                key={index}
                sx={{ p: index === 0 ? 0 : 0.2, mx: index === 0 ? 0 : -0.5 }}
              >
                <DashboardCard data={item} year={year} />
              </Box>
            ))}
          </Box>
        </Grid>

        <Grid container sx={{ justifyContent: 'flex-end' }}>
          <Grid style={{ flexBasis: 'fit-content' }}>
            <Select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              {allDepartments?.Departments?.map((department, index) => (
                <MenuItem key={index} value={department}>
                  {department}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid style={{ flexBasis: 'fit-content' }}>
            <Select value={year} onChange={(e) => setYear(e.target.value)}>
              {years?.map((year, index) => (
                <MenuItem key={index} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
        <Grid style={{ width: '100%' }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Invoices" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </RootLayout>
  );
}

export default Dashboard;