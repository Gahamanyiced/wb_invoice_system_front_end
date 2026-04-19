import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';

// components
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

// Sidebar width must stay in sync with SIDEBAR_WIDTH in Sidebar.jsx
const SIDEBAR_WIDTH = 240;

export default function RootLayout(props) {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Fixed-width sidebar — never squished by content */}
      <Box
        sx={{
          width: `${SIDEBAR_WIDTH}px`,
          minWidth: `${SIDEBAR_WIDTH}px`,
          flexShrink: 0,
        }}
      >
        <Sidebar />
      </Box>

      {/* Main content — takes all remaining space, scrolls independently */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'auto',
            pt: 4,
            px: 3,
            pb: '48px',
          }}
        >
          {props.children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
