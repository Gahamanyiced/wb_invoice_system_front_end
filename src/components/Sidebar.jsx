import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Box, 
  List, 
  Typography, 
  Collapse,
  Divider,
  Avatar,
  Tooltip,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Logo from '../assets/images/logo.jpg';

// Icons
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';

// Redux actions
import { setIndex } from '../features/invoice/invoiceSlice';
import { setDashboardIndex, setCardIndex } from '../features/dashboard/dashboardSlice';

// Color constants
const COLORS = {
  primary: '#00529B',        // RwandAir blue (primary brand color)
  sidebar: '#192a45',        // Dark blue sidebar background
  textPrimary: '#FFFFFF',    // White text
  textSecondary: 'rgba(255, 255, 255, 0.7)', // Dimmed white text
  textMuted: 'rgba(255, 255, 255, 0.5)', // More dimmed white text
  divider: 'rgba(255, 255, 255, 0.1)', // Very subtle white
  hoverBg: 'rgba(255, 255, 255, 0.1)', // Subtle white hover background
  activeBg: '#00529B',       // Active item background (primary)
  activeSubBg: 'rgba(0, 82, 155, 0.2)', // Translucent primary for sub-items
  shadow: 'rgba(0, 82, 155, 0.3)' // Shadow color
};

// Styled components
const SidebarContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  width: '280px',
  backgroundColor: COLORS.sidebar,
  color: COLORS.textPrimary,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
  transition: 'width 0.3s ease',
  overflow: 'hidden',
  position: 'relative',
}));

const LogoContainer = styled(Box)({
  padding: '24px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: COLORS.textSecondary,
  display: 'flex',
  alignItems: 'center',
  padding: '12px 20px',
  borderRadius: '8px',
  margin: '4px 12px',
  transition: 'all 0.2s',
  position: 'relative',
  
  '&:hover': {
    backgroundColor: COLORS.hoverBg,
    color: COLORS.textPrimary,
  },
  
  '&.active': {
    backgroundColor: COLORS.activeBg,
    color: COLORS.textPrimary,
    boxShadow: `0 4px 10px ${COLORS.shadow}`,
    
    '&:before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '4px',
      height: '60%',
      backgroundColor: COLORS.textPrimary,
      borderRadius: '0 4px 4px 0',
    }
  },
}));

const MenuLink = styled(Box)({
  textDecoration: 'none',
  color: COLORS.textSecondary,
  display: 'flex',
  alignItems: 'center',
  padding: '12px 20px',
  borderRadius: '8px',
  margin: '4px 12px',
  transition: 'all 0.2s',
  position: 'relative',
  cursor: 'pointer',
  
  '&:hover': {
    backgroundColor: COLORS.hoverBg,
    color: COLORS.textPrimary,
  },
});

const MenuHeading = styled(Typography)({
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: COLORS.textMuted,
  padding: '8px 24px',
  marginTop: '16px',
});

const MenuIcon = styled(Box)({
  marginRight: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
});

const SubMenuItem = styled(Box)(({ theme }) => ({
  padding: '10px 20px 10px 56px',
  color: COLORS.textSecondary,
  borderRadius: '8px',
  margin: '2px 12px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '14px',
  position: 'relative',
  
  '&:hover': {
    backgroundColor: COLORS.hoverBg,
    color: COLORS.textPrimary,
  },
  
  '&.active': {
    backgroundColor: COLORS.activeSubBg,
    color: COLORS.textPrimary,
  },
}));

const UserProfileSection = styled(Box)({
  padding: '16px',
  marginTop: 'auto',
  borderTop: `1px solid ${COLORS.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const UserInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [dashboardMenuOpen, setDashboardMenuOpen] = useState(false);
  const [invoiceMenuOpen, setInvoiceMenuOpen] = useState(false);
  
  // Local state for active menu tracking
  const [activeInvoiceOption, setActiveInvoiceOption] = useState(null);
  const [activeDashboardOption, setActiveDashboardOption] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const username = JSON.parse(localStorage.getItem('username') || '""');
  const firstName = username.split('.')[0] || '';
  const lastName = username.split('.')[1] || '';
  
  // Set initial active menu based on URL path
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/dashboard') {
      setDashboardMenuOpen(true);
    } else if (path === '/') {
      setInvoiceMenuOpen(true);
    }
  }, [location.pathname]);
  
  const toggleDashboardMenu = (e) => {
    if (e) e.preventDefault();
    setDashboardMenuOpen(!dashboardMenuOpen);
    // If we're opening this menu, close the other
    if (!dashboardMenuOpen) {
      setInvoiceMenuOpen(false);
    }
  };
  
  const toggleInvoiceMenu = (e) => {
    if (e) e.preventDefault();
    setInvoiceMenuOpen(!invoiceMenuOpen);
    // If we're opening this menu, close the other
    if (!invoiceMenuOpen) {
      setDashboardMenuOpen(false);
    }
  };
  
  const handleInvoiceOption = (index) => {
    dispatch(setIndex(index));
    dispatch(setCardIndex(null)); // Reset card index when changing main menu
    setActiveInvoiceOption(index);
    navigate('/');
  };
  
  const handleDashboardOption = (index) => {
    dispatch(setDashboardIndex(index));
    dispatch(setIndex(index)); // This was missing - we need to set both indices
    dispatch(setCardIndex(null)); // Reset card index when changing main menu
    setActiveDashboardOption(index);
    navigate('/dashboard');
  };
  
  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('index');
    
    // Force navigation to login page
    navigate('/login', { replace: true });
  }
  
  // Get initials for avatar
  const getInitials = () => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  return (
    <SidebarContainer>
      <Box>
        <LogoContainer>
          <Box
            component="img"
            src={Logo}
            alt="RwandAir Logo"
            sx={{ height: 50, maxWidth: 180 }}
          />
        </LogoContainer>
        
        <Divider sx={{ backgroundColor: COLORS.divider, my: 1 }} />
        
        <MenuHeading>Main</MenuHeading>
        
        <List sx={{ p: 0 }}>
          {/* Dashboard Menu */}
          <Box>
            <StyledNavLink 
              to="/dashboard" 
              onClick={toggleDashboardMenu}
            >
              <MenuIcon>
                <DashboardOutlinedIcon fontSize="small" />
              </MenuIcon>
              <Typography sx={{ flexGrow: 1, fontSize: '15px' }}>Dashboard</Typography>
              {dashboardMenuOpen ? (
                <KeyboardArrowUpIcon fontSize="small" />
              ) : (
                <KeyboardArrowDownIcon fontSize="small" />
              )}
            </StyledNavLink>
            
            <Collapse in={dashboardMenuOpen} timeout="auto" unmountOnExit>
              {user?.role === 'admin' && (
                <SubMenuItem 
                  className={activeDashboardOption === 1 ? 'active' : ''}
                  onClick={() => handleDashboardOption(1)}
                >
                  All Invoices
                </SubMenuItem>
              )}
              <SubMenuItem 
                className={activeDashboardOption === 2 ? 'active' : ''} 
                onClick={() => handleDashboardOption(2)}
              >
                My Invoices
              </SubMenuItem>
              {(user?.role === 'signer' || user?.role === 'signer_admin') && (
                <SubMenuItem 
                  className={activeDashboardOption === 3 ? 'active' : ''}
                  onClick={() => handleDashboardOption(3)}
                >
                  Invoices To Sign
                </SubMenuItem>
              )}
            </Collapse>
          </Box>
          
          {/* Invoice Menu */}
          <Box>
            <StyledNavLink 
              to="/"
              onClick={toggleInvoiceMenu}
            >
              <MenuIcon>
                <ReceiptOutlinedIcon fontSize="small" />
              </MenuIcon>
              <Typography sx={{ flexGrow: 1, fontSize: '15px' }}>Invoice</Typography>
              {invoiceMenuOpen ? (
                <KeyboardArrowUpIcon fontSize="small" />
              ) : (
                <KeyboardArrowDownIcon fontSize="small" />
              )}
            </StyledNavLink>
            
            <Collapse in={invoiceMenuOpen} timeout="auto" unmountOnExit>
              {user?.role === 'admin' && (
                <SubMenuItem 
                  className={activeInvoiceOption === 1 ? 'active' : ''}
                  onClick={() => handleInvoiceOption(1)}
                >
                  All Invoices
                </SubMenuItem>
              )}
              <SubMenuItem 
                className={activeInvoiceOption === 2 ? 'active' : ''}
                onClick={() => handleInvoiceOption(2)}
              >
                My Invoices
              </SubMenuItem>
              {(user?.role === 'signer' || user?.role === 'signer_admin') && (
                <SubMenuItem 
                  className={activeInvoiceOption === 3 ? 'active' : ''}
                  onClick={() => handleInvoiceOption(3)}
                >
                  Invoices To Sign
                </SubMenuItem>
              )}
            </Collapse>
          </Box>
          
          {/* Supplier Profile */}
          {user?.role === 'supplier' && (
            <StyledNavLink to="/profile">
              <MenuIcon>
                <PersonOutlineOutlinedIcon fontSize="small" />
              </MenuIcon>
              <Typography sx={{ fontSize: '15px' }}>Profile</Typography>
            </StyledNavLink>
          )}
          
          {/* Admin Section */}
          {(user?.role === 'admin' || user?.role === 'signer_admin') && (
            <>
              <MenuHeading>Administration</MenuHeading>
              
              {user?.role === 'admin' && (
                <>
                  <StyledNavLink to="/user">
                    <MenuIcon>
                      <PersonOutlineOutlinedIcon fontSize="small" />
                    </MenuIcon>
                    <Typography sx={{ fontSize: '15px' }}>Users</Typography>
                  </StyledNavLink>

                  <StyledNavLink to="/department">
                    <MenuIcon>
                      <CorporateFareOutlinedIcon fontSize="small" />
                    </MenuIcon>
                    <Typography sx={{ fontSize: '15px' }}>Departments</Typography>
                  </StyledNavLink>

                  <StyledNavLink to="/section">
                    <MenuIcon>
                      <MenuBookOutlinedIcon fontSize="small" />
                    </MenuIcon>
                    <Typography sx={{ fontSize: '15px' }}>Sections</Typography>
                  </StyledNavLink>
                </>
              )}
              
              <StyledNavLink to="/signing-flow">
                <MenuIcon>
                  <AssignmentTurnedInOutlinedIcon fontSize="small" />
                </MenuIcon>
                <Typography sx={{ fontSize: '15px' }}>Signing Flow</Typography>
              </StyledNavLink>
            </>
          )}
          
          {/* Verification (if user is approved) */}
          {/* {user?.is_approved === true && (
            <StyledNavLink to="/verify-invoice">
              <MenuIcon>
                <FactCheckOutlinedIcon fontSize="small" />
              </MenuIcon>
              <Typography sx={{ fontSize: '15px' }}>Verify Invoice</Typography>
            </StyledNavLink>
          )} */}
        </List>
      </Box>
      
      {/* User Profile and Logout Section */}
      <Box>
        <Box sx={{ px: 3, pb: 2 }}>
          <MenuLink onClick={handleLogout}>
            <MenuIcon>
              <LogoutOutlinedIcon fontSize="small" />
            </MenuIcon>
            <Typography sx={{ fontSize: '15px' }}>Logout</Typography>
          </MenuLink>
        </Box>
        
        <UserProfileSection>
          <Avatar 
            sx={{ 
              bgcolor: COLORS.primary,
              width: 38,
              height: 38
            }}
          >
            {getInitials()}
          </Avatar>
          <UserInfo>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {firstName.charAt(0).toUpperCase() + firstName.slice(1)}
            </Typography>
            <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User'}
            </Typography>
          </UserInfo>
        </UserProfileSection>
      </Box>
    </SidebarContainer>
  );
}