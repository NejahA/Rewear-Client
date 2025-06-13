import { useRecordContext } from "react-admin";
import { Link } from "@mui/material";

const UserField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const userId = record.user?.id;  // Adjust based on your data shape
  const userFirstName = record.user?.fName;
  const userLastName = record.user?.lName;
  const userEmail = record.user?.email;  
  // URL to user edit page, adjust the path as needed
  const userEditUrl = `/admin/users/${userId}`;

  return userEmail && userId ? (
    <Link
    className="py-4 "
      color="secondary"
      href={userEditUrl}
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      sx={{ display: "inline-block", width: "100%", overflowWrap: "break-word" }}
    >
      {`${userFirstName} ${userLastName} (${userEmail})`}
    </Link>
  ) : (
    <span>{userEmail || "No user email"}</span>
  );
};

export default UserField;
