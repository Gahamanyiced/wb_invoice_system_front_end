import { useState } from 'react';
import { updateInvoice, getInvoiceByUser } from '../features/invoice/invoiceSlice';
import Modal from '@mui/material/Modal';
import { Link } from 'react-router-dom';
import {
  Grid,
  FormControl,
  InputLabel,
  Input,
  Select,
  Button,
  MenuItem,
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const style = {
  box: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 900,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflow: 'auto',
    maxHeight: '90%',
  },
  button: {
    marginBottom: '20px',
  },
};

function UpdateInvoiceModal({
  defaultValues,
  open,
  handleClose,
  setUpdateTrigger,
}) {
  const navigate = useNavigate();
  const [value, setValue] = useState('new');
  const [comment, setComment] = useState();
  const dispatch = useDispatch();
  const { isLoading, invoice } = useSelector((state) => state.invoice);
  const [formData, setFormData] = useState({
    title: defaultValues?.title,
    description: defaultValues?.description,
  });
  const [documents, setDocuments] = useState(defaultValues?.documents);
  const [anotherDocuments, setAnotherDocuments] = useState([]);
  const [selectedDocumentIndices, setSelectedDocumentIndices] = useState([]);
  const [anotherSelectedDocumentIndices, setAnotherSelectedDocumentIndices] =
    useState([]);
  const [replacedDocumentIds, setReplacedDocumentIds] = useState([]);

  const handleRadioChange = (event) => {
    setValue(event.target.value);
  };

  const handleComment = (event) => {
    setComment(event.target.value);
  };
  const handleCheckboxChange = (event, index) => {
    if (event.target.checked) {
      setSelectedDocumentIndices([...selectedDocumentIndices, index]);
      setAnotherSelectedDocumentIndices([...selectedDocumentIndices, index]);
    } else {
      const newIndices = selectedDocumentIndices.filter((i) => i !== index);
      setSelectedDocumentIndices(newIndices);
      setAnotherSelectedDocumentIndices(newIndices);
    }
  };

  const handleChangeFormData = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChangeForNewDocument = (event, index) => {
    const newDocuments = [...anotherDocuments];
    newDocuments[index] = event.target.files[0];
    setAnotherDocuments(newDocuments);
  };

  const handleChangeForUpdatingDocument = (event, index) => {
    const newDocuments = [...documents];
    const selectedIndex = selectedDocumentIndices.shift();
    if (selectedIndex !== undefined) {
      setReplacedDocumentIds([
        ...replacedDocumentIds,
        newDocuments[selectedIndex].id,
      ]);
      newDocuments[selectedIndex] = event.target.files[0];
      setSelectedDocumentIndices([...selectedDocumentIndices]);
    }
    setDocuments(newDocuments);
  };

  const handleCloseUpdate = () => {
    setDocuments(defaultValues?.documents);
    handleClose();
  };

  const resetState = () => {
    setValue('new');
    setFormData({
      title: defaultValues?.title,
      description: defaultValues?.description,
    });
    setDocuments(defaultValues?.documents);
    setSelectedDocumentIndices([]);
    setAnotherSelectedDocumentIndices([]);
    setReplacedDocumentIds([]);
    setAnotherDocuments([]);
    setComment();
  };

  const submit = async () => {
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (comment) {
        data.append('comment', comment);
      }

      if (value === 'change') {
        anotherSelectedDocumentIndices.forEach((documentIndex, index) => {
          data.append('documents', documents[documentIndex]);
          data.append('document_id', replacedDocumentIds[index]);
        });
      } else if (value === 'new') {
        anotherDocuments.forEach((document, index) => {
          data.append('documents', document);
        });
      }

      await dispatch(updateInvoice({ id: defaultValues?.id, data }));
      toast.success('Invoice Updated Successfully');
      handleCloseUpdate();
      setUpdateTrigger((prev) => !prev);
      resetState();
    } catch (error) {
      // console.log('error', error);
      toast.error(error);
      navigate('/');
    }
  };

  const handleAddMore = () => {
    setDocuments([...documents, {}]);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style.box}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" align="center">
              Invoice Details
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel> Invoice TITLE</InputLabel>
              <Input
                label="Purchase Goods"
                name="title"
                multiline
                value={formData?.title ?? defaultValues?.title}
                onChange={handleChangeFormData}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <TextField
                name="description"
                label="Description"
                variant="outlined"
                multiline
                onChange={handleChangeFormData}
                value={formData?.description ?? defaultValues?.description}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Comment</InputLabel>
              <Input
                label="Comment"
                name="comment"
                multiline
                value={comment}
                onChange={handleComment}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl>
              <FormLabel id="demo-row-radio-buttons-group-label">
                Document
              </FormLabel>
              <RadioGroup
                row
                value={value}
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                onChange={handleRadioChange}
              >
                <FormControlLabel
                  value="change"
                  control={<Radio />}
                  label="Change Uploaded Document"
                />
                <FormControlLabel
                  value="new"
                  control={<Radio />}
                  label="Upload More Documents"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Box display="flex" flexDirection="column" alignItems="flex-start">
            {value === 'change' &&
              documents?.map((doc, index) => {
                if (Object.keys(doc).length === 0) {
                  return null;
                }

                return (
                  <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    sx={{ marginTop: '10px' }}
                  >
                    <Checkbox
                      onChange={(event) => handleCheckboxChange(event, index)}
                    />
                    <Typography key={index}>
                      DOCUMENT {index + 1}:{' '}
                      <a
                        href={doc?.file_data}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        CLICK HERE
                      </a>
                    </Typography>
                  </Box>
                );
              })}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              sx={{ marginTop: '20px' }}
            >
              <InputLabel>FILES</InputLabel>
              <Box display="flex" flexDirection="row" alignItems="flex-start">
                <Box>
                  <Button
                    onClick={handleAddMore}
                    startIcon={<AddIcon />}
                    sx={{ marginBottom: '20px' }}
                  >
                    Add More Files
                  </Button>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                >
                  {documents.map((document, index) => (
                    <Grid item xs={12} key={index}>
                      <Input
                        placeholder="UPLOAD"
                        type="file"
                        onChange={(event) => {
                          if (value === 'change') {
                            handleChangeForUpdatingDocument(event, index);
                          } else if (value === 'new') {
                            handleChangeForNewDocument(event, index);
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'row', p: 1 }}>
                {isLoading ? (
                  <CircularProgress size="25px" sx={{ marginTop: '30px' }} />
                ) : (
                  <Button
                    variant="contained"
                    sx={{ marginTop: '20px', bgcolor: 'purple' }}
                    onClick={submit}
                  >
                    Update
                  </Button>
                )}
                <Button
                  variant="contained"
                  sx={{
                    marginTop: '20px',
                    bgcolor: '#00529B',
                    marginLeft: '20px',
                  }}
                  onClick={handleCloseUpdate}
                >
                  Close
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Box>
    </Modal>
  );
}

export default UpdateInvoiceModal;
