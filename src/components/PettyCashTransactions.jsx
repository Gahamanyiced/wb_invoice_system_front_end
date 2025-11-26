import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ViewTransactionModal from './ViewTransactionModal';
import AcknowledgeTransactionDialog from './AcknowledgeTransactionDialog';
import EditTransactionModal from './EditTransactionModal';
import DeleteTransactionDialog from './DeleteTransactionDialog';

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
  },
  table: {
    minWidth: 650,
  },
  headerCell: {
    color: '#00529B',
    fontSize: '14px',
    fontWeight: 600,
  },
  uploadBox: {
    border: '2px dashed rgba(0, 82, 155, 0.3)',
    borderRadius: '8px',
    p: 2,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(0, 82, 155, 0.05)',
      borderColor: 'rgba(0, 82, 155, 0.5)',
    },
  },
};

const PettyCashTransactions = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAcknowledgeDialog, setOpenAcknowledgeDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [transactions, setTransactions] = useState([
    // Sample data - replace with actual data from API
    {
      id: 1,
      amount: 50000,
      cm: 'John Doe',
      paymentDate: '2024-11-15',
      title: 'Office Supplies',
      description: 'Purchase of stationery items',
      status: 'approved',
      documents: ['receipt1.pdf'],
    },
  ]);

  const [formData, setFormData] = useState({
    amount: '',
    cm: '',
    paymentDate: '',
    title: '',
    description: '',
    documents: [],
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form
    setFormData({
      amount: '',
      cm: '',
      paymentDate: '',
      title: '',
      description: '',
      documents: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      documents: [...formData.documents, ...files],
    });
  };

  const handleRemoveFile = (index) => {
    const newDocuments = formData.documents.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      documents: newDocuments,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate with backend API
    console.log('Form submitted:', formData);
    handleCloseDialog();
  };

  // Handler functions for actions
  const handleView = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenViewModal(true);
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenEditModal(true);
  };

  const handleAcknowledge = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenAcknowledgeDialog(true);
  };

  const handleDelete = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDeleteDialog(true);
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedTransaction(null);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedTransaction(null);
  };

  const handleCloseAcknowledgeDialog = () => {
    setOpenAcknowledgeDialog(false);
    setSelectedTransaction(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedTransaction(null);
  };

  const getStatusChip = (status) => {
    const statusColors = {
      pending: { bgcolor: '#FFA726', color: 'white' },
      approved: { bgcolor: '#66BB6A', color: 'white' },
      denied: { bgcolor: '#EF5350', color: 'white' },
    };

    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        size="small"
        sx={{
          ...statusColors[status],
          fontWeight: 500,
          minWidth: '80px',
        }}
      />
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={styles.header}>
        <Typography variant="h5" fontWeight={600} color="#00529B">
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            bgcolor: '#00529B',
            '&:hover': {
              bgcolor: '#003d73',
            },
            textTransform: 'none',
            px: 3,
          }}
        >
          Create Transaction
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table sx={styles.table}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0, 82, 155, 0.05)' }}>
              <TableCell sx={styles.headerCell}>ID</TableCell>
              <TableCell sx={styles.headerCell}>Title</TableCell>
              <TableCell sx={styles.headerCell}>CM</TableCell>
              <TableCell sx={styles.headerCell}>Amount</TableCell>
              <TableCell sx={styles.headerCell}>Payment Date</TableCell>
              <TableCell sx={styles.headerCell}>Status</TableCell>
              <TableCell sx={styles.headerCell} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                hover
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(0, 82, 155, 0.02)',
                  },
                }}
              >
                <TableCell>{transaction.id}</TableCell>
                <TableCell>{transaction.title}</TableCell>
                <TableCell>{transaction.cm}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('en-RW', {
                    style: 'currency',
                    currency: 'RWF',
                  }).format(transaction.amount)}
                </TableCell>
                <TableCell>{transaction.paymentDate}</TableCell>
                <TableCell>{getStatusChip(transaction.status)}</TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<VisibilityOutlinedIcon />}
                      onClick={() => handleView(transaction)}
                      sx={{
                        color: '#00529B',
                        textTransform: 'none',
                        minWidth: '70px',
                        fontSize: '0.75rem',
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<CheckCircleOutlineIcon />}
                      onClick={() => handleAcknowledge(transaction)}
                      sx={{
                        color: '#66BB6A',
                        textTransform: 'none',
                        minWidth: '110px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => handleEdit(transaction)}
                      sx={{
                        color: '#00529B',
                        textTransform: 'none',
                        minWidth: '70px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => handleDelete(transaction)}
                      sx={{
                        color: '#d32f2f',
                        textTransform: 'none',
                        minWidth: '70px',
                        fontSize: '0.75rem',
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Transaction Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: '#00529B',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">Create Transaction</Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseDialog}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              {/* Select CM - Full width for better visibility */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select CM</InputLabel>
                  <Select
                    name="cm"
                    value={formData.cm}
                    onChange={handleInputChange}
                    label="Select CM"
                  >
                    <MenuItem value="John Doe">John Doe</MenuItem>
                    <MenuItem value="Jane Smith">Jane Smith</MenuItem>
                    <MenuItem value="Bob Johnson">Bob Johnson</MenuItem>
                    {/* TODO: Replace with dynamic data from API */}
                  </Select>
                </FormControl>
              </Grid>

              {/* Amount */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount *"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    inputProps: { min: 0 },
                  }}
                />
              </Grid>

              {/* Payment Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Payment Date *"
                  name="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                />
              </Grid>

              {/* Supporting Documents */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ color: '#00529B', fontWeight: 600 }}
                >
                  Supporting Documents
                </Typography>
                <Box sx={styles.uploadBox}>
                  <input
                    accept="*/*"
                    style={{ display: 'none' }}
                    id="transaction-file-upload"
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="transaction-file-upload">
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <CloudUploadIcon
                        sx={{ fontSize: 40, color: '#00529B', mb: 1 }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        Click to upload supporting documents
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ mt: 0.5 }}
                      >
                        Multiple files allowed
                      </Typography>
                    </Box>
                  </label>
                </Box>

                {/* Display uploaded files */}
                {formData.documents.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {formData.documents.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          mb: 1,
                          bgcolor: 'rgba(0, 82, 155, 0.05)',
                          borderRadius: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AttachFileIcon
                            sx={{ mr: 1, color: '#00529B', fontSize: 20 }}
                          />
                          <Typography variant="body2">
                            {file.name || file}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFile(index)}
                          sx={{ color: '#d32f2f' }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                color: '#666',
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: '#00529B',
                '&:hover': {
                  bgcolor: '#003d73',
                },
                textTransform: 'none',
              }}
            >
              Create Transaction
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Transaction Modal */}
      {selectedTransaction && (
        <ViewTransactionModal
          open={openViewModal}
          handleClose={handleCloseViewModal}
          transaction={selectedTransaction}
        />
      )}

      {/* Edit Transaction Modal */}
      {selectedTransaction && (
        <EditTransactionModal
          open={openEditModal}
          handleClose={handleCloseEditModal}
          transaction={selectedTransaction}
        />
      )}

      {/* Acknowledge Transaction Dialog */}
      {selectedTransaction && (
        <AcknowledgeTransactionDialog
          open={openAcknowledgeDialog}
          handleClose={handleCloseAcknowledgeDialog}
          transaction={selectedTransaction}
        />
      )}

      {/* Delete Transaction Dialog */}
      {selectedTransaction && (
        <DeleteTransactionDialog
          open={openDeleteDialog}
          handleClose={handleCloseDeleteDialog}
          transaction={selectedTransaction}
        />
      )}
    </Box>
  );
};

export default PettyCashTransactions;
