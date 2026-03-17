import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';

const styles = {
  header: {
    backgroundColor: '#00529B',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '13px',
    letterSpacing: '0.5px',
  },
  addButton: {
    backgroundColor: '#00529B',
    color: '#fff',
    textTransform: 'none',
    '&:hover': { backgroundColor: '#003f7a' },
  },
  rowButton: {
    minWidth: 'unset',
    padding: '4px',
    color: '#00529B',
  },
};

// ---- Add / Edit Dialog ----
function CoaFormDialog({
  open,
  onClose,
  onSubmit,
  initialValues,
  isLoading,
  title,
  fields,
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (open) {
      const defaults = {};
      fields.forEach((f) => {
        defaults[f.name] = initialValues?.[f.name] || '';
      });
      setForm(defaults);
    }
  }, [open, initialValues, fields]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    for (const f of fields) {
      if (f.required && !form[f.name]?.trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: initialValues ? '#00529B' : '#00529B',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {title}
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, mt: 1 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {fields.map((f) => (
            <TextField
              key={f.name}
              name={f.name}
              label={f.label}
              value={form[f.name] || ''}
              onChange={handleChange}
              fullWidth
              size="small"
              required={f.required}
              multiline={f.multiline}
              rows={f.multiline ? 3 : 1}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={styles.addButton}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : initialValues ? (
            'Update'
          ) : (
            'Create'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---- Delete Dialog ----
function DeleteDialog({ open, onClose, onConfirm, isLoading, itemLabel }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: '#d32f2f',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Confirm Delete
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Typography>
          Are you sure you want to delete <strong>{itemLabel}</strong>? This
          action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Delete'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== Main CoaTable Component ====================
function CoaTable({
  title,
  subtitle,
  stateKey, // redux state key e.g. 'suppliers'
  fields, // [{ name, label, required, multiline }]
  columns, // [{ key, label }] columns to show in table
  getAll, // thunk
  create, // thunk
  update, // thunk
  del, // thunk
  getLabel, // fn(row) => string for delete confirmation
}) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.coa);
  const data = useSelector((state) => state.coa[stateKey]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Dialog states
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchData = () => {
    dispatch(getAll({ page, search: search || undefined }));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    dispatch(getAll({ page: 1, search: search || undefined }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // ---- Add ----
  const handleAdd = async (formData) => {
    const res = await dispatch(create(formData));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(`${title} created successfully`);
      setAddOpen(false);
      fetchData();
    } else {
      toast.error(res.payload || 'Failed to create');
    }
  };

  // ---- Edit ----
  const handleEdit = async (formData) => {
    const res = await dispatch(update({ id: selectedRow.id, data: formData }));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(`${title} updated successfully`);
      setEditOpen(false);
      setSelectedRow(null);
      fetchData();
    } else {
      toast.error(res.payload || 'Failed to update');
    }
  };

  // ---- Delete ----
  const handleDelete = async () => {
    const res = await dispatch(del(selectedRow.id));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(`${title} deleted successfully`);
      setDeleteOpen(false);
      setSelectedRow(null);
      fetchData();
    } else {
      toast.error(res.payload || 'Failed to delete');
    }
  };

  const rows = data?.results || (Array.isArray(data) ? data : []);
  const totalCount = data?.count || rows.length;

  return (
    <Box>
      {/* Header bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#00529B">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={styles.addButton}
          onClick={() => setAddOpen(true)}
        >
          Add {title}
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder={`Search ${title}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} size="small">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{ maxHeight: 500, overflow: 'auto' }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={styles.header}>NO.</TableCell>
              {columns.map((col) => (
                <TableCell key={col.key} sx={styles.header}>
                  {col.label}
                </TableCell>
              ))}
              <TableCell sx={styles.header}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 2}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 2}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography color="text.secondary">
                    No records found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={row.id} hover>
                  <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.key}>{row[col.key] ?? '-'}</TableCell>
                  ))}
                  <TableCell>
                    <Button
                      sx={styles.rowButton}
                      onClick={() => {
                        setSelectedRow(row);
                        setEditOpen(true);
                      }}
                      startIcon={<EditOutlinedIcon />}
                    />
                    <Button
                      sx={{ ...styles.rowButton, color: '#d32f2f' }}
                      onClick={() => {
                        setSelectedRow(row);
                        setDeleteOpen(true);
                      }}
                      startIcon={<DeleteOutlineIcon />}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Stack spacing={2}>
          <Pagination
            count={Math.ceil(totalCount / 10) || 1}
            page={page}
            onChange={(_, val) => setPage(val)}
            showFirstButton
            showLastButton
          />
        </Stack>
      </Box>

      {/* Add Dialog */}
      <CoaFormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        initialValues={null}
        isLoading={isLoading}
        title={`Add ${title}`}
        fields={fields}
      />

      {/* Edit Dialog */}
      <CoaFormDialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedRow(null);
        }}
        onSubmit={handleEdit}
        initialValues={selectedRow}
        isLoading={isLoading}
        title={`Edit ${title}`}
        fields={fields}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedRow(null);
        }}
        onConfirm={handleDelete}
        isLoading={isLoading}
        itemLabel={selectedRow ? getLabel(selectedRow) : ''}
      />
    </Box>
  );
}

export default CoaTable;
