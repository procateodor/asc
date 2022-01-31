import {
  Button,
  Card,
  CardActions,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLoaderData, useLocation, useSearchParams } from "remix";

import { authenticator } from "~/services/auth.server";
import { getReports } from "~/services/graph.server";
import Header from "../components/header";

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const reports = await getReports();

  return {
    user,
    reports,
  };
};

export default function Fixes() {
  const { user, reports } = useLoaderData();

  const [allReports] = useState(reports);
  const [filteredReports, setFilteredReports] = useState(allReports);

  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [platform, setPlatform] = useState(
    state
      ? allReports.find(
          (report) =>
            report.articleSection.toLowerCase() === state.platform.toLowerCase()
        )
        ? state.platform
        : ""
      : ""
  );

  useEffect(() => {
    if (state?.q) {
      setSearchParams(`?q=${state.q}`);
    }
  }, []);

  useEffect(() => {
    setFilteredReports(
      platform
        ? allReports.filter(
            (report) =>
              report.articleSection.toLowerCase() === platform.toLowerCase() &&
              (searchParams.get("q") !== null &&
              searchParams.get("q") !== undefined
                ? searchParams
                    .get("q")
                    .replace(/[^a-z0-9 ]/gi, "")
                    .split(" ")
                    .filter((keyword) => !!keyword)
                    .some((keyword) =>
                      report.articleBody
                        .toLowerCase()
                        .includes(keyword.toLowerCase())
                    ) ||
                  searchParams
                    .get("q")
                    .replace(/[^a-z0-9 ]/gi, "")
                    .split(" ")
                    .filter((keyword) => !!keyword)
                    .some((keyword) =>
                      report.keywords
                        .toLowerCase()
                        .includes(keyword.toLowerCase())
                    )
                : true)
          )
        : searchParams.get("q") !== null && searchParams.get("q") !== undefined
        ? allReports.filter(
            (report) =>
              searchParams
                .get("q")
                .replace(/[^a-z0-9 ]/gi, "")
                .split(" ")
                .filter((keyword) => !!keyword)
                .some((keyword) =>
                  report.articleBody
                    .toLowerCase()
                    .includes(keyword.toLowerCase())
                ) ||
              searchParams
                .get("q")
                .replace(/[^a-z0-9 ]/gi, "")
                .split(" ")
                .filter((keyword) => !!keyword)
                .some((keyword) =>
                  report.keywords.toLowerCase().includes(keyword.toLowerCase())
                )
          )
        : allReports
    );
  }, [platform, searchParams]);

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
          Reports
        </Typography>

        <Grid container spacing={2} className="mb-3">
          <Grid item xs={3}>
            <FormControl style={{ width: "100%" }}>
              <InputLabel id="platform">Platform</InputLabel>
              <Select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                labelId="platform"
                fullWidth
                label="Platform"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {[
                  ...new Set(allReports.map((report) => report.articleSection)),
                ].map((platform) => (
                  <MenuItem key={platform} value={platform}>
                    {platform}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2} vocab="http://schema.org/">
          {filteredReports.map((report) => (
            <Grid key={report.id} item md={6} xs={12}>
              <script type="application/ld+json">
                {`
  {
    "@type"": "${report["@type"]}",
    "id"": ${report.id},
    "articleBody": "${report.articleBody}",
    "articleSection": "${report.articleSection}",
    "url": "${report.url}",
    "genre": "${report.genre}",
    "keywords": "${report.keywords}"
  }
`}
              </script>
              <Card variant="outlined" typeof="rdfa:Report">
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    <span property="genre">{report.genre}</span>
                  </Typography>
                  <Typography
                    className="overflow"
                    variant="body2"
                    color="text.secondary"
                  >
                    <span property="articleBody">{report.articleBody}</span>
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    target="_blank"
                    href={report.url}
                    size="small"
                    color="primary"
                    property="url"
                  >
                    Open
                  </Button>
                  <Button style={{ marginLeft: "auto" }} size="small" disabled>
                    <span property="articleSection">
                      {report.articleSection}
                    </span>
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
}
