import { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import RootLayout from '../layouts/RootLayout';
import PettyCashTransactions from '../components/PettyCashTransactions';
import PettyCashRequests from '../components/PettyCashRequests';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`petty-cash-tabpanel-${index}`}
      aria-labelledby={`petty-cash-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const PettyCash = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <RootLayout>
      <Box sx={{ width: '100%' }}>
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="petty cash tabs"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '15px',
                fontWeight: 500,
                color: 'rgba(0, 0, 0, 0.6)',
                '&.Mui-selected': {
                  color: '#00529B',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#00529B',
                height: 3,
              },
            }}
          >
            <Tab label="Transactions" />
            <Tab label="Petty Cash Requests" />
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          <PettyCashTransactions />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <PettyCashRequests />
        </TabPanel>
      </Box>
    </RootLayout>
  );
};

export default PettyCash;
