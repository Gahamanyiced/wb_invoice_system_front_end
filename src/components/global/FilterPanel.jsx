// src/components/global/FilterPanel.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Autocomplete,
  InputAdornment,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TuneIcon from '@mui/icons-material/Tune';

const FilterPanel = ({ filters, onFilterChange, config }) => {
  const [localFilters, setLocalFilters] = useState(filters || {});

  // Keep local state in sync when filters reset externally
  useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  const handleLocalChange = (field, value) => {
    const updated = { ...localFilters, [field]: value };
    setLocalFilters(updated);
    // Apply immediately on each change (no separate Apply button needed)
    onFilterChange?.(field, value);
  };

  const handleReset = () => {
    const reset = {};
    config.fields.forEach((f) => {
      reset[f.name] = '';
    });
    setLocalFilters(reset);
    Object.entries(reset).forEach(([k, v]) => onFilterChange?.(k, v));
  };

  const activeCount = Object.values(localFilters).filter(
    (v) => v && v !== '',
  ).length;
  const visibleFields = config.fields.filter((f) => !f.hidden);

  return (
    <Box
      sx={{
        mb: 2,
        p: 1.5,
        backgroundColor: '#fff',
        border: '1px solid #e0e8f0',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
      }}
    >
      {/* Label */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}
      >
        <TuneIcon sx={{ fontSize: 16, color: '#00529B' }} />
        <Typography
          sx={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#00529B',
            whiteSpace: 'nowrap',
          }}
        >
          Filters
        </Typography>
        {activeCount > 0 && (
          <Chip
            label={activeCount}
            size="small"
            sx={{
              height: '18px',
              fontSize: '10px',
              fontWeight: 700,
              bgcolor: '#00529B',
              color: '#fff',
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        )}
      </Box>

      {/* Thin divider */}
      <Box
        sx={{
          width: '1px',
          height: '28px',
          backgroundColor: '#e0e8f0',
          flexShrink: 0,
        }}
      />

      {/* Filter fields — each one inline */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          flex: 1,
          alignItems: 'center',
        }}
      >
        {visibleFields.map((field) => {
          if (field.type === 'text') {
            return (
              <TextField
                key={field.name}
                placeholder={field.label}
                size="small"
                value={localFilters?.[field.name] || ''}
                onChange={(e) => handleLocalChange(field.name, e.target.value)}
                InputProps={{
                  startAdornment: field.showSearchIcon ? (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 15, color: '#aaa' }} />
                    </InputAdornment>
                  ) : undefined,
                  sx: {
                    fontSize: '12.5px',
                    height: '34px',
                    borderRadius: '7px',
                  },
                }}
                sx={{
                  minWidth: 160,
                  maxWidth: 220,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e0e8f0' },
                    '&:hover fieldset': { borderColor: '#90caf9' },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00529B',
                      borderWidth: '1.5px',
                    },
                  },
                  '& input::placeholder': { fontSize: '12px', color: '#aaa' },
                }}
              />
            );
          }

          if (field.type === 'select') {
            return (
              <Autocomplete
                key={field.name}
                options={field.options || []}
                getOptionLabel={(opt) => opt.label || ''}
                value={
                  field.options?.find(
                    (o) => o.value === localFilters?.[field.name],
                  ) || null
                }
                onChange={(_, newVal) =>
                  handleLocalChange(field.name, newVal ? newVal.value : '')
                }
                size="small"
                sx={{ minWidth: 160, maxWidth: 200 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={field.label}
                    InputProps={{
                      ...params.InputProps,
                      sx: {
                        fontSize: '12.5px',
                        height: '34px',
                        borderRadius: '7px',
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#e0e8f0' },
                        '&:hover fieldset': { borderColor: '#90caf9' },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00529B',
                          borderWidth: '1.5px',
                        },
                      },
                      '& input::placeholder': {
                        fontSize: '12px',
                        color: '#aaa',
                      },
                    }}
                  />
                )}
                slotProps={{
                  popper: {
                    sx: {
                      '& .MuiAutocomplete-listbox': { fontSize: '12.5px' },
                    },
                  },
                }}
              />
            );
          }

          if (field.type === 'date') {
            return (
              <TextField
                key={field.name}
                type="date"
                size="small"
                value={localFilters?.[field.name] || ''}
                onChange={(e) => handleLocalChange(field.name, e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  sx: {
                    fontSize: '12.5px',
                    height: '34px',
                    borderRadius: '7px',
                  },
                }}
                sx={{
                  minWidth: 150,
                  maxWidth: 180,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e0e8f0' },
                    '&:hover fieldset': { borderColor: '#90caf9' },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00529B',
                      borderWidth: '1.5px',
                    },
                  },
                }}
              />
            );
          }

          return null;
        })}
      </Box>

      {/* Reset button — only shown when filters are active */}
      {activeCount > 0 && (
        <Button
          onClick={handleReset}
          size="small"
          startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
          sx={{
            flexShrink: 0,
            fontSize: '11.5px',
            fontWeight: 600,
            color: '#d32f2f',
            textTransform: 'none',
            px: 1.2,
            height: '30px',
            borderRadius: '7px',
            '&:hover': { backgroundColor: '#ffebee' },
          }}
        >
          Clear
        </Button>
      )}
    </Box>
  );
};

export default FilterPanel;
