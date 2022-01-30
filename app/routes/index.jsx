import { useLoaderData, useSearchParams } from "remix";
import { useEffect, useState } from "react";
import * as Ably from "ably";
import { Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { authenticator } from "~/services/auth.server";
import { getVulnerabilities } from "~/db.server";
import { columns } from "./utils";
import Header from "../components/header";

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return {
    user,
    vulnerabilities: await getVulnerabilities(),
  };
};

export let action = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: "/login" });
};

export default function VulnerabilitiesIndex() {
  const { user, vulnerabilities } = useLoaderData();
  const [allVulnerabilities, setAllVulnerabilities] = useState(vulnerabilities);
  const [filteredVulnerabilities, setFilteredVulnerabilities] =
    useState(allVulnerabilities);

  const [channel, setChannel] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ably = new Ably.Realtime(
      "7YC25Q.12JClg:r9IBW4nN3UyZsfw_sa8tonN41v8NMHsW5WVrjaRqju4"
    );
    setChannel(ably.channels.get("all"));
  }, []);

  useEffect(() => {
    channel?.subscribe((message) => {
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
      channel?.unsubscribe();
    };
  }, [allVulnerabilities, channel]);

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
    <>
      <Header user={user} />
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
    </>
  );
}
