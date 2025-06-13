import {
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    NumberInput,
    ImageInput,
    ImageField,
    useRecordContext,
} from "react-admin";
import { Box, Grid, Typography } from "@mui/material";
import UserItemHistory from "./userItemHistory";

const ProfilePicPreview = () => {
    const record = useRecordContext();
    return record?.profilePic?.url ? (
        <ImageField
            source="profilePic.url"
            label="Profile Picture"
            sx={{ width: 150, height: "auto", mt: 2 }}
        />
    ) : null;
};

const UserEdit = (props) => (
    <Edit title="Edit User" {...props}>
        <SimpleForm>
            <Grid container spacing={2}>
                {/* Left column: Personal info */}
                {/* <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>
                        Personal Info
                    </Typography>
                    <TextInput source="fName" label="First Name" fullWidth />
                    <TextInput source="lName" label="Last Name" fullWidth />
                    <TextInput source="email" fullWidth />
                    <TextInput source="adress" label="Address" fullWidth />
                    <NumberInput source="phone" fullWidth />
                </Grid> */}
                <Grid container xs={12} sm={6} spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Contact Information
                        </Typography>
                    </Grid>

                    <Grid item xs={8}>
                        <TextInput source="email" fullWidth />
                    </Grid>
                    <Grid item xs={4}>
                        <BooleanInput source="showEmail" color="secondary" label="Show?" />
                    </Grid>

                    <Grid item xs={8}>
                        <TextInput source="adress" label="Address" fullWidth />
                    </Grid>
                    <Grid item xs={4}>
                        <BooleanInput source="showAdress" color="secondary" label="Show?" />
                    </Grid>

                    <Grid item xs={8}>
                        <NumberInput source="phone" fullWidth />
                    </Grid>
                    <Grid item xs={4}>
                        <BooleanInput source="showPhone" color="secondary" label="Show?" />
                    </Grid>
                </Grid>

                {/* Right column: Profile picture */}
                <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>
                        Profile Picture
                    </Typography>
                    <ProfilePicPreview />
                    <ImageInput
                        source="profilePic"
                        label="Upload New Picture"
                        accept="image/*"
                        fullWidth
                    >
                        <ImageField source="src" title="title" />
                    </ImageInput>


                </Grid>

            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>
                    Permissions
                </Typography>
                <BooleanInput source="isAdmin" color="secondary" label="Is Admin?" />
                {/* Visibility Toggles */}
                {/* <Grid item xs={12} sm={6}>
                    <Typography variant="h6" gutterBottom>
                        Visibility
                    </Typography>
                    <BooleanInput source="showEmail" label="Show Email?" />
                    <BooleanInput source="showAdress" label="Show Address?" />
                    <BooleanInput source="showPhone" label="Show Phone?" />
                </Grid> */}

                {/* Admin Role */}

            </Grid>
            <Typography variant="h6" gutterBottom>
                Item History
            </Typography>
            <UserItemHistory />

        </SimpleForm>
    </Edit>
);

export default UserEdit;
