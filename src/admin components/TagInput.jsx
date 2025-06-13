// src/components/TagInput.js
import { useInput } from 'react-admin';
import { Autocomplete, TextField, Chip } from '@mui/material';
import { deepPurple } from '@mui/material/colors';
const TagInput = ({ source, label = 'Tags', ...props }) => {
  const {
    field: { value, onChange },
  } =  useInput({ source });
  const safeValue = Array.isArray(value) ? value : [];

  return (
    <Autocomplete
      multiple
      freeSolo
      size="small"
      options={[]} // optionally add predefined tags
      value={safeValue}
      onChange={(event, newValue) => onChange(newValue)}
      renderTags={   (tagValue, getTagProps) =>
           tagValue && tagValue.map((option, index) => (
          <Chip
            variant="outlined"
            color="secondary"
            // sx={{color:deepPurple[800] , borderColor: deepPurple[800]}}
            size="small"
            label={option}
            {...getTagProps({ index })}
            key={index}
          />
        ) ) 
      }
      
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          fullWidth
        />
      )}
      {...props}
    />
  );
};

export default TagInput;
