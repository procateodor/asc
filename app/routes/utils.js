export const columns = [
  { field: "id", headerName: "Id" },
  { field: "description", headerName: "Description", width: 600 },
  { field: "type", headerName: "Type" },
  {
    field: "platform",
    headerName: "Platform",
  },
  {
    field: "date_published",
    headerName: "Published",
  },
  {
    field: "verified",
    headerName: "Verified",
    valueGetter: (params) => (params.row.verified ? "Yes" : "No"),
  },
  {
    field: "port",
    headerName: "Port",
    valueGetter: (params) => params.row.port || "N/A",
  },
  {
    field: "port",
    headerName: "Port",
  },
  {
    field: "risk",
    headerName: "Risk",
  },
];
