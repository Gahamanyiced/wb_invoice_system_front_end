import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import RootLayout from '../layouts/RootLayout';
import {
  Box,
  Button,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import SearchBar from '../components/SearchBar';
import SelectBox from '../components/SelectBox';
import SigningFlowModal from '../components/SigningFlowModal';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ViewSigningFlowModal from '../components/ViewSigningFlowModal';
import DeleteSigningFlowDialog from '../components/DeleteSigningFlowDialog';
import UpdateSigningFlowDialog from '../components/UpdateSigningFlow';
import UpdateSigningFlow from '../components/UpdateSigningFlow';
import {
  getAllSigningFlows,
  getAllSigningFlowByDepartment,
} from '../features/signingFlow/signingFlowSlice';
import FilterPanel from '../components/global/FilterPanel';
import { setFilters } from '../features/signingFlow/signingFlowSlice';
import { getAllSectionsWithNoPagination } from '../features/section/sectionSlice';
import { getAllDepartment } from '../features/department/departmentSlice';

const styles = {
  table: {
    minWidth: 650,
    maxWidth: '90vw',
    margin: 'auto',
    my: 3,
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

export const SigningFlow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { signingFlows, filters } = useSelector((state) => state.signingFlow);
  const { departments } = useSelector((state) => state.department);
  const { allSections } = useSelector((state) => state.section);
  console.log('allSections', allSections);
  const [selectedSigningFlow, setSelectedSigningFlow] = useState();
  const [page, setPage] = useState(1);
  const [openView, setOpenView] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState();
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState();

  const handleViewClick = (flow) => {
    setSelectedSigningFlow(flow);
    setOpenView(true);
  };

  const handleCloseView = () => {
    setOpenView(false);
  };

  const handleUpdate = (flow) => {
    setSelectedUpdate(flow);
    setOpenUpdate(true);
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
  };

  const handleDelete = (id) => {
    setSelectedDelete(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const params = { ...filters };
      user?.role === 'signer_admin'
        ? dispatch(getAllSigningFlowByDepartment(params))
        : dispatch(getAllSigningFlows(params));
    } catch (error) {
      toast.error(error);
    }
  }, [dispatch, filters]);

  useEffect(() => {
    dispatch(getAllSectionsWithNoPagination());
  }, [dispatch]);

  useEffect(() => {
    const params = { page };
    dispatch(getAllDepartment(params));
  }, [dispatch, page]);

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  // Generate dynamic options from allSections
  const sectionOptions =
    allSections?.results?.map((section) => ({
      value: section.id,
      label: section.name,
    })) || [];

  const departmnentOptions =
    departments?.results?.map((department) => ({
      value: department.id,
      label: `${department?.name} `,
    })) || [];

  const filterConfig = {
    title: 'Signing Flow Filters',
    fields: [
      {
        name: 'section',
        label: 'section_by',
        type: 'select',
        options: [...sectionOptions],
      },
      {
        name: 'department',
        label: 'department_by',
        type: 'select',
        options: [...departmnentOptions],
      },
    ],
  };

  return (
    <>
      <RootLayout>
        <SigningFlowModal />
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
                  DEPARTMENT
                </TableCell>
                <TableCell align="left" sx={styles.header}>
                  SECTION
                </TableCell>
                <TableCell align="left" sx={styles.header}>
                  NUMBERS OF LEVELS
                </TableCell>
                <TableCell align="left" sx={styles.header}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {signingFlows?.map((flow, index) => (
                <TableRow key={index}>
                  <TableCell align="left">
                    {flow?.department_detail?.name}
                  </TableCell>
                  <TableCell align="left">
                    {flow?.section_detail?.name}
                  </TableCell>
                  <TableCell align="left">{flow?.levels?.length}</TableCell>
                  <TableCell align="left">
                    <Button
                      onClick={() => handleViewClick(flow)}
                      startIcon={<VisibilityOutlinedIcon />}
                      sx={styles.rowButton}
                    />
                    <Button
                      onClick={() => handleUpdate(flow)}
                      startIcon={<EditOutlinedIcon />}
                      sx={styles.rowButton}
                    />
                    {/* <Button
                      onClick={() => handleDelete(flow)}
                      startIcon={<DeleteOutlineIcon />}
                      sx={styles.rowButton}
                    /> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {selectedSigningFlow && (
          <ViewSigningFlowModal
            defaultValues={selectedSigningFlow}
            open={openView}
            handleClose={handleCloseView}
          />
        )}
        {selectedUpdate && (
          <UpdateSigningFlow
            defaultValues={selectedUpdate}
            open={openUpdate}
            handleClose={handleCloseUpdate}
          />
        )}
        <DeleteSigningFlowDialog
          open={openDelete}
          handleClose={handleCloseDelete}
          defaultValues={selectedDelete}
        />
        <Box display="flex" justifyContent="flex-end" m={2}>
          <Stack spacing={2}>
            <Pagination count={10} showFirstButton showLastButton />
          </Stack>
        </Box>
      </RootLayout>
    </>
  );
};
