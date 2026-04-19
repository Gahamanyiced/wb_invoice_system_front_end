import React from 'react';
import RootLayout from '../layouts/RootLayout';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  getAllUsers,
  getAllUsersWithNoPagination,
} from '../features/user/userSlice';
import {
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  Paper,
  TableContainer,
  TableCell,
  Box,
  Pagination,
  Tooltip,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import UpdateUserModel from '../components/UpdateUserModel';
import UserModal from '../components/UserModal';
import ViewUserModal from '../components/ViewUserModal';
import FilterPanel from '../components/global/FilterPanel';
import { setFilters } from '../features/user/userSlice';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const styles = {
  table: { minWidth: 700 },
  header: {
    color: '#00529B',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    py: 1.5,
    backgroundColor: '#f0f4f8',
    borderBottom: '2px solid #e0e8f0',
  },
  actionBtn: {
    minWidth: 0,
    height: '26px',
    fontSize: '11px',
    fontWeight: 600,
    px: 1.2,
    py: 0,
    bgcolor: '#00529B',
    color: 'white',
    borderRadius: '5px',
    textTransform: 'none',
    '&:hover': { bgcolor: '#003d75' },
    '& .MuiButton-startIcon': { mr: 0.5, '& svg': { fontSize: '14px' } },
  },
};

// Role color map
const roleStyle = (role) => {
  if (!role) return { bg: '#f5f5f5', color: '#757575', border: '#e0e0e0' };
  const r = role.toLowerCase();
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

function User() {
  const { users, filters } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [selectedView, setSelectedView] = useState();
  const [openView, setOpenView] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState();
  const [openUpdate, setOpenUpdate] = useState(false);
  const [page, setPage] = useState(1);
  const [updateTrigger, setUpdateTrigger] = useState(false);

  useEffect(() => {
    dispatch(getAllUsers({ page, ...filters }));
  }, [dispatch, page, updateTrigger, filters]);

  useEffect(() => {
    dispatch(getAllUsersWithNoPagination());
  }, [dispatch]);

  const handlePageChange = (_, value) => setPage(value);

  const handleUpdate = (user) => {
    setSelectedUpdate(user);
    setOpenUpdate(true);
  };
  const handleCloseUpdate = () => {
    setOpenUpdate(false);
  };

  const handleView = (data) => {
    setSelectedView(data);
    setOpenView(true);
  };
  const handleCloseView = () => {
    setOpenView(false);
  };

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const filterConfig = {
    title: 'User Filters',
    fields: [
      {
        name: 'name',
        label: 'Name / Company Name',
        type: 'text',
        showSearchIcon: true,
      },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { value: 'admin', label: 'Admin' },
          { value: 'signer', label: 'Signer' },
          { value: 'staff', label: 'Staff' },
          { value: 'signer_Admin', label: 'Signer Admin' },
          { value: 'supplier', label: 'Supplier' },
        ],
      },
      {
        name: 'is_approved',
        label: 'Approved',
        type: 'select',
        options: [
          { value: 'True', label: 'Approved' },
          { value: 'False', label: 'Not Approved' },
        ],
      },
    ],
  };

  return (
    <RootLayout>
      <UserModal />

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.5,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#00529B',
                fontSize: '18px',
                lineHeight: 1.2,
              }}
            >
              User Management
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#888', fontSize: '12px' }}
            >
              {users?.count ?? 0} user{users?.count !== 1 ? 's' : ''} found
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mt: 1.5 }} />
      </Box>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        config={filterConfig}
      />

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e0e8f0',
          borderRadius: '10px',
          overflow: 'hidden',
          mt: 1.5,
        }}
      >
        <TableContainer
          sx={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}
        >
          <Table sx={styles.table} stickyHeader aria-label="user table">
            <TableHead>
              <TableRow>
                <TableCell sx={styles.header}>No.</TableCell>
                <TableCell sx={styles.header}>Date</TableCell>
                <TableCell sx={styles.header}>Name</TableCell>
                <TableCell sx={styles.header}>Company Name</TableCell>
                <TableCell sx={styles.header}>Station</TableCell>
                <TableCell sx={styles.header}>Role</TableCell>
                <TableCell sx={styles.header}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users?.results?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ py: 6, color: '#999' }}
                  >
                    <Typography variant="body2">No users found.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {users?.results?.map((user, index) => {
                const rs = roleStyle(user?.role);
                const initials =
                  `${user?.firstname?.charAt(0) ?? ''}${user?.lastname?.charAt(0) ?? ''}`.toUpperCase();

                return (
                  <TableRow
                    key={index}
                    sx={{
                      transition: 'background 0.15s',
                      '&:hover': { backgroundColor: '#f5f9ff' },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    {/* Row number */}
                    <TableCell
                      sx={{
                        fontSize: '12px',
                        color: '#aaa',
                        py: 1.2,
                        width: 48,
                      }}
                    >
                      {user?.row_number}
                    </TableCell>

                    {/* Date */}
                    <TableCell
                      sx={{
                        fontSize: '12px',
                        color: '#777',
                        py: 1.2,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user?.created_at?.slice(0, 10) || '-'}
                    </TableCell>

                    {/* Name with avatar */}
                    <TableCell sx={{ py: 1.2 }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}
                      >
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            backgroundColor: '#e3f2fd',
                            border: '1px solid #90caf9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#1565c0',
                            flexShrink: 0,
                          }}
                        >
                          {initials || '?'}
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              fontSize: '12.5px',
                              fontWeight: 600,
                              color: '#222',
                              lineHeight: 1.2,
                            }}
                          >
                            {`${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim() ||
                              '-'}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: '#888' }}>
                            {user?.email || ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Company Name */}
                    <TableCell
                      sx={{ fontSize: '12px', color: '#555', py: 1.2 }}
                    >
                      {user?.supplier_profile?.company_name || (
                        <Typography
                          component="span"
                          sx={{ fontSize: '11px', color: '#ccc' }}
                        >
                          —
                        </Typography>
                      )}
                    </TableCell>

                    {/* Station */}
                    <TableCell
                      sx={{ fontSize: '12px', color: '#555', py: 1.2 }}
                    >
                      {user?.station || (
                        <Typography
                          component="span"
                          sx={{ fontSize: '11px', color: '#ccc' }}
                        >
                          —
                        </Typography>
                      )}
                    </TableCell>

                    {/* Role pill */}
                    <TableCell sx={{ py: 1.2 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          px: 1,
                          py: 0.35,
                          borderRadius: '20px',
                          backgroundColor: rs.bg,
                          border: `1px solid ${rs.border}`,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: rs.color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: rs.color,
                            lineHeight: 1,
                            textTransform: 'capitalize',
                          }}
                        >
                          {user?.role?.replace('_', ' ') || '-'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ py: 1.2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: '6px',
                          alignItems: 'center',
                        }}
                      >
                        <Tooltip title="View">
                          <Button
                            onClick={() => handleView(user)}
                            startIcon={<VisibilityOutlinedIcon />}
                            sx={styles.actionBtn}
                          >
                            View
                          </Button>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <Button
                            onClick={() => handleUpdate(user)}
                            startIcon={<EditOutlinedIcon />}
                            sx={{
                              ...styles.actionBtn,
                              bgcolor: '#1565c0',
                              '&:hover': { bgcolor: '#0d47a1' },
                            }}
                          >
                            Edit
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 2,
          px: 0.5,
        }}
      >
        <Typography variant="caption" sx={{ color: '#888', fontSize: '12px' }}>
          Page {page} of {Math.ceil((users?.count || 0) / 10) || 1}{' '}
          &nbsp;·&nbsp; {users?.count ?? 0} total records
        </Typography>
        <Pagination
          count={Math.ceil(users?.count / 10) || 1}
          page={page}
          onChange={handlePageChange}
          showFirstButton
          showLastButton
          size="small"
          sx={{
            '& .MuiPaginationItem-root': { fontSize: '12px' },
            '& .Mui-selected': {
              backgroundColor: '#00529B',
              color: '#fff',
              '&:hover': { backgroundColor: '#003d75' },
            },
          }}
        />
      </Box>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {selectedView && (
        <ViewUserModal
          defaultValues={selectedView}
          open={openView}
          handleClose={handleCloseView}
        />
      )}
      {selectedUpdate && (
        <UpdateUserModel
          defaultValues={selectedUpdate}
          open={openUpdate}
          handleClose={handleCloseUpdate}
          setUpdateTrigger={setUpdateTrigger}
        />
      )}
    </RootLayout>
  );
}

export default User;
