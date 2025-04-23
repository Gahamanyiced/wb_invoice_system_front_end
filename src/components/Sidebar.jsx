import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AiOutlineUser, AiOutlineDashboard } from 'react-icons/ai';
import { BiBuildingHouse, BiBookContent, BiUserCircle } from 'react-icons/bi';
import { List, ListItem as MuiListItem, Typography, Box } from '@mui/material';
import Logo from '../assets/images/logo.jpg';
import LogoutIcon from '@mui/icons-material/Logout';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { Menu, MenuItem } from '@mui/material';
import { setIndex } from '../features/invoice/invoiceSlice';
import { setDashboardIndex } from '../features/dashboard/dashboardSlice';
import { setCardIndex } from '../features/dashboard/dashboardSlice';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { AccountCircle } from '@mui/icons-material';
import { PiStepsFill } from 'react-icons/pi';
import { PiSteps } from 'react-icons/pi';
import { PiStepsDuotone } from 'react-icons/pi';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

const ListItem = (props) => (
  <MuiListItem sx={{ marginBottom: '20px' }} {...props} />
);

export default function Sidebar() {
  const username = JSON.parse(localStorage.getItem('username'));
  const firstName = username.split('.')[0];
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElDashboard, setAnchorElDashboard] = useState(null);

  const handleInvoice = (index) => {
    dispatch(setIndex(index));
    handleClose();
  };

  const handleDashboard = (index) => {
    dispatch(setIndex(index));
    handleDashboardClose();
  };

  const handleClick = (event) => {
    dispatch(setCardIndex(null));
    setAnchorEl(event.currentTarget);
  };

  const handleDashboardClick = (event) => {
    dispatch(setCardIndex(null));
    setAnchorElDashboard(event.currentTarget);
  };

  const handleDashboardClose = () => {
    setAnchorElDashboard(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const user = JSON?.parse(localStorage?.getItem('user'));


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('index');
    navigate('/login');
  };

  return (
    <>
      <List
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <ListItem>
            <Box
              component="img"
              sx={{
                height: 50,
                width: 200,
                color: '#857f7f',
                mt: '20px',
                mb: '40px',
              }}
              alt="logo.."
              src={Logo}
            />
          </ListItem>

          <ListItem>
            <NavLink to="/dashboard" style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AiOutlineDashboard size={21} color="white" />
                <Typography
                  variant="h6"
                  sx={{ color: 'white', marginLeft: '10px', fontSize: '16px' }}
                  onClick={handleDashboardClick}
                >
                  Dashboard
                </Typography>
                <Menu
                  id="simple-menu"
                  anchorEl={anchorElDashboard}
                  keepMounted
                  open={Boolean(anchorElDashboard)}
                  onClose={handleDashboardClose}
                >
                  {user?.role === 'admin' && (
                    <MenuItem onClick={() => handleDashboard(1)}>
                      All Invoices
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => handleDashboard(2)}>
                    My Invoices
                  </MenuItem>
                  {(user?.role === 'signer' ||
                    user?.role === 'signer_admin') && (
                    <MenuItem onClick={() => handleDashboard(3)}>
                      Invoices To Sign
                    </MenuItem>
                  )}
                </Menu>
              </Box>
            </NavLink>
          </ListItem>

          <ListItem>
            <NavLink to="/" style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventNoteOutlinedIcon size={21} sx={{ color: 'white' }} />
                <Typography
                  variant="h6"
                  sx={{ color: 'white', marginLeft: '10px', fontSize: '16px' }}
                  onClick={handleClick}
                >
                  Invoice
                </Typography>
                <Menu
                  id="simple-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {user?.role === 'admin' && (
                    <MenuItem onClick={() => handleInvoice(1)}>All Invoices</MenuItem>
                  )}
                  <MenuItem onClick={() => handleInvoice(2)}>My Invoices</MenuItem>
                  {(user?.role === 'signer' ||
                    user?.role === 'signer_admin') && (
                    <MenuItem onClick={() => handleInvoice(3)}>
                      Invoices To Sign
                    </MenuItem>
                  )}
                </Menu>
              </Box>
            </NavLink>
          </ListItem>

          {user?.role === 'admin' && (
            <ListItem>
              <NavLink to="/user" style={{ textDecoration: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AiOutlineUser size={21} color="white" />
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      marginLeft: '10px',
                      fontSize: '16px',
                    }}
                  >
                    User
                  </Typography>
                </Box>
              </NavLink>
            </ListItem>
          )}

          {user?.role === 'admin' && (
            <ListItem>
              <NavLink to="/department" style={{ textDecoration: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BiBuildingHouse size={21} color="white" />
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      marginLeft: '10px',
                      fontSize: '16px',
                    }}
                  >
                    Department
                  </Typography>
                </Box>
              </NavLink>
            </ListItem>
          )}

          {user?.role === 'admin' && (
            <ListItem>
              <NavLink to="/section" style={{ textDecoration: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BiBookContent size={21} color="white" />
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      marginLeft: '10px',
                      fontSize: '16px',
                    }}
                  >
                    Section
                  </Typography>
                </Box>
              </NavLink>
            </ListItem>
          )}

          {(user?.role === 'admin' || user?.role === 'signer_admin') && (
            <ListItem>
              <NavLink to="/signing-flow" style={{ textDecoration: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PiStepsDuotone size={21} color="white" />
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      marginLeft: '10px',
                      fontSize: '16px',
                    }}
                  >
                    Signing Flow
                  </Typography>
                </Box>
              </NavLink>
            </ListItem>
          )}

          {/* New menu items for approved users */}
          {user?.is_approved === true && (
            <ListItem>
              <NavLink to="/verify-invoice" style={{ textDecoration: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FactCheckIcon sx={{ color: 'white' }} />
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      marginLeft: '10px',
                      fontSize: '16px',
                    }}
                  >
                    Verify Invoice
                  </Typography>
                </Box>
              </NavLink>
            </ListItem>
          )}

          <ListItem onClick={handleLogout}>
            <NavLink to="" style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LogoutIcon size={21} sx={{ color: 'white' }} />
                <Typography
                  variant="h6"
                  sx={{ color: 'white', marginLeft: '10px', fontSize: '16px' }}
                >
                  Logout
                </Typography>
              </Box>
            </NavLink>
          </ListItem>
        </Box>

        <ListItem>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: '#E5E5E5',
              gap: '10px',
            }}
          >
            <AccountCircle />
            <Typography>{firstName}</Typography>
          </Box>
        </ListItem>
      </List>
    </>
  );
}
