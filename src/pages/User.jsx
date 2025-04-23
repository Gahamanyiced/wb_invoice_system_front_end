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
  Stack,
  Tooltip,
} from '@mui/material';
import UpdateUserModel from '../components/UpdateUserModel';
import UserModal from '../components/UserModal';
import SearchBar from '../components/SearchBar';
import SelectBox from '../components/SelectBox';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ViewUserModal from '../components/ViewUserModal';
import FilterPanel from '../components/global/FilterPanel';
import { setFilters } from '../features/user/userSlice';

const styles = {
  table: {
    minWidth: 650,
    maxWidth: '90vw',
    margin: 'auto',
  },
  header: {
    color: '#00529B',
    fontSize: '14px',
    textAlign: 'left',
  },
  rowButton: {
    minWidth: '0',
    color: 'rgba(0, 0, 0, 0.87)',
  },
};

function User() {
  const { users, allUsers, filters } = useSelector((state) => state.user);  
  const dispatch = useDispatch();
  const [selectedView, setSelectedView] = useState();
  const [openView, setOpenView] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState();
  const [openUpdate, setOpenUpdate] = useState(false);
  const [showPop, setShowPop] = useState(false);
  const [searchQuery, setSearchQuery] = useState();
  const [page, setPage] = useState(1);
  const [hoverView, setHoverView] = useState(false);
  const [hoverEdit, setHoverEdit] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(false);

  useEffect(() => {
    const params = { page, ...filters };
    dispatch(getAllUsers(params));
  }, [dispatch, page, updateTrigger, filters]);

  useEffect(() => {
    dispatch(getAllUsersWithNoPagination());
  }, [dispatch]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // const filterData = (query, result) => {
  //   if (!query) {
  //     return result?.results;
  //   } else {
  //     const data = result?.results?.filter((user) => {
  //       return (
  //         user?.created_at?.includes(query) ||
  //         user?.firstname?.toLowerCase()?.includes(query?.toLowerCase()) ||
  //         user?.lastname?.toLowerCase()?.includes(query?.toLowerCase()) ||
  //         user?.station?.toLowerCase()?.includes(query?.toLowerCase()) ||
  //         user?.role?.toLowerCase()?.includes(query?.toLowerCase())
  //       );
  //     });

  //     return data;
  //   }
  // };

  // const dataFiltered = filterData(searchQuery, users);

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
  };

  const handleUpdate = (user) => {
    setSelectedUpdate(user);
    setOpenUpdate(true);
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
      { name: 'name', label: 'Name', type: 'text', showSearchIcon: true },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { value: 'admin', label: 'Admin' },
          { value: 'signer', label: 'Signer' },
          { value: 'staff', label: 'Staff' },
          { value: 'signer_Admin', label: 'Signer_Admin' },
        ],
      },
      {
        name: 'is_approved',
        label: 'is_approved',
        type: 'select',
        options: [
          { value: 'True', label: 'True' },
          { value: 'False', label: 'False' },

          // add other statuses as needed
        ],
      },
    ],
  };

  return (
    <RootLayout>
      <UserModal />
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        config={filterConfig}
      />

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: '100%',
          overflow: 'scroll',
        }}
      >
        <Table sx={styles.table} aria-label="user table">
          <TableHead>
            <TableRow>
              <TableCell align="left" sx={styles.header}>
                NO.
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                DATE
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                NAME
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                STATION
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                ROLE
              </TableCell>
              <TableCell align="left" sx={styles.header}>
                ACTION
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.results?.map((user, index) => (
              <TableRow key={index}>
                <TableCell align="left">{user?.row_number}</TableCell>
                <TableCell align="left">
                  {user?.created_at?.slice(0, 10)}
                </TableCell>
                <TableCell align="left">{`${user?.firstname} ${user?.lastname}`}</TableCell>
                <TableCell align="left">{user?.station}</TableCell>
                <TableCell align="left">{user?.role}</TableCell>
                <TableCell align="left">
                  {/* <Button
                    startIcon={<VisibilityOutlinedIcon />}
                    sx={styles.rowButton}
                  ></Button> */}
                  <Tooltip title={hoverView ? 'View' : ''}>
                    <Button
                      onClick={() => handleView(user)}
                      startIcon={<VisibilityOutlinedIcon />}
                      onMouseEnter={() => setHoverView(true)}
                      onMouseLeave={() => setHoverView(false)}
                      sx={styles.rowButton}
                    ></Button>
                  </Tooltip>
                  <Tooltip title={hoverEdit ? 'Edit' : ''}>
                    <Button
                      onClick={() => handleUpdate(user)}
                      startIcon={<EditOutlinedIcon />}
                      onMouseEnter={() => setHoverEdit(true)}
                      onMouseLeave={() => setHoverEdit(false)}
                      sx={styles.rowButton}
                    ></Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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

      <Box display="flex" justifyContent="flex-end" m={2}>
        <Stack spacing={2}>
          <Pagination
            count={Math.ceil(users?.count / 10) || 1}
            page={page}
            onChange={handlePageChange}
            showFirstButton
            showLastButton
          />
        </Stack>
      </Box>
    </RootLayout>
  );
}

export default User;
