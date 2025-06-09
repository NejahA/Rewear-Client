import { List, Datagrid, TextField, ImageField,ImageInput,EmailField, DateField, EditButton, DeleteButton, FunctionField,Pagination } from "react-admin";
// const CustomPagination = props => <Pagination rowsPerPageOptions={[5,10, 25, 50]} {...props} />;

export const ItemList = (props) => (
    <List resource="items"  {...props}
    //  pagination={<CustomPagination />}
     >
        <Datagrid rowClick="edit">
            {/* <TextField source="_id" /> */}
            {/* <TextField source="id" /> */}
            <TextField source="title" />
            <TextField source="category" />
            <TextField source="brand" />
            <TextField source="size" /> 
            <TextField source="description" /> 
            <TextField source="price" /> 
            <FunctionField
        label="User Email"
        render={(record) =>record && record.user && record.user.email || "No email available"}
      />            
            <TextField source="status" /> 
            <DateField source="createdAt"/> 
            <DateField source="updatedAt"/> 
            <ImageField source="itemPics" src='url'/> 
            <EditButton />

            <DeleteButton basePath='/items' />
            {/* <TextField source="itemPics" />  */}
            

            {/* <TextField source="website" />
            <TextField source="company.name" /> */}
        </Datagrid>
    </List>
);
