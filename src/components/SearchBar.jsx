import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function SearchBar({ setSearchQuery }) {
  return (
    <form sx={{}}>
      <TextField
        id="search"
        type="search"
        label="Search"
        size="small"
        onInput={(e) => {
          setSearchQuery(e.target.value);
        }}
        sx={{ width: 300 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </form>
  );
}

export default SearchBar;
