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
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchBar from '../components/SearchBar';
import SectionModal from '../components/SectionModal';
import { getAllSection } from '../features/section/sectionSlice';
import ViewSectionModal from '../components/ViewSectionModal';
import UpdateSectionModal from '../components/UpdateSectionModal';
import DeleteSectionDialog from '../components/DeleteSectionDialog';
import FilterPanel from '../components/global/FilterPanel';
import { setFilters } from '../features/section/sectionSlice';
import { getAllUsersWithNoPagination } from '../features/user/userSlice';
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
    fontSize: '16px',
    textAlign: 'left',
  },
  rowButton: {
    minWidth: '0',
    color: 'rgba(0, 0, 0, 0.87)',
  },
};
function Section() {
  const { sections, filters } = useSelector((state) => state.section);
  const { departments } = useSelector((state) => state.department);

  const { allUsers } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [selectedSection, setSelectedSection] = useState();
  const [page, setPage] = useState(1);
  const [openView, setOpenView] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState();
  const [selectedDelete, setSelectedDelete] = useState();
  const [searchQuery, setSearchQuery] = useState();

  useEffect(() => {
    const params = { page, ...filters };
    dispatch(getAllSection(params));
  }, [dispatch, page, filters]);

  useEffect(() => {
    const params = { page };
    dispatch(getAllDepartment(params));
  }, [dispatch, page]);

  useEffect(() => {
    dispatch(getAllUsersWithNoPagination());
  }, [dispatch]);

  const handleViewClick = (section) => {
    setSelectedSection(section);
    setOpenView(true);
  };

  const handleUpdate = (section) => {
    setSelectedUpdate(section);
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

  const filterData = (query, result) => {
    if (!query) {
      return result?.results;
    } else {
      const data = result.results?.filter((section) => {
        return (
          section?.name?.toLowerCase()?.includes(query?.toLowerCase()) ||
          section?.lead_by?.firstname
            ?.toLowerCase()
            ?.includes(query?.toLowerCase()) ||
          section?.lead_by?.lastname
            ?.toLowerCase()
            ?.includes(query?.toLowerCase()) ||
          section?.department?.name
            ?.toLowerCase()
            ?.includes(query?.toLowerCase())
        );
      });
      return data;
    }
  };

  const dataFiltered = filterData(searchQuery, sections);

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const userOptions =
    allUsers?.map((user) => ({
      value: user.id,
      label: `${user.firstname} ${user.lastname}`,
    })) || [];

  const departmnentOptions =
    departments?.results?.map((department) => ({
      value: department.id,
      label: `${department?.name} `,
    })) || [];

  const filterConfig = {
    title: 'Section Filters',
    fields: [
      { name: 'name', label: 'name', type: 'text', showSearchIcon: true },

      {
        name: 'lead_by',
        label: 'lead_by',
        type: 'select',
        options: [...userOptions],
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
        <SectionModal />
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
                  DEPARTMENT
                </TableCell>
                <TableCell align="left" sx={styles.header}>
                  ACTION
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sections?.results?.map((section, index) => (
                <TableRow key={index}>
                  {/* <TableCell align="left">{section.id}</TableCell> */}
                  <TableCell align="left">{section.name}</TableCell>
                  <TableCell align="left">
                    {section.lead_by.firstname} {section.lead_by.lastname}
                  </TableCell>
                  <TableCell align="left">{section.department.name}</TableCell>
                  <TableCell align="left">
                    <Button
                      onClick={() => handleViewClick(section)}
                      startIcon={<VisibilityOutlinedIcon />}
                      sx={styles.rowButton}
                    ></Button>
                    <Button
                      onClick={() => handleUpdate(section)}
                      startIcon={<EditOutlinedIcon />}
                      sx={styles.rowButton}
                    ></Button>
                    <Button
                      onClick={() => {
                        handleDelete(section?.id);
                      }}
                      startIcon={<DeleteOutlineIcon />}
                      sx={styles.rowButton}
                    ></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {selectedSection && (
          <ViewSectionModal
            defaultValues={selectedSection}
            open={openView}
            handleClose={handleCloseView}
          />
        )}
        {selectedUpdate && (
          <UpdateSectionModal
            defaultValues={selectedUpdate}
            open={openUpdate}
            handleClose={handleCloseUpdate}
          />
        )}
        <DeleteSectionDialog
          open={openDelete}
          handleClose={handleCloseDelete}
          defaultValues={selectedDelete}
        />
        <Box display="flex" justifyContent="flex-end" m={2}>
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(sections?.count / 10) || 1}
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

export default Section;
