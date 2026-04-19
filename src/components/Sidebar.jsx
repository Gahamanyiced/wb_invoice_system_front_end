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
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

// Redux
import { setIndex } from '../features/invoice/invoiceSlice';
import {
  setDashboardIndex,
  setCardIndex,
} from '../features/dashboard/dashboardSlice';

// Components
import ReportingSidebar from '../components/ReportingSidebar';

// ── Tokens ────────────────────────────────────────────────────────────────────
const C = {
  sidebar: '#00529B',
  moduleBg: '#003d75',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textMuted: 'rgba(255,255,255,0.38)',
  divider: 'rgba(255,255,255,0.08)',
  hoverBg: 'rgba(255,255,255,0.1)',
  activeBg: 'rgba(255,255,255,0.18)',
  activeSubBg: 'rgba(255,255,255,0.15)',
  activePill: '#1565c0', // same blue for all modules
  shadow: 'rgba(0,0,0,0.2)',
};

const SIDEBAR_WIDTH = 240;

// ── Styled ────────────────────────────────────────────────────────────────────
const SidebarContainer = styled(Box)({
  width: `${SIDEBAR_WIDTH}px`,
  minWidth: `${SIDEBAR_WIDTH}px`,
  height: '100vh',
  backgroundColor: C.sidebar,
  color: C.textPrimary,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '4px 0 16px rgba(0,0,0,0.2)',
  overflow: 'hidden',
  flexShrink: 0,
});

// Stacked module pill
const ModulePill = styled(Box)(({ active }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '7px 10px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '12.5px',
  fontWeight: 600,
  transition: 'all 0.18s',
  color: active ? '#fff' : C.textMuted,
  backgroundColor: active ? C.activePill : 'transparent',
  border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
  boxShadow: active ? '0 2px 8px rgba(21,101,192,0.35)' : 'none',
  userSelect: 'none',
  '&:hover': {
    color: active ? '#fff' : C.textSecondary,
    backgroundColor: active ? C.activePill : C.hoverBg,
  },
}));

const StyledNavLink = styled(NavLink)({
  textDecoration: 'none',
  color: C.textSecondary,
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '7px',
  margin: '2px 6px',
  transition: 'all 0.18s',
  position: 'relative',
  '&:hover': { backgroundColor: C.hoverBg, color: C.textPrimary },
  '&.active': {
    backgroundColor: C.activeBg,
    color: C.textPrimary,
    boxShadow: `0 3px 8px ${C.shadow}`,
    '&:before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '3px',
      height: '55%',
      backgroundColor: '#fff',
      borderRadius: '0 3px 3px 0',
    },
  },
});

const MenuLink = styled(Box)({
  color: C.textSecondary,
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '7px',
  margin: '2px 6px',
  transition: 'all 0.18s',
  cursor: 'pointer',
  '&:hover': { backgroundColor: C.hoverBg, color: C.textPrimary },
});

const MenuHeading = styled(Typography)({
  fontSize: '9px',
  textTransform: 'uppercase',
  letterSpacing: '1.3px',
  color: C.textMuted,
  padding: '10px 14px 3px',
});

const MenuIcon = styled(Box)({
  marginRight: '9px',
  display: 'flex',
  alignItems: 'center',
  width: '18px',
  height: '18px',
  flexShrink: 0,
});

const SubMenuItem = styled(Box)({
  padding: '6px 12px 6px 39px',
  color: C.textSecondary,
  borderRadius: '7px',
  margin: '1px 6px',
  cursor: 'pointer',
  transition: 'all 0.18s',
  fontSize: '12px',
  '&:hover': { backgroundColor: C.hoverBg, color: C.textPrimary },
  '&.active': { backgroundColor: C.activeSubBg, color: C.textPrimary },
});

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeModule, setActiveModule] = useState('invoice');
  const [dashboardMenuOpen, setDashboardMenuOpen] = useState(false);
  const [invoiceMenuOpen, setInvoiceMenuOpen] = useState(false);
  const [coaMenuOpen, setCoaMenuOpen] = useState(false);
  const [signingFlowMenuOpen, setSigningFlowMenuOpen] = useState(false);
  const [reportingSidebarOpen, setReportingSidebarOpen] = useState(false);
  const [reportingTab, setReportingTab] = useState(0);

  const [activeInvoiceOption, setActiveInvoiceOption] = useState(null);
  const [activeDashboardOption, setActiveDashboardOption] = useState(null);
  const [activeCoaOption, setActiveCoaOption] = useState(null);
  const [activeSigningFlowOption, setActiveSigningFlowOption] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const username = JSON.parse(localStorage.getItem('username') || '""');
  const firstName = user?.firstname || username.split('.')[0] || '';
  const lastName = user?.lastname || username.split('.')[1] || '';

  // ── Permissions ───────────────────────────────────────────────────────────
  const isAdmin = user?.role === 'admin';
  const isSignerAdmin = user?.role === 'signer_admin';
  const isSigner = user?.role === 'signer';
  const isSupplier = user?.role === 'supplier';

  // For non-admin, non-supplier users, module access is gated by flags.
  // admin and supplier always have access to invoice module as before.
  const isInvoiceUser = isAdmin || isSupplier || !!user?.is_invoice_user;
  const isPettyCashUser = isAdmin || !!user?.is_petty_cash_user;

  const canSeeAdminTools =
    isAdmin || (isSignerAdmin && !!user?.is_invoice_verifier);
  const canSeeSupplierInvoices =
    isAdmin || (isSignerAdmin && !!user?.is_invoice_verifier);
  const canSeeDelegation = isAdmin || isSignerAdmin || isSigner;
  const canSeeInvoiceReports =
    isAdmin ||
    (isSignerAdmin && !!user?.is_invoice_verifier) ||
    (isSigner && !!user?.is_invoice_verifier);
  const showInvoiceAdmin = isAdmin || canSeeAdminTools || canSeeDelegation;

  // ── MODULES registry — add future modules here ────────────────────────────
  // Each entry: { id, label, icon, visible }
  // Just add a new row to support more modules — layout handles it automatically.
  // Module pills are shown based on role flags.
  // admin & supplier always see Invoice; others need is_invoice_user=true.
  // Petty Cash shown to anyone with is_petty_cash_user=true (or admin).
  const MODULES = [
    {
      id: 'invoice',
      label: 'Invoice',
      icon: <ReceiptLongIcon sx={{ fontSize: 15 }} />,
      visible: isInvoiceUser,
      locked: !isInvoiceUser,
    },
    {
      id: 'petty_cash',
      label: 'Petty Cash',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 15 }} />,
      visible: isPettyCashUser || isAdmin,
      locked: !isPettyCashUser && !isAdmin,
    },
    // ── Future modules — uncomment & set visible condition when ready:
    // { id: 'procurement', label: 'Procurement', icon: <ShoppingCartOutlinedIcon sx={{ fontSize: 15 }} />, visible: isAdmin },
    // { id: 'payroll',     label: 'Payroll',     icon: <PaidOutlinedIcon sx={{ fontSize: 15 }} />,        visible: isAdmin },
  ].filter((m) => m.visible || m.locked);

  // ── Route → module sync ───────────────────────────────────────────────────
  useEffect(() => {
    const p = location.pathname;
    if (p.startsWith('/petty-cash')) setActiveModule('petty_cash');
    else setActiveModule('invoice');

    if (p === '/dashboard') setDashboardMenuOpen(true);
    else if (p === '/') setInvoiceMenuOpen(true);
    else if (p.startsWith('/coa')) {
      setCoaMenuOpen(true);
      setActiveCoaOption(p);
    } else if (p.startsWith('/signing-flow')) {
      setSigningFlowMenuOpen(true);
      setActiveSigningFlowOption(p);
    }
  }, [location.pathname]);

  // ── Menu toggles ──────────────────────────────────────────────────────────
  const closeAll = () => {
    setDashboardMenuOpen(false);
    setInvoiceMenuOpen(false);
    setCoaMenuOpen(false);
    setSigningFlowMenuOpen(false);
  };

  const togDashboard = (e) => {
    if (e) e.preventDefault();
    setDashboardMenuOpen((v) => !v);
    if (!dashboardMenuOpen) {
      setInvoiceMenuOpen(false);
      setCoaMenuOpen(false);
      setSigningFlowMenuOpen(false);
    }
  };
  const togInvoice = (e) => {
    if (e) e.preventDefault();
    setInvoiceMenuOpen((v) => !v);
    if (!invoiceMenuOpen) {
      setDashboardMenuOpen(false);
      setCoaMenuOpen(false);
      setSigningFlowMenuOpen(false);
    }
  };
  const togCoa = (e) => {
    if (e) e.preventDefault();
    setCoaMenuOpen((v) => !v);
    if (!coaMenuOpen) {
      setDashboardMenuOpen(false);
      setInvoiceMenuOpen(false);
      setSigningFlowMenuOpen(false);
    }
  };
  const togSigning = (e) => {
    if (e) e.preventDefault();
    setSigningFlowMenuOpen((v) => !v);
    if (!signingFlowMenuOpen) {
      setDashboardMenuOpen(false);
      setInvoiceMenuOpen(false);
      setCoaMenuOpen(false);
    }
  };

  // ── Navigation helpers ────────────────────────────────────────────────────
  const goSigning = (p) => {
    setActiveSigningFlowOption(p);
    navigate(p);
  };
  const goInvoice = (i) => {
    dispatch(setIndex(i));
    dispatch(setCardIndex(null));
    setActiveInvoiceOption(i);
    navigate('/');
  };
  const goDashboard = (i) => {
    dispatch(setDashboardIndex(i));
    dispatch(setIndex(i));
    dispatch(setCardIndex(null));
    setActiveDashboardOption(i);
    navigate('/dashboard');
  };
  const goCoa = (p) => {
    setActiveCoaOption(p);
    navigate(p);
  };

  const openInvoiceReport = () => {
    setReportingTab(0);
    setReportingSidebarOpen(true);
  };
  const openPCReport = () => {
    setReportingTab(1);
    setReportingSidebarOpen(true);
  };

  const handleLogout = () => {
    ['token', 'user', 'username', 'index'].forEach((k) =>
      localStorage.removeItem(k),
    );
    navigate('/login', { replace: true });
  };

  const switchModule = (id) => {
    const mod = MODULES.find((m) => m.id === id);
    if (mod?.locked) return; // blocked — no access
    setActiveModule(id);
    closeAll();
    navigate(id === 'petty_cash' ? '/petty-cash' : '/');
  };

  const getInitials = () => {
    const f = firstName.trim();
    const l = lastName.trim();
    if (!f && !l) return 'U';
    return `${f.charAt(0).toUpperCase()}${l.charAt(0).toUpperCase()}`;
  };
  const cap = (s) =>
    !s || typeof s !== 'string'
      ? 'User'
      : s.charAt(0).toUpperCase() + s.slice(1);

  const signingItems = [
    // { label: 'Department / Section', path: '/signing-flow/department' },
    { label: 'Cost Center', path: '/signing-flow/cost-center' },
    { label: 'Location', path: '/signing-flow/location' },
    { label: 'Supervisor', path: '/signing-flow/supervisor' },
  ];
  const coaItems = [
    { label: 'Supplier Details', path: '/coa/suppliers' },
    { label: 'Cost Centers', path: '/coa/cost-centers' },
    { label: 'GL Accounts', path: '/coa/gl-accounts' },
    { label: 'Locations', path: '/coa/locations' },
    { label: 'Aircraft Type', path: '/coa/aircraft-types' },
    { label: 'Route', path: '/coa/routes' },
  ];

  return (
    <>
      <SidebarContainer>
        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <Box
          sx={{
            px: 2,
            pt: 1.5,
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box
            component="img"
            src={Logo}
            alt="RwandAir"
            sx={{ height: 30, maxWidth: 130, objectFit: 'contain' }}
          />
          <Typography
            sx={{
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: C.textMuted,
            }}
          >
            Finance
          </Typography>
        </Box>

        <Divider sx={{ backgroundColor: C.divider }} />

        {/* ── Module switcher — stacked pills ──────────────────────────── */}
        <Box sx={{ backgroundColor: C.moduleBg, px: 1, pt: 1, pb: 0.75 }}>
          <Typography
            sx={{
              fontSize: '9px',
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              color: C.textMuted,
              px: 1,
              pb: 0.75,
            }}
          >
            Modules
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {MODULES.map((mod) => (
              <ModulePill
                key={mod.id}
                active={activeModule === mod.id ? 1 : 0}
                onClick={() => switchModule(mod.id)}
                sx={mod.locked ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
              >
                {mod.icon}
                <Typography
                  sx={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    lineHeight: 1,
                    flex: 1,
                  }}
                >
                  {mod.label}
                </Typography>
                {mod.locked && (
                  <Typography
                    sx={{
                      fontSize: '9px',
                      color: 'rgba(255,255,255,0.45)',
                      ml: 'auto',
                    }}
                  >
                    🔒
                  </Typography>
                )}
              </ModulePill>
            ))}
          </Box>
        </Box>

        <Divider sx={{ backgroundColor: C.divider }} />

        {/* ── Scrollable menu area ──────────────────────────────────────── */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': { width: '3px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
            },
          }}
        >
          {/* ════════════ INVOICE MODULE ════════════ */}
          {activeModule === 'invoice' && isInvoiceUser && (
            <List sx={{ p: 0, pt: 0.5 }}>
              <MenuHeading>Main</MenuHeading>

              {/* Dashboard */}
              <Box>
                <StyledNavLink to="/dashboard" onClick={togDashboard}>
                  <MenuIcon>
                    <DashboardOutlinedIcon sx={{ fontSize: 17 }} />
                  </MenuIcon>
                  <Typography sx={{ flexGrow: 1, fontSize: '13px' }}>
                    Dashboard
                  </Typography>
                  {dashboardMenuOpen ? (
                    <KeyboardArrowUpIcon sx={{ fontSize: 15 }} />
                  ) : (
                    <KeyboardArrowDownIcon sx={{ fontSize: 15 }} />
                  )}
                </StyledNavLink>
                <Collapse in={dashboardMenuOpen} timeout="auto" unmountOnExit>
                  {isAdmin && (
                    <SubMenuItem
                      className={activeDashboardOption === 1 ? 'active' : ''}
                      onClick={() => goDashboard(1)}
                    >
                      All Invoices
                    </SubMenuItem>
                  )}
                  {(user?.role === 'supplier' || isSignerAdmin) && (
                    <SubMenuItem
                      className={activeDashboardOption === 2 ? 'active' : ''}
                      onClick={() => goDashboard(2)}
                    >
                      Invoices Upload
                    </SubMenuItem>
                  )}
                  {(user?.role === 'signer' || isSignerAdmin) && (
                    <SubMenuItem
                      className={activeDashboardOption === 3 ? 'active' : ''}
                      onClick={() => goDashboard(3)}
                    >
                      Invoice Approval
                    </SubMenuItem>
                  )}
                  {canSeeSupplierInvoices && (
                    <SubMenuItem
                      className={activeDashboardOption === 4 ? 'active' : ''}
                      onClick={() => goDashboard(4)}
                    >
                      Supplier Invoices
                    </SubMenuItem>
                  )}
                </Collapse>
              </Box>

              {/* Invoice */}
              <Box>
                <StyledNavLink to="/" onClick={togInvoice}>
                  <MenuIcon>
                    <ReceiptOutlinedIcon sx={{ fontSize: 17 }} />
                  </MenuIcon>
                  <Typography sx={{ flexGrow: 1, fontSize: '13px' }}>
                    Invoice
                  </Typography>
                  {invoiceMenuOpen ? (
                    <KeyboardArrowUpIcon sx={{ fontSize: 15 }} />
                  ) : (
                    <KeyboardArrowDownIcon sx={{ fontSize: 15 }} />
                  )}
                </StyledNavLink>
                <Collapse in={invoiceMenuOpen} timeout="auto" unmountOnExit>
                  {isAdmin && (
                    <SubMenuItem
                      className={activeInvoiceOption === 1 ? 'active' : ''}
                      onClick={() => goInvoice(1)}
                    >
                      All Invoices
                    </SubMenuItem>
                  )}
                  {(user?.role === 'supplier' || isSignerAdmin) && (
                    <SubMenuItem
                      className={activeInvoiceOption === 2 ? 'active' : ''}
                      onClick={() => goInvoice(2)}
                    >
                      Invoices Upload
                    </SubMenuItem>
                  )}
                  {(user?.role === 'signer' || isSignerAdmin) && (
                    <SubMenuItem
                      className={activeInvoiceOption === 3 ? 'active' : ''}
                      onClick={() => goInvoice(3)}
                    >
                      Invoice Approval
                    </SubMenuItem>
                  )}
                  {canSeeSupplierInvoices && (
                    <SubMenuItem
                      className={activeInvoiceOption === 4 ? 'active' : ''}
                      onClick={() => goInvoice(4)}
                    >
                      Supplier Invoices
                    </SubMenuItem>
                  )}
                </Collapse>
              </Box>

              {/* Reports */}
              {canSeeInvoiceReports && (
                <MenuLink onClick={openInvoiceReport}>
                  <MenuIcon>
                    <AssessmentIcon sx={{ fontSize: 17 }} />
                  </MenuIcon>
                  <Typography sx={{ fontSize: '13px' }}>Reports</Typography>
                </MenuLink>
              )}

              {/* Administration */}
              {showInvoiceAdmin && (
                <>
                  <MenuHeading>Administration</MenuHeading>

                  {isAdmin && (
                    <StyledNavLink to="/user">
                      <MenuIcon>
                        <PersonOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                      </MenuIcon>
                      <Typography sx={{ fontSize: '13px' }}>Users</Typography>
                    </StyledNavLink>
                  )}

                  {canSeeAdminTools && (
                    <Box>
                      <MenuLink onClick={togSigning}>
                        <MenuIcon>
                          <AssignmentTurnedInOutlinedIcon
                            sx={{ fontSize: 17 }}
                          />
                        </MenuIcon>
                        <Typography sx={{ flexGrow: 1, fontSize: '13px' }}>
                          Signing Flow
                        </Typography>
                        {signingFlowMenuOpen ? (
                          <KeyboardArrowUpIcon sx={{ fontSize: 15 }} />
                        ) : (
                          <KeyboardArrowDownIcon sx={{ fontSize: 15 }} />
                        )}
                      </MenuLink>
                      <Collapse
                        in={signingFlowMenuOpen}
                        timeout="auto"
                        unmountOnExit
                      >
                        {signingItems.map((it) => (
                          <SubMenuItem
                            key={it.path}
                            className={
                              activeSigningFlowOption === it.path
                                ? 'active'
                                : ''
                            }
                            onClick={() => goSigning(it.path)}
                          >
                            {it.label}
                          </SubMenuItem>
                        ))}
                      </Collapse>
                    </Box>
                  )}

                  {canSeeDelegation && (
                    <StyledNavLink to="/delegation">
                      <MenuIcon>
                        <SwapHorizIcon sx={{ fontSize: 17 }} />
                      </MenuIcon>
                      <Typography sx={{ fontSize: '13px' }}>
                        Delegation
                      </Typography>
                    </StyledNavLink>
                  )}

                  {isAdmin && (
                    <Box>
                      <MenuLink onClick={togCoa}>
                        <MenuIcon>
                          <TableChartOutlinedIcon sx={{ fontSize: 17 }} />
                        </MenuIcon>
                        <Typography sx={{ flexGrow: 1, fontSize: '13px' }}>
                          Chart of Accounts
                        </Typography>
                        {coaMenuOpen ? (
                          <KeyboardArrowUpIcon sx={{ fontSize: 15 }} />
                        ) : (
                          <KeyboardArrowDownIcon sx={{ fontSize: 15 }} />
                        )}
                      </MenuLink>
                      <Collapse in={coaMenuOpen} timeout="auto" unmountOnExit>
                        {coaItems.map((it) => (
                          <SubMenuItem
                            key={it.path}
                            className={
                              activeCoaOption === it.path ? 'active' : ''
                            }
                            onClick={() => goCoa(it.path)}
                          >
                            {it.label}
                          </SubMenuItem>
                        ))}
                      </Collapse>
                    </Box>
                  )}
                </>
              )}
            </List>
          )}

          {/* ════════════ PETTY CASH MODULE ════════════ */}
          {activeModule === 'petty_cash' && (isAdmin || isPettyCashUser) && (
            <List sx={{ p: 0, pt: 0.5 }}>
              <MenuHeading>Main</MenuHeading>

              <StyledNavLink to="/petty-cash">
                <MenuIcon>
                  <AccountBalanceWalletIcon sx={{ fontSize: 17 }} />
                </MenuIcon>
                <Typography sx={{ fontSize: '13px' }}>Petty Cash</Typography>
              </StyledNavLink>

              <MenuLink onClick={openPCReport}>
                <MenuIcon>
                  <AssessmentIcon sx={{ fontSize: 17 }} />
                </MenuIcon>
                <Typography sx={{ fontSize: '13px' }}>Reports</Typography>
              </MenuLink>

              {isAdmin && (
                <>
                  <MenuHeading>Administration</MenuHeading>
                  <StyledNavLink to="/user">
                    <MenuIcon>
                      <PersonOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                    </MenuIcon>
                    <Typography sx={{ fontSize: '13px' }}>Users</Typography>
                  </StyledNavLink>
                </>
              )}
            </List>
          )}

          <Box sx={{ height: '60px' }} />
        </Box>

        {/* ── Sticky bottom — profile card + logout ──────────────────── */}
        <Box
          sx={{
            borderTop: `1px solid ${C.divider}`,
            backgroundColor: '#003d75',
            p: 1.25,
          }}
        >
          {/* Profile card */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              p: 1,
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              mb: 0.75,
            }}
          >
            {/* Avatar with online dot */}
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                sx={{
                  bgcolor: '#1565c0',
                  width: 34,
                  height: 34,
                  fontSize: '13px',
                  fontWeight: 700,
                  border: '2px solid rgba(255,255,255,0.2)',
                }}
              >
                {getInitials()}
              </Avatar>
              {/* Online indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  backgroundColor: '#4caf50',
                  border: '2px solid #003d75',
                }}
              />
            </Box>

            {/* Name + role */}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#fff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.3,
                }}
              >
                {`${cap(firstName.trim())} ${cap(lastName.trim())}`.trim() ||
                  'User'}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 0.2,
                }}
              >
                <Box
                  sx={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#90caf9',
                    backgroundColor: 'rgba(144,202,249,0.15)',
                    border: '1px solid rgba(144,202,249,0.3)',
                    borderRadius: '4px',
                    px: 0.6,
                    py: 0.1,
                    lineHeight: 1.4,
                    textTransform: 'capitalize',
                  }}
                >
                  {user?.role ? user.role.replace(/_/g, ' ') : 'User'}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Profile link — always visible, all modules */}
          <StyledNavLink
            to="/profile"
            style={{
              margin: '0 0 2px 0',
              padding: '7px 8px',
              borderRadius: '7px',
            }}
          >
            <MenuIcon>
              <PersonOutlineOutlinedIcon sx={{ fontSize: 16 }} />
            </MenuIcon>
            <Typography sx={{ fontSize: '12.5px' }}>Profile</Typography>
          </StyledNavLink>

          {/* Logout row */}
          <MenuLink
            onClick={handleLogout}
            sx={{
              margin: 0,
              px: 1,
              py: 0.75,
              borderRadius: '7px',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <MenuIcon>
              <LogoutOutlinedIcon sx={{ fontSize: 16 }} />
            </MenuIcon>
            <Typography sx={{ fontSize: '12.5px', color: C.textSecondary }}>
              Logout
            </Typography>
          </MenuLink>
        </Box>
      </SidebarContainer>

      <ReportingSidebar
        open={reportingSidebarOpen}
        onClose={() => setReportingSidebarOpen(false)}
        defaultTab={reportingTab}
      />
    </>
  );
}
