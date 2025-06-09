import { Edit,SimpleForm,TextInput,required ,SelectInput, DateInput, ImageField,NumberInput,defaultTheme  } from 'react-admin'
import { Grid , Box} from '@mui/material';
import { createTheme } from '@mui/material/styles';

const customTheme = createTheme({
  components: {
      RaImageField: {
          styleOverrides: {
              root: {
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '16px',
                  width: '400px !important', 
                  height: 'auto !important', 
                  maxWidth: '100% !important',
                  borderRadius: '8px'
              },
              image: {
                  width: '400px !important', 
                  height: 'auto !important', 
                  maxWidth: '100% !important',
                  borderRadius: '8px'
              }
          }
      }
  }
});

const itemEdit = (props) => {
  return (
    

        <Edit title='Edit Item' {...props} >
        <SimpleForm  >
            <Grid container spacing={2}>
                <Grid item xs={6}>
                <SelectInput source="status" choices={[
               { id: '0', name: '0: Pending' },
               { id: '1', name: '1: Validated' },
               {id: '2', name: '2: Rejected' },
                {id: '3', name: '3: Deleted' },
              ]} validate={required()}/>
                    <TextInput source="title" fullWidth />
                    <TextInput source="category" />
                    <TextInput source="brand" fullWidth />
                    <TextInput source="size" fullWidth />
                </Grid>
                <Grid item xs={6}>
                    <NumberInput source="price" fullWidth />
                    <TextInput source="description" multiline rows={5} fullWidth />
                    <TextInput source="user" disabled fullWidth />
                    <DateInput source="created_at" disabled fullWidth />
                    <DateInput source="updated_at" disabled fullWidth />
                </Grid>
                
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center'  }}>
                    <ImageField   source="itemPics" src='url' item 
                                sx={{
                                  width: "500px", // Force larger width
                                  height: "auto",
                                  "& img": {
                                      width: "100% !important",  // Ensure it scales up
                                      height: "auto !important",
                                      maxWidth: "unset !important" // Remove default size limits
                                  }
                              }}
                    />  
                </Grid>
               
            </Grid>
        </SimpleForm>
    </Edit>
  )
}

export default itemEdit