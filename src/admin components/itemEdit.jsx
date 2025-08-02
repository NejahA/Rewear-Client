import {
  ImageInput,
  Edit,
  SimpleForm,
  TextInput,
  required,
  SelectInput,
  DateInput,
  ImageField,
  NumberInput,
  useRecordContext,
  defaultTheme,
  SimpleFormIterator,
  ArrayInput,
} from "react-admin";
import { Grid, Box } from "@mui/material";
import { createTheme } from "@mui/material/styles";

import { useInput } from "react-admin";
import { Autocomplete, TextField, Chip } from "@mui/material";
import TagInput from "./TagInput";
import UserField from "./userField.";
import { deepPurple } from "@mui/material/colors";
const customTheme = createTheme({

  components: {
    RaImageField: {
      styleOverrides: {
        root: {
          display: "flex",
          justifyContent: "center",
          marginTop: "16px",
          width: "400px !important",
          height: "auto !important",
          maxWidth: "100% !important",
          borderRadius: "8px",
        },
        image: {
          width: "400px !important",
          height: "auto !important",
          maxWidth: "100% !important",
          borderRadius: "8px",
        },
      },
    },
  },
});

const itemEdit = (props) => {
   const record = useRecordContext();

  return (
    <Edit title="Edit Item" {...props}>
      <SimpleForm>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <SelectInput
              source="status"
              choices={[
                { id: "0", name: "0: Pending" },
                { id: "1", name: "1: Validated" },
                { id: "2", name: "2: Rejected" },
                { id: "3", name: "3: Removed" },
                { id: "4", name: "4: Sold" },
              ]}
              validate={required()}
            />
            <TextInput source="title" fullWidth />
            <TextInput source="category" />
            <TextInput source="brand" fullWidth />
            <TextInput source="size" fullWidth />
            <TextInput source="gender" fullWidth />
            <TextInput source="age" fullWidth />
            <TextInput source="previousOwners" fullWidth />
            <TagInput source="tags" />
          </Grid>

          <Grid item xs={6}>
            <UserField />
            <TextInput source="user.email" disabled fullWidth />
            <TextInput source="description" multiline rows={3} fullWidth />
            <NumberInput source="price" fullWidth />
            <DateInput source="created_at" disabled fullWidth />
            <DateInput source="updated_at" disabled fullWidth />
            <TextInput source="condition" fullWidth />
            <TextInput
              source="adminComment"
              multiline 
              rows={5}
              fullWidth
            />
          </Grid>


          {/* <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
            <ImageField
              source="itemPics"
              src="url"
              item
              sx={{
                width: "500px", // Force larger width
                height: "auto",
                "& img": { 
                  width: "100% !important", // Ensure it scales up
                  height: "auto !important",
                  maxWidth: "unset !important", // Remove default size limits
                },
              }}
            />
</Grid> */}

 {/* <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
      {record?.itemPics.map((pic, index) => 
      "dljsdl"
      // (
      //   <ImageField
      //     key={index}
      //     source="" // Not needed since we're setting the record directly
      //     record={{ url: pic.url }}
      //     title={`Image ${index + 1}`}
      //   />
      // )
    )}
    </div> */}

          
             <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
             <ImageInput
               source="itemPics"
               label="Item Images"
               accept="image/*"
               multiple
               maxSize={5000000} // 5MB limit per file
               sx={{
                 width: "100%",
                 "& .RaImageInput-dropZone": {
                   minHeight: "200px",
                   border: "2px dashed #ccc",
                   borderRadius: "8px",
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center",
                   flexDirection: "column",
                   gap: "16px",
                 },
                 "& .RaImageInput-preview": {
                   display: "flex",
                   flexWrap: "wrap",
                   gap: "16px",
                   marginTop: "16px",
                   justifyContent: "center",
                 }
               }}
             >



              
            </ImageInput>
            
            
          </Grid>
          
      

        </Grid>
      </SimpleForm>
    </Edit>
  );
};

export default itemEdit;
