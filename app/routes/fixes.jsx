import { Typography } from "@mui/material";
import { useLoaderData } from "remix";

import { authenticator } from "~/services/auth.server";
import Header from "../components/header";

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return {
    user,
  };
};

export default function Fixes() {
  const { user } = useLoaderData();

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
          Fixes
        </Typography>
      </div>
    </>
  );
}
