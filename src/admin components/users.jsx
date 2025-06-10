import { List, Datagrid, TextField, EmailField, DateField, EditButton, DeleteButton, ArrayField, ImageField } from "react-admin";
const CrudRoute = () => (
    <div>
      &lt;CrudRoute&gt; elements are for configuration only and should not be
      rendered
    </div>
  );
export const UserList = (props) => (
    <List resource="users"  {...props}>
        <Datagrid rowClick="edit">
            {/* <TextField source="_id" /> */}
            <TextField source="fName" />
            <TextField source="lName" /> 
            <TextField source="email" />
            <TextField source="adress" /> 
            <TextField source="phone" /> 
            <ImageField source="profilePic.url"  /> 
            <DateField source="createdAt"/> 
            <DateField source="updatedAt"/> 
            {/* <TextField source = "itemsHistory" /> */}
            <DeleteButton basePath='/users' />
            {/* <TextField source="itemPics" />  */}
            

            {/* <TextField source="website" />
            <TextField source="company.name" /> */}
        </Datagrid>
    </List>
);
