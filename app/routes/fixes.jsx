import { Typography } from "@mui/material";
import { useLoaderData } from "remix";

import { authenticator } from "~/services/auth.server";
import Header from "../components/header";
import { useEffect, useRef } from "react";

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
  const sparkqlRef = useRef();

  useEffect(() => {
    const yasgui = new Yasgui(sparkqlRef.current);
  }, [sparkqlRef]);

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
        <div ref={sparkqlRef}></div>
      </div>
    </>
  );
}
