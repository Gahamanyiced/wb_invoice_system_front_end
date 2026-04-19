import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { setCardIndex } from '../features/dashboard/dashboardSlice';
import { useDispatch } from 'react-redux';

export default function DashboardCard({ data, year }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setCardIndex({ cardIndex: data.cardIndex, year }));
    navigate('/');
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        minWidth: 150,
        maxWidth: 200,
        p: 2,
        borderRadius: '12px',
        border: `1px solid ${data.bgcolor}33`,
        backgroundColor: '#fff',
        cursor: 'pointer',
        transition: 'all 0.18s',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 20px ${data.bgcolor}22`,
          borderColor: `${data.bgcolor}66`,
        },
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: data.bgcolor,
          borderRadius: '12px 12px 0 0',
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '9px',
          backgroundColor: `${data.bgcolor}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
          color: data.bgcolor,
        }}
      >
        {data.icon}
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
        {data.number ?? '—'}
      </Typography>
      <Typography
        sx={{
          fontSize: '11.5px',
          fontWeight: 500,
          color: '#888',
          lineHeight: 1.3,
        }}
      >
        {data.status}
      </Typography>
    </Box>
  );
}
