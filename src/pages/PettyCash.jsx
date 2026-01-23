import { Box } from '@mui/material';
import RootLayout from '../layouts/RootLayout';
import PettyCashTransactions from '../components/PettyCashTransactions';

const PettyCash = () => {
  return (
    <RootLayout>
      <Box sx={{ width: '100%' }}>
        <PettyCashTransactions />
      </Box>
    </RootLayout>
  );
};

export default PettyCash;
