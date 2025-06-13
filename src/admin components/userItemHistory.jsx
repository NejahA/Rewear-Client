import { useRecordContext, useDataProvider, useNotify, useRefresh } from "react-admin";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    IconButton,
} from "@mui/material";
import { OpenInNew, Delete } from "@mui/icons-material";

const statusLabels = {
    "0": "Pending",
    "1": "Validated",
    "2": "Rejected",
    "3": "Removed",
    "4": "Sold",
};

const statusClassMap = {
    "0": "statuscl-0",
    "1": "statuscl-1",
    "2": "statuscl-2",
    "4": "statuscl-4",
};

const UserItemHistory = () => {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();

    if (!record?.itemsHistory?.length) {
        return <Typography>No item history available.</Typography>;
    }

    const handleDelete = (itemId) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            dataProvider
                .delete("items", { id: itemId })
                .then(() => {
                    notify("Item deleted successfully", { type: "success" });
                    refresh();
                })
                .catch((error) => {
                    notify(`Error: ${error.message}`, { type: "error" });
                });
        }
    };

    return (
        <Box
            sx={{
                border: "2px solid #5C2D9A", // Purple border
                borderRadius: 3,
                padding: 2,
                maxWidth: 1000,
                mx: "auto",
                my: 3,
                backgroundColor: "#fafafa",
            }}
        >
            <Typography variant="h6" fontWeight={600} mb={2}>
                Item History
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    overflowX: "auto",
                    gap: 2,
                    height: 450, // fixed height for cards + scrollbar
                    paddingBottom: 2,
                }}
            >
                {record.itemsHistory.map((item, idx) => (
                    <Card
                        key={idx}
                        sx={{
                            minWidth: 250,
                            maxWidth: 280,
                            flexShrink: 0,
                            borderRadius: 2,
                            boxShadow: 3,
                            position: "relative", // for absolute delete button
                        }}
                    >   
                        {

                        (item.status === "3" || item.status == "2") && // Only show delete button for rejected items
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(item.id)}
                            sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                backgroundColor: "rgba(255,255,255,0.8)",
                                "&:hover": { backgroundColor: "rgba(255,0,0,0.15)" },
                                zIndex: 10,
                            }}
                            aria-label={`Delete item ${item.title}`}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                        }
                        {item.itemPics?.[0]?.url && (
                            <Box
                                component="img"
                                src={item.itemPics[0].url}
                                alt={item.title}
                                sx={{
                                    width: "100%",
                                    height: 250,
                                    objectFit: "cover",
                                    borderTopLeftRadius: 8,
                                    borderTopRightRadius: 8,
                                }}
                            />
                        )}

                        <CardContent>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {item.title}
                            </Typography>

                            <Typography
                                variant="caption"
                                className={statusClassMap[item.status] || ""}
                                sx={{ fontWeight: 500 }}
                            >
                                {statusLabels[item.status] || "Unknown"}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                {item.category} - ${item.price.toFixed(2)}
                            </Typography>

                            <Box mt={1} sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {item.tags?.slice(0, 3).map((tag, i) => (
                                    <Chip key={i} label={tag} size="small" />
                                ))}
                            </Box>

                            <Box mt={1} textAlign="right">
                                <IconButton
                                    href={`/admin/items/${item.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    size="small"
                                    aria-label={`Open item ${item.title} in new tab`}
                                >
                                    <OpenInNew fontSize="small" />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default UserItemHistory;
