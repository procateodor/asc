import { useLoaderData, useSearchParams } from "remix";
import { useEffect, useState } from "react";
import * as Ably from "ably";
import { DataGrid } from "@mui/x-data-grid";

import { getVulnerabilities } from "~/db.server";
import { columns } from "./utils";
import { Typography } from "@mui/material";

export const loader = async () => getVulnerabilities();

const ably = new Ably.Realtime(
  "7YC25Q.12JClg:r9IBW4nN3UyZsfw_sa8tonN41v8NMHsW5WVrjaRqju4"
);
const channel = ably.channels.get("all");

export default function VulnerabilitiesIndex() {
  const vulnerabilities = useLoaderData();
  const [allVulnerabilities, setAllVulnerabilities] = useState(vulnerabilities);
  const [filteredVulnerabilities, setFilteredVulnerabilities] =
    useState(allVulnerabilities);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    channel.subscribe((message) => {
      const vulnerability = JSON.parse(message.data);
      if (!allVulnerabilities.find((v) => v.id === vulnerability.id)) {
        setAllVulnerabilities([vulnerability, ...allVulnerabilities]);
        Notification.requestPermission().then(() => {
          new Notification(vulnerability.type, {
            body: vulnerability.description,
          });
        });
      }
    });
    return () => {
      channel.unsubscribe();
    };
  }, [allVulnerabilities]);

  useEffect(() => {
    if (searchParams.get("q") !== null && searchParams.get("q") !== undefined) {
      setFilteredVulnerabilities(
        allVulnerabilities.filter((v) =>
          v.description
            .toLowerCase()
            .includes(searchParams.get("q").toLowerCase())
        )
      );
    } else {
      setFilteredVulnerabilities([...allVulnerabilities]);
    }
  }, [searchParams, allVulnerabilities]);

  return (
    <div
      style={{
        lineHeight: "1.4",
        height: "auto",
      }}
      className="container p-2 pt-5"
    >
      <Typography variant="h4" color="inherit" mb={3} fontWeight={800}>
        Vulnerabilities
      </Typography>
      <DataGrid
        style={{ height: "calc(100vh - 200px)", minHeight: "600px" }}
        rows={filteredVulnerabilities}
        columns={columns}
        pageSize={20}
      />
    </div>
  );
}
