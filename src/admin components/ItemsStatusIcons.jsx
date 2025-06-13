import { Link, useRecordContext } from "react-admin";
import { Box, IconButton, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { deepPurple } from "@mui/material/colors";
const statusIcons = {
  "0": { icon: <HourglassEmptyIcon color="info" />, label: "Pending" },
  "1": { icon: <CheckCircleIcon color="secondary"  />, label: "On Sale" },
  "2": { icon: <CancelIcon color="error" />, label: "Rejected" },
  "3": { icon: <RemoveCircleIcon color="disabled" />, label: "Removed" },
  "4": { icon: <MonetizationOnIcon color="primary" />, label: "Sold" },
};

const ItemsStatusIcons = () => {
  const record = useRecordContext();
  if (!record?.itemsHistory || record.itemsHistory.length === 0) return null;

  const visibleItems = record.itemsHistory.slice(0, 10);
  const remaining = record.itemsHistory.length - visibleItems.length;

  return (
    <Box display="flex" flexWrap="wrap" gap={1}>
      {visibleItems.map((item) => {
        const status = statusIcons[item.status];
        return (
          <Box
            key={item._id}
            onClick={(e) => e.stopPropagation()} // ⛔ STOP rowClick
          >
            <Tooltip title={status?.label || "Unknown"}>
              <IconButton
                component={Link}
              to={`/admin/items/${item._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {status?.icon}
              </IconButton>
            </Tooltip>
          </Box>
        );
      })}

      {remaining > 0 && (
        <Tooltip title={`+${remaining} more items`}>
          <Box
            width={32}
            height={32}
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="1px solid #ccc"
            borderRadius="50%"
            fontSize="0.75rem"
            sx={{ cursor: "default", userSelect: "none" }}
            onClick={(e) => e.stopPropagation()} // Prevent rowClick here too
          >
            +{remaining}
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default ItemsStatusIcons;
