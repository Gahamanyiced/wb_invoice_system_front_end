// src/components/global/FilterPanel.jsx
import { useState } from 'react';
import {
  Paper,
  TextField,
  Typography,
  Button,
  Box,
  Divider,
  Collapse,
  IconButton,
  Chip,
  Autocomplete
} from '@mui/material';
import {
  FilterList,
  Search,
  RestartAlt,
  ExpandMore,
} from '@mui/icons-material';

const FilterPanel = ({ filters, onFilterChange, config }) => {
  const [localFilters, setLocalFilters] = useState(filters || {});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLocalFilterChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    Object.entries(localFilters).forEach(([key, value]) => {
      onFilterChange?.(key, value);
    });
    setIsExpanded(false);
  };

  const handleResetFilters = (e) => {
    e.stopPropagation();
    const resetFilters = {};
    config.fields.forEach((field) => {
      resetFilters[field.name] = '';
    });
    setLocalFilters(resetFilters);
    Object.entries(resetFilters).forEach(([key, value]) => {
      onFilterChange?.(key, value);
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter((value) => value && value !== '')
      .length;
  };

  // Calculate how many items should appear per row based on total number of fields
  const calculateColumnWidth = () => {
    const visibleFields = config.fields.filter((field) => !field.hidden);
    const fieldsCount = visibleFields.length;
    
    // We'll use flex to handle the responsive layout
    if (fieldsCount <= 2) return '100%';
    if (fieldsCount <= 4) return '50%';
    return '33.33%';
  };

  const renderFilterField = (field) => {
    if (field.hidden) return null;

    // Get number of visible fields for responsive calculations
    const visibleFields = config.fields.filter(f => !f.hidden);
    const fieldsCount = visibleFields.length;

    return (
      <Box 
        key={field.name}
        sx={{ 
          p: 1,
          flexGrow: 1,
          flexShrink: 0,
          flexBasis: { 
            xs: '100%', 
            sm: fieldsCount <= 1 ? '100%' : '50%',
            md: fieldsCount <= 2 ? '50%' : '33.33%'
          },
          // Add max-width constraints to ensure consistency
          maxWidth: { 
            xs: '100%', 
            sm: fieldsCount <= 1 ? '100%' : '50%',
            md: fieldsCount <= 2 ? '50%' : '33.33%'
          },
        }}
      >
        {field.type === 'text' && (
          <TextField
            label={field.label}
            fullWidth
            value={localFilters?.[field.name] || ''}
            onChange={(e) =>
              handleLocalFilterChange(field.name, e.target.value)
            }
            InputProps={
              field.showSearchIcon
                ? {
                    startAdornment: (
                      <Search sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }
                : undefined
            }
          />
        )}

        {field.type === 'select' && (
          <Autocomplete
            options={field.options}
            getOptionLabel={(option) => option.label || ''}
            value={
              field.options.find(
                (option) => option.value === localFilters?.[field.name]
              ) || null
            }
            onChange={(event, newValue) =>
              handleLocalFilterChange(
                field.name,
                newValue ? newValue.value : ''
              )
            }
            renderInput={(params) => (
              <TextField 
                {...params} 
                label={field.label} 
                variant="outlined"
                // Ensure the input field doesn't expand beyond its container
                sx={{ width: '100%' }}
              />
            )}
            // Force the Autocomplete to respect its container width
            sx={{ width: '100%' }}
          />
        )}

        {field.type === 'date' && (
          <TextField
            label={field.label}
            type="date"
            fullWidth
            value={localFilters?.[field.name] || ''}
            onChange={(e) =>
              handleLocalFilterChange(field.name, e.target.value)
            }
            InputLabelProps={{ shrink: true }}
          />
        )}
      </Box>
    );
  };

  return (
    <Paper elevation={1} sx={{ mb: 3 }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <FilterList sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" color="primary" sx={{ flexGrow: 1 }}>
          {config.title || 'Filters'}
          {getActiveFiltersCount() > 0 && (
            <Chip
              size="small"
              label={getActiveFiltersCount()}
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <Button
          startIcon={<RestartAlt />}
          onClick={handleResetFilters}
          color="inherit"
          size="small"
          sx={{ mr: 1 }}
        >
          Reset
        </Button>
        <IconButton
          size="small"
          sx={{
            transform: isExpanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s',
          }}
        >
          <ExpandMore />
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Divider />
        <Box sx={{ p: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              width: '100%',
              margin: -1 // Negative margin to offset the padding in child elements
            }}
          >
            {config.fields.map((field) => renderFilterField(field))}
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleApplyFilters}
              sx={{
                minWidth: 120,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default FilterPanel;