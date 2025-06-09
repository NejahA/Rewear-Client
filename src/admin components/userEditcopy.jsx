import { Edit,SimpleForm,TextInput,TextField, DateInput } from 'react-admin'

const itemEdit = (props) => {
  return (
    <Edit title='Edit Item' {...props}>
        <SimpleForm>
            <TextInput source="status" /> 
            <TextInput source="title" />
            <TextInput source="category" />
            <TextInput source="brand" />
            <TextInput source="size" /> 
            <TextInput source="description" /> 
            <TextInput source="price" /> 
            <TextInput source="user" /> 
            <DateInput source="createdAt"/> 
            <DateInput source="updatedAt"/>        
        </SimpleForm>
    </Edit>
  )
}

export default itemEdit