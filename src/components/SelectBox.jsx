import { useEffect, useState } from 'react';
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';

function SelectBox() {
  const [value, setValue] = useState('');

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <FormControl sx={{ width: 200, height: '35px' }}>
      <Select
        value={value}
        onChange={handleChange}
        displayEmpty
        sx={{minHeight:'35px'}}
      >
        <MenuItem disabled value="">
          <InputLabel id="filter-label">Filter</InputLabel>
        </MenuItem>
        <MenuItem value={10}>Ten</MenuItem>
        <MenuItem value={20}>Twenty</MenuItem>
        <MenuItem value={30}>Thirty</MenuItem>
      </Select>
    </FormControl>
  );
}

export default SelectBox;