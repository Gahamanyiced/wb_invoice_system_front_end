import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CircularProgress from '@mui/joy/CircularProgress';
import Typography from '@mui/joy/Typography';
import { NavLink, useNavigate } from 'react-router-dom';
import { setCardIndex } from '../features/dashboard/dashboardSlice';
import { useDispatch } from 'react-redux';

export default function DashboardCard(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleCardClick = (cardIndex, year) => {
    // console.log(cardIndex);
    dispatch(setCardIndex({cardIndex,year}));
    navigate('/');
  };
  return (
    <Card
      variant="solid"
      color="primary"
      invertedColors
      onClick={() => handleCardClick(props.data.cardIndex, props.year)}
      sx={{
        mx: 3,
        my: 5,
        backgroundColor: props.data.bgcolor,
        width: '75%',
        height: '55%',
      }}
    >
      <CardContent orientation="horizontal" sx={{ py: 2 }}>
        <CircularProgress size="lg" determinate value={20}>
          {props.data?.icon}
        </CircularProgress>
        <CardContent>
          <Typography level="body-md">{props.data?.status}</Typography>
          <Typography level="h2">{props.data?.number}</Typography>
        </CardContent>
      </CardContent>
    </Card>
  );
}
