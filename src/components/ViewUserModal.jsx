import {
  Box,
  Typography,
  Modal,
  Button,
  Divider,
  Chip,
  Grid,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// ── Role color map ────────────────────────────────────────────────────────────
const roleStyle = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'admin')
    return { bg: '#fce4ec', color: '#880e4f', border: '#f48fb1' };
  if (r === 'signer_admin')
    return { bg: '#e8eaf6', color: '#283593', border: '#9fa8da' };
  if (r === 'signer')
    return { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' };
  if (r === 'supplier')
    return { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' };
  if (r === 'staff')
    return { bg: '#fff8e1', color: '#f57f17', border: '#ffe082' };
  return { bg: '#f5f5f5', color: '#616161', border: '#e0e0e0' };
};

// ── Reusable sub-components ───────────────────────────────────────────────────
const SectionHead = ({ icon, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: '6px',
        bgcolor: '#e3f2fd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </Box>
    <Typography
      sx={{
        fontSize: '12.5px',
        fontWeight: 700,
        color: '#1565c0',
        letterSpacing: '0.3px',
      }}
    >
      {label}
    </Typography>
    <Box sx={{ flex: 1, height: '1px', bgcolor: '#e3f2fd', ml: 0.5 }} />
  </Box>
);

const InfoRow = ({ label, value }) => (
  <Box>
    <Typography
      sx={{
        fontSize: '10px',
        fontWeight: 700,
        color: '#aaa',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        mb: 0.2,
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: '13px',
        color: value ? '#222' : '#ccc',
        fontWeight: value ? 500 : 400,
      }}
    >
      {value || '—'}
    </Typography>
  </Box>
);

const PermBadge = ({ label, active }) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      px: 1,
      py: 0.35,
      borderRadius: '20px',
      bgcolor: active ? '#e8f5e9' : '#f5f5f5',
      border: `1px solid ${active ? '#a5d6a7' : '#e0e0e0'}`,
    }}
  >
    <Box
      sx={{
        width: 5,
        height: 5,
        borderRadius: '50%',
        bgcolor: active ? '#2e7d32' : '#bdbdbd',
        flexShrink: 0,
      }}
    />
    <Typography
      sx={{
        fontSize: '11px',
        fontWeight: 600,
        color: active ? '#2e7d32' : '#999',
      }}
    >
      {label}
    </Typography>
  </Box>
);

// ── All permissions ───────────────────────────────────────────────────────────
// ── added: is_acting_supplier ─────────────────────────────────────────────────
const PERMISSIONS = [
  { key: 'is_invoice_user', label: 'Invoice User' },
  { key: 'is_invoice_verifier', label: 'Invoice Verifier' },
  { key: 'is_acting_supplier', label: 'Acting Supplier' }, // ← added
  { key: 'is_petty_cash_user', label: 'Petty Cash User' },
  { key: 'is_pettycash_initiator', label: 'PC Initiator' },
  { key: 'is_custodian', label: 'Custodian' },
  { key: 'is_expense_creator', label: 'Expense Creator' },
  { key: 'is_verifier', label: 'PC Verifier' },
  { key: 'is_approver', label: 'Approver' },
  { key: 'is_first_approver', label: 'First Approver' },
  { key: 'is_second_approver', label: 'Second Approver' },
  { key: 'is_last_approver', label: 'Last Approver' },
];

const ViewUserModal = ({ defaultValues, open, handleClose }) => {
  if (!defaultValues) return null;

  const hasSupplierProfile = !!defaultValues?.supplier_profile;
  const rs = roleStyle(defaultValues?.role);
  const initials =
    `${defaultValues?.firstname?.charAt(0) || ''}${defaultValues?.lastname?.charAt(0) || ''}`.toUpperCase() ||
    'U';
  const fullName =
    `${defaultValues?.firstname || ''} ${defaultValues?.lastname || ''}`.trim();

  // Only show permissions that are true
  const activePerms = PERMISSIONS.filter(
    (p) => defaultValues?.[p.key] === true,
  );
  const inactivePerms = PERMISSIONS.filter((p) => !defaultValues?.[p.key]);

  const sp = defaultValues?.supplier_profile;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 680,
          maxWidth: '95vw',
          bgcolor: '#f8fafc',
          borderRadius: '14px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            bgcolor: '#00529B',
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {initials}
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1.2,
                }}
              >
                {fullName || '—'}
              </Typography>
              <Typography
                sx={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.7)' }}
              >
                {defaultValues?.email || '—'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                px: 1.25,
                py: 0.4,
                borderRadius: '20px',
                bgcolor: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#fff',
                  textTransform: 'capitalize',
                }}
              >
                {defaultValues?.role?.replace('_', ' ') || '—'}
              </Typography>
            </Box>
            {defaultValues?.is_approved && (
              <Box
                sx={{
                  px: 1,
                  py: 0.4,
                  borderRadius: '20px',
                  bgcolor: 'rgba(76,175,80,0.25)',
                  border: '1px solid rgba(76,175,80,0.5)',
                }}
              >
                <Typography
                  sx={{ fontSize: '10.5px', fontWeight: 700, color: '#a5d6a7' }}
                >
                  ✓ Approved
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Scrollable body ── */}
        <Box
          sx={{
            overflowY: 'auto',
            flex: 1,
            p: 2.5,
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'rgba(0,82,155,0.2)',
              borderRadius: '2px',
            },
          }}
        >
          {/* Personal info */}
          <Box
            sx={{
              bgcolor: '#fff',
              border: '1px solid #e0e8f0',
              borderRadius: '10px',
              p: 2.5,
              mb: 2,
            }}
          >
            <SectionHead
              icon={<PersonIcon sx={{ fontSize: 14, color: '#1565c0' }} />}
              label="Personal Information"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <InfoRow label="First Name" value={defaultValues?.firstname} />
              </Grid>
              <Grid item xs={6}>
                <InfoRow label="Last Name" value={defaultValues?.lastname} />
              </Grid>
              <Grid item xs={6}>
                <InfoRow label="Work Email" value={defaultValues?.email} />
              </Grid>
              <Grid item xs={6}>
                <InfoRow
                  label="Personal Email"
                  value={defaultValues?.personal_email}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Work info */}
          <Box
            sx={{
              bgcolor: '#fff',
              border: '1px solid #e0e8f0',
              borderRadius: '10px',
              p: 2.5,
              mb: 2,
            }}
          >
            <SectionHead
              icon={<WorkIcon sx={{ fontSize: 14, color: '#1565c0' }} />}
              label="Work Details"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <InfoRow label="Position" value={defaultValues?.position} />
              </Grid>
              <Grid item xs={6}>
                <InfoRow label="Station" value={defaultValues?.station} />
              </Grid>
              <Grid item xs={6}>
                <InfoRow label="Department" value={defaultValues?.department} />
              </Grid>
              <Grid item xs={6}>
                <InfoRow label="Section" value={defaultValues?.section} />
              </Grid>
            </Grid>
          </Box>

          {/* Permissions */}
          <Box
            sx={{
              bgcolor: '#fff',
              border: '1px solid #e0e8f0',
              borderRadius: '10px',
              p: 2.5,
              mb: hasSupplierProfile ? 2 : 0,
            }}
          >
            <SectionHead
              icon={<SecurityIcon sx={{ fontSize: 14, color: '#1565c0' }} />}
              label="Access & Permissions"
            />
            {activePerms.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {PERMISSIONS.map((p) => (
                  <PermBadge
                    key={p.key}
                    label={p.label}
                    active={!!defaultValues?.[p.key]}
                  />
                ))}
              </Box>
            ) : (
              <Typography sx={{ fontSize: '12.5px', color: '#bbb' }}>
                No permissions assigned
              </Typography>
            )}
          </Box>

          {/* Supplier profile */}
          {hasSupplierProfile && (
            <>
              <Box
                sx={{
                  bgcolor: '#fff',
                  border: '1px solid #e0e8f0',
                  borderRadius: '10px',
                  p: 2.5,
                  mb: 2,
                }}
              >
                <SectionHead
                  icon={
                    <BusinessIcon sx={{ fontSize: 14, color: '#1565c0' }} />
                  }
                  label="Company Information"
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <InfoRow label="Company Name" value={sp?.company_name} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow
                      label="Supplier Number"
                      value={sp?.supplier_number}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow label="Tax ID" value={sp?.tax_id} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow
                      label="Service Category"
                      value={sp?.service_category}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow label="Contact Name" value={sp?.contact_name} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow label="Phone Number" value={sp?.phone_number} />
                  </Grid>
                  <Grid item xs={12}>
                    <InfoRow
                      label="Street Address"
                      value={sp?.street_address}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow label="City" value={sp?.city} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow label="Country" value={sp?.country} />
                  </Grid>
                </Grid>
              </Box>

              <Box
                sx={{
                  bgcolor: '#fff',
                  border: '1px solid #e0e8f0',
                  borderRadius: '10px',
                  p: 2.5,
                }}
              >
                <SectionHead
                  icon={
                    <AccountBalanceIcon
                      sx={{ fontSize: 14, color: '#1565c0' }}
                    />
                  }
                  label="Banking Information"
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <InfoRow label="Bank Name" value={sp?.bank_name} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow label="Account Name" value={sp?.account_name} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow
                      label="Account Number"
                      value={sp?.account_number}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow
                      label="Payment Currency"
                      value={sp?.payment_currency}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <InfoRow label="IBAN" value={sp?.iban} />
                  </Grid>
                  <Grid item xs={4}>
                    <InfoRow label="SWIFT Code" value={sp?.swift_code} />
                  </Grid>
                  <Grid item xs={4}>
                    <InfoRow label="Sort Code" value={sp?.sort_code} />
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
        </Box>

        {/* ── Footer ── */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid #e0e8f0',
            bgcolor: '#fff',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              bgcolor: '#00529B',
              textTransform: 'none',
              fontSize: '13px',
              borderRadius: '8px',
              px: 2.5,
              '&:hover': { bgcolor: '#003d75' },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewUserModal;
