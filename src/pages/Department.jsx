import RootLayout from '../layouts/RootLayout';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Stack,
  Pagination,
  Modal,
} from '@mui/material';
import DepartmentModal from '../components/DepartmentModal';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchBar from '../components/SearchBar';
import SelectBox from '../components/SelectBox';
import { getAllDepartment } from '../features/department/departmentSlice';
import ViewDepartmentModal from '../components/viewDepartmentModal';
import UpdateDepartmentModal from '../components/UpdateDepartmentModal';
import DeleteDepartmentDialog from '../components/DeleteDepartmentDialog';
import FilterPanel from '../components/global/FilterPanel';
import { setFilters } from '../features/department/departmentSlice';
import { getAllUsersWithNoPagination } from '../features/user/userSlice';

const styles = {
  table: {
    minWidth: 650,
    maxWidth: '90vw',
    margin: 'auto',
    my: 3,
  },
  header: {
    color: '#00529B',
    fontSize: '16px',
    textAlign: 'left',
  },
  rowButton: {
    minWidth: '0',
    color: 'rgba(0, 0, 0, 0.87)',
  },
};

function Department() {
  const { departments, filters } = useSelector((state) => state.department);
  const { allUsers } = useSelector((state) => state.user);

  // console.log('departments', departments)
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState();
  const [showPop, setShowPop] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState();
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState();
  const [selectedDelete, setSelectedDelete] = useState();
  useEffect(() => {
    const params = { page, ...filters };
    dispatch(getAllDepartment(params));
  }, [dispatch, page, filters]);

  useEffect(() => {
    dispatch(getAllUsersWithNoPagination());
  }, [dispatch]);

  const handleViewClick = (department) => {
    setSelectedDepartment(department);
    setOpenView(true);
  };

  const handleUpdate = (department) => {
    setSelectedUpdate(department);
    setOpenUpdate(true);
  };

  const handleDelete = (id) => {
    setSelectedDelete(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
  };

  const handleCloseView = () => {
    setOpenView(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  // Generate dynamic options from allUsers
  const userOptions =
    allUsers?.map((user) => ({
      value: user.id,
      label: `${user.firstname} ${user.lastname}`,
    })) || [];

  const filterConfig = {
    title: 'Department Filters',
    fields: [
      { name: 'name', label: 'name', type: 'text', showSearchIcon: true },

      {
        name: 'lead_by',
        label: 'lead_by',
        type: 'select',
        options: [...userOptions],
      },
    ],
  };

  // console.log('selectedDepartment', selectedDepartment);
  return (
    <>
      <RootLayout>
        <DepartmentModal />
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
                {/* <TableCell align="left" sx={styles.header}>
                  No.
                </TableCell> */}
                <TableCell align="left" sx={styles.header}>
                  NAME
                </TableCell>
                <TableCell align="left" sx={styles.header}>
                  LEAD BY
                </TableCell>
                <TableCell align="left" sx={styles.header}>
                  ACTION
                </TableCell>
                {/* {isAdmin && (
                <TableCell align="left" sx={styles.header}>
                  APPROVED
                </TableCell>
              )} */}
              </TableRow>
            </TableHead>
            <TableBody>
              {departments?.results?.map((department, index) => (
                <TableRow key={index}>
                  {/* <TableCell align="left">{department?.id}</TableCell> */}
                  <TableCell align="left">{department?.name}</TableCell>
                  <TableCell align="left">
                    {department?.lead_by?.firstname}{' '}
                    {department?.lead_by?.lastname}
                  </TableCell>
                  <TableCell align="left">
                    <Button
                      onClick={() => handleViewClick(department)}
                      startIcon={<VisibilityOutlinedIcon />}
                      sx={styles.rowButton}
                    ></Button>
                    <Button
                      onClick={() => handleUpdate(department)}
                      startIcon={<EditOutlinedIcon />}
                      sx={styles.rowButton}
                    ></Button>
                    <Button
                      onClick={() => handleDelete(department?.id)}
                      startIcon={<DeleteOutlineIcon />}
                      sx={styles.rowButton}
                    ></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {selectedDepartment && (
          <ViewDepartmentModal
            defaultValues={selectedDepartment}
            open={openView}
            handleClose={handleCloseView}
          />
        )}
        {selectedUpdate && (
          <UpdateDepartmentModal
            defaultValues={selectedUpdate}
            open={openUpdate}
            handleClose={handleCloseUpdate}
          />
        )}
        <DeleteDepartmentDialog
          open={openDelete}
          handleClose={handleCloseDelete}
          defaultValues={selectedDelete}
        />
        <Box display="flex" justifyContent="flex-end" m={2}>
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(departments?.count / 10) || 1}
              page={page}
              onChange={handlePageChange}
              showFirstButton
              showLastButton
            />
          </Stack>
        </Box>
      </RootLayout>
    </>
  );
}

export default Department;
