import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

// components
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

export default function RootLayout(props) {
  return (
    <>
      {/* <Navbar /> */}

      <Grid container spacing={0} className="sidebar-container">
        <Grid className="sidebar" style={{ width: '16.666%' }}>
          <span>
            <Sidebar />
          </span>
        </Grid>
        <Grid className="main" style={{ width: '83.333%' }} sx={{ p: 0 }}>
          <Box sx={{ mt: 5, mx: 3 }}>{props.children}</Box>
          <Footer />
        </Grid>
      </Grid>
    </>
  );
}