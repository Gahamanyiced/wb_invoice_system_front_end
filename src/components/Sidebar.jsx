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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

// Redux actions
import { setIndex } from '../features/invoice/invoiceSlice';
import {
  setDashboardIndex,
  setCardIndex,
} from '../features/dashboard/dashboardSlice';

// Components
import ReportingSidebar from '../components/ReportingSidebar';

const COLORS = {
  primary: '#00529B',
  sidebar: '#192a45',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  divider: 'rgba(255, 255, 255, 0.1)',
  hoverBg: 'rgba(255, 255, 255, 0.1)',
  activeBg: '#00529B',
  activeSubBg: 'rgba(0, 82, 155, 0.2)',
  shadow: 'rgba(0, 82, 155, 0.3)',
};

const SidebarContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  width: '280px',
  backgroundColor: COLORS.sidebar,
  color: COLORS.textPrimary,
  display: 'flex',
  flexDirection: 'column',
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
    },
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
  const [coaMenuOpen, setCoaMenuOpen] = useState(false);
  const [signingFlowMenuOpen, setSigningFlowMenuOpen] = useState(false);
  const [reportingSidebarOpen, setReportingSidebarOpen] = useState(false);

  const [activeInvoiceOption, setActiveInvoiceOption] = useState(null);
  const [activeDashboardOption, setActiveDashboardOption] = useState(null);
  const [activeCoaOption, setActiveCoaOption] = useState(null);
  const [activeSigningFlowOption, setActiveSigningFlowOption] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const username = JSON.parse(localStorage.getItem('username') || '""');

  const firstName = user?.firstname || username.split('.')[0] || '';
  const lastName = user?.lastname || username.split('.')[1] || '';

  // ── Permission flags ──────────────────────────────────────────────────────
  const isAdmin = user?.role === 'admin';
  const isSignerAdmin = user?.role === 'signer_admin';
  const isSupplierAdmin = user?.role === 'supplier_admin';
  const isSigner = user?.role === 'signer';

  // admin OR (signer_admin + is_invoice_verifier) → Signing Flow, COA,
  // and Supplier Dashboard submenus
  const canSeeAdminTools =
    isAdmin || (isSignerAdmin && !!user?.is_invoice_verifier);

  // admin OR (signer_admin + is_invoice_verifier) → Supplier Invoices submenu
  const canSeeSupplierInvoices =
    isAdmin || (isSignerAdmin && !!user?.is_invoice_verifier);

  // admin, signer_admin, or signer → Delegation
  const canSeeDelegation = isAdmin || isSignerAdmin || isSigner;

  // admin OR (signer_admin + is_verifier) → Reports
  const canSeeReports = isAdmin || (isSignerAdmin && !!user?.is_verifier);

  // Show Administration heading if the user can see at least one admin item
  const showAdminSection = isAdmin || canSeeAdminTools || canSeeDelegation;

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') {
      setDashboardMenuOpen(true);
    } else if (path === '/') {
      setInvoiceMenuOpen(true);
    } else if (path.startsWith('/coa')) {
      setCoaMenuOpen(true);
      setActiveCoaOption(path);
    } else if (path.startsWith('/signing-flow')) {
      setSigningFlowMenuOpen(true);
      setActiveSigningFlowOption(path);
    }
  }, [location.pathname]);

  const toggleDashboardMenu = (e) => {
    if (e) e.preventDefault();
    setDashboardMenuOpen(!dashboardMenuOpen);
    if (!dashboardMenuOpen) {
      setInvoiceMenuOpen(false);
      setCoaMenuOpen(false);
      setSigningFlowMenuOpen(false);
    }
  };

  const toggleInvoiceMenu = (e) => {
    if (e) e.preventDefault();
    setInvoiceMenuOpen(!invoiceMenuOpen);
    if (!invoiceMenuOpen) {
      setDashboardMenuOpen(false);
      setCoaMenuOpen(false);
      setSigningFlowMenuOpen(false);
    }
  };

  const toggleCoaMenu = (e) => {
    if (e) e.preventDefault();
    setCoaMenuOpen(!coaMenuOpen);
    if (!coaMenuOpen) {
      setDashboardMenuOpen(false);
      setInvoiceMenuOpen(false);
      setSigningFlowMenuOpen(false);
    }
  };

  const toggleSigningFlowMenu = (e) => {
    if (e) e.preventDefault();
    setSigningFlowMenuOpen(!signingFlowMenuOpen);
    if (!signingFlowMenuOpen) {
      setDashboardMenuOpen(false);
      setInvoiceMenuOpen(false);
      setCoaMenuOpen(false);
    }
  };

  const handleSigningFlowOption = (path) => {
    setActiveSigningFlowOption(path);
    navigate(path);
  };

  const handleInvoiceOption = (index) => {
    dispatch(setIndex(index));
    dispatch(setCardIndex(null));
    setActiveInvoiceOption(index);
    navigate('/');
  };

  const handleDashboardOption = (index) => {
    dispatch(setDashboardIndex(index));
    dispatch(setIndex(index));
    dispatch(setCardIndex(null));
    setActiveDashboardOption(index);
    navigate('/dashboard');
  };

  const handleCoaOption = (path) => {
    setActiveCoaOption(path);
    navigate(path);
  };

  const handleOpenReporting = () => setReportingSidebarOpen(true);
  const handleCloseReporting = () => setReportingSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('index');
    navigate('/login', { replace: true });
  };

  const getInitials = () => {
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first && !last) return 'U';
    return `${first.charAt(0).toUpperCase()}${last.charAt(0).toUpperCase()}`;
  };

  const capitalizeFirstLetter = (string) => {
    if (!string || typeof string !== 'string') return 'User';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <>
      <SidebarContainer>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '3px',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
            },
          }}
        >
          {/* Logo */}
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
            {/* ── Dashboard Menu ─────────────────────────────────────────── */}
            <Box>
              <StyledNavLink to="/dashboard" onClick={toggleDashboardMenu}>
                <MenuIcon>
                  <DashboardOutlinedIcon fontSize="small" />
                </MenuIcon>
                <Typography sx={{ flexGrow: 1, fontSize: '15px' }}>
                  Dashboard
                </Typography>
                {dashboardMenuOpen ? (
                  <KeyboardArrowUpIcon fontSize="small" />
                ) : (
                  <KeyboardArrowDownIcon fontSize="small" />
                )}
              </StyledNavLink>

              <Collapse in={dashboardMenuOpen} timeout="auto" unmountOnExit>
                {/* All Invoices — admin only */}
                {isAdmin && (
                  <SubMenuItem
                    className={activeDashboardOption === 1 ? 'active' : ''}
                    onClick={() => handleDashboardOption(1)}
                  >
                    All Invoices
                  </SubMenuItem>
                )}

                {/* Invoices Upload — supplier or signer_admin */}
                {(user?.role === 'supplier' || isSignerAdmin) && (
                  <SubMenuItem
                    className={activeDashboardOption === 2 ? 'active' : ''}
                    onClick={() => handleDashboardOption(2)}
                  >
                    Invoices Upload
                  </SubMenuItem>
                )}

                {/* Invoice Approval — signer or signer_admin */}
                {(user?.role === 'signer' || isSignerAdmin) && (
                  <SubMenuItem
                    className={activeDashboardOption === 3 ? 'active' : ''}
                    onClick={() => handleDashboardOption(3)}
                  >
                    Invoice Approval
                  </SubMenuItem>
                )}

                {/* Supplier Invoices — admin OR (signer_admin + is_invoice_supplier) */}
                {canSeeSupplierInvoices && (
                  <SubMenuItem
                    className={activeDashboardOption === 4 ? 'active' : ''}
                    onClick={() => handleDashboardOption(4)}
                  >
                    Supplier Invoices
                  </SubMenuItem>
                )}
              </Collapse>
            </Box>

            {/* ── Invoice Menu ───────────────────────────────────────────── */}
            <Box>
              <StyledNavLink to="/" onClick={toggleInvoiceMenu}>
                <MenuIcon>
                  <ReceiptOutlinedIcon fontSize="small" />
                </MenuIcon>
                <Typography sx={{ flexGrow: 1, fontSize: '15px' }}>
                  Invoice
                </Typography>
                {invoiceMenuOpen ? (
                  <KeyboardArrowUpIcon fontSize="small" />
                ) : (
                  <KeyboardArrowDownIcon fontSize="small" />
                )}
              </StyledNavLink>

              <Collapse in={invoiceMenuOpen} timeout="auto" unmountOnExit>
                {/* All Invoices — admin only */}
                {isAdmin && (
                  <SubMenuItem
                    className={activeInvoiceOption === 1 ? 'active' : ''}
                    onClick={() => handleInvoiceOption(1)}
                  >
                    All Invoices
                  </SubMenuItem>
                )}

                {/* Invoices Upload — supplier or signer_admin */}
                {(user?.role === 'supplier' || isSignerAdmin) && (
                  <SubMenuItem
                    className={activeInvoiceOption === 2 ? 'active' : ''}
                    onClick={() => handleInvoiceOption(2)}
                  >
                    Invoices Upload
                  </SubMenuItem>
                )}

                {/* Invoice Approval — signer or signer_admin */}
                {(user?.role === 'signer' || isSignerAdmin) && (
                  <SubMenuItem
                    className={activeInvoiceOption === 3 ? 'active' : ''}
                    onClick={() => handleInvoiceOption(3)}
                  >
                    Invoice Approval
                  </SubMenuItem>
                )}

                {/* Supplier Invoices — admin OR (signer_admin + is_invoice_supplier) */}
                {canSeeSupplierInvoices && (
                  <SubMenuItem
                    className={activeInvoiceOption === 4 ? 'active' : ''}
                    onClick={() => handleInvoiceOption(4)}
                  >
                    Supplier Invoices
                  </SubMenuItem>
                )}
              </Collapse>
            </Box>

            {/* Petty Cash */}
            {user?.is_petty_cash_user && (
              <StyledNavLink to="/petty-cash">
                <MenuIcon>
                  <AccountBalanceWalletIcon fontSize="small" />
                </MenuIcon>
                <Typography sx={{ fontSize: '15px' }}>Petty Cash</Typography>
              </StyledNavLink>
            )}

            {/* Reports — admin OR (signer_admin + is_verifier) */}
            {canSeeReports && (
              <MenuLink onClick={handleOpenReporting}>
                <MenuIcon>
                  <AssessmentIcon fontSize="small" />
                </MenuIcon>
                <Typography sx={{ fontSize: '15px' }}>Reports</Typography>
              </MenuLink>
            )}

            {/* Supplier Profile */}
            {user?.role === 'supplier' && (
              <StyledNavLink to="/profile">
                <MenuIcon>
                  <PersonOutlineOutlinedIcon fontSize="small" />
                </MenuIcon>
                <Typography sx={{ fontSize: '15px' }}>Profile</Typography>
              </StyledNavLink>
            )}

            {/* ── Administration ─────────────────────────────────────────── */}
            {showAdminSection && (
              <>
                <MenuHeading>Administration</MenuHeading>

                {/* Users — admin only */}
                {isAdmin && (
                  <StyledNavLink to="/user">
                    <MenuIcon>
                      <PersonOutlineOutlinedIcon fontSize="small" />
                    </MenuIcon>
                    <Typography sx={{ fontSize: '15px' }}>Users</Typography>
                  </StyledNavLink>
                )}

                {/* Signing Flow — admin OR (signer_admin + is_invoice_verifier) */}
                {canSeeAdminTools && (
                  <Box>
                    <MenuLink onClick={toggleSigningFlowMenu}>
                      <MenuIcon>
                        <AssignmentTurnedInOutlinedIcon fontSize="small" />
                      </MenuIcon>
                      <Typography sx={{ flexGrow: 1, fontSize: '15px' }}>
                        Signing Flow
                      </Typography>
                      {signingFlowMenuOpen ? (
                        <KeyboardArrowUpIcon fontSize="small" />
                      ) : (
                        <KeyboardArrowDownIcon fontSize="small" />
                      )}
                    </MenuLink>

                    <Collapse
                      in={signingFlowMenuOpen}
                      timeout="auto"
                      unmountOnExit
                    >
                      <SubMenuItem
                        className={
                          activeSigningFlowOption === '/signing-flow/department'
                            ? 'active'
                            : ''
                        }
                        onClick={() =>
                          handleSigningFlowOption('/signing-flow/department')
                        }
                      >
                        Department / Section
                      </SubMenuItem>
                      <SubMenuItem
                        className={
                          activeSigningFlowOption ===
                          '/signing-flow/cost-center'
                            ? 'active'
                            : ''
                        }
                        onClick={() =>
                          handleSigningFlowOption('/signing-flow/cost-center')
                        }
                      >
                        Cost Center
                      </SubMenuItem>
                      <SubMenuItem
                        className={
                          activeSigningFlowOption === '/signing-flow/location'
                            ? 'active'
                            : ''
                        }
                        onClick={() =>
                          handleSigningFlowOption('/signing-flow/location')
                        }
                      >
                        Location
                      </SubMenuItem>
                      <SubMenuItem
                        className={
                          activeSigningFlowOption === '/signing-flow/supervisor'
                            ? 'active'
                            : ''
                        }
                        onClick={() =>
                          handleSigningFlowOption('/signing-flow/supervisor')
                        }
                      >
                        Supervisor
                      </SubMenuItem>
                    </Collapse>
                  </Box>
                )}

                {/* Delegation — admin, signer_admin, or signer */}
                {canSeeDelegation && (
                  <StyledNavLink to="/delegation">
                    <MenuIcon>
                      <SwapHorizIcon fontSize="small" />
                    </MenuIcon>
                    <Typography sx={{ fontSize: '15px' }}>
                      Delegation
                    </Typography>
                  </StyledNavLink>
                )}

                {/* Chart of Accounts — admin OR (signer_admin + is_invoice_verifier) */}
                {canSeeAdminTools && (
                  <Box>
                    <MenuLink onClick={toggleCoaMenu}>
                      <MenuIcon>
                        <TableChartOutlinedIcon fontSize="small" />
                      </MenuIcon>
                      <Typography sx={{ flexGrow: 1, fontSize: '15px' }}>
                        Chart of Accounts
                      </Typography>
                      {coaMenuOpen ? (
                        <KeyboardArrowUpIcon fontSize="small" />
                      ) : (
                        <KeyboardArrowDownIcon fontSize="small" />
                      )}
                    </MenuLink>

                    <Collapse in={coaMenuOpen} timeout="auto" unmountOnExit>
                      <SubMenuItem
                        className={
                          activeCoaOption === '/coa/suppliers' ? 'active' : ''
                        }
                        onClick={() => handleCoaOption('/coa/suppliers')}
                      >
                        Supplier Details
                      </SubMenuItem>
                      <SubMenuItem
                        className={
                          activeCoaOption === '/coa/cost-centers'
                            ? 'active'
                            : ''
                        }
                        onClick={() => handleCoaOption('/coa/cost-centers')}
                      >
                        Cost Centers
                      </SubMenuItem>
                      <SubMenuItem
                        className={
                          activeCoaOption === '/coa/gl-accounts' ? 'active' : ''
                        }
                        onClick={() => handleCoaOption('/coa/gl-accounts')}
                      >
                        GL Accounts
                      </SubMenuItem>
                      <SubMenuItem
                        className={
                          activeCoaOption === '/coa/locations' ? 'active' : ''
                        }
                        onClick={() => handleCoaOption('/coa/locations')}
                      >
                        Locations
                      </SubMenuItem>
                      <SubMenuItem
                        className={
                          activeCoaOption === '/coa/aircraft-types'
                            ? 'active'
                            : ''
                        }
                        onClick={() => handleCoaOption('/coa/aircraft-types')}
                      >
                        Aircraft Type
                      </SubMenuItem>
                      <SubMenuItem
                        className={
                          activeCoaOption === '/coa/routes' ? 'active' : ''
                        }
                        onClick={() => handleCoaOption('/coa/routes')}
                      >
                        Route
                      </SubMenuItem>
                    </Collapse>
                  </Box>
                )}
              </>
            )}
          </List>

          <Box sx={{ height: '120px' }} />
        </Box>

        {/* Bottom - Logout + Profile */}
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: COLORS.sidebar,
            borderTop: `1px solid ${COLORS.divider}`,
            zIndex: 10,
          }}
        >
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <MenuLink onClick={handleLogout}>
              <MenuIcon>
                <LogoutOutlinedIcon fontSize="small" />
              </MenuIcon>
              <Typography sx={{ fontSize: '15px' }}>Logout</Typography>
            </MenuLink>
          </Box>

          <UserProfileSection>
            <Avatar sx={{ bgcolor: COLORS.primary, width: 38, height: 38 }}>
              {getInitials()}
            </Avatar>
            <UserInfo>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {capitalizeFirstLetter(firstName.trim())}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: COLORS.textSecondary }}
              >
                {user && user.role && typeof user.role === 'string'
                  ? capitalizeFirstLetter(user.role.replace('_', ' '))
                  : 'User'}
              </Typography>
            </UserInfo>
          </UserProfileSection>
        </Box>
      </SidebarContainer>

      <ReportingSidebar
        open={reportingSidebarOpen}
        onClose={handleCloseReporting}
      />
    </>
  );
}
