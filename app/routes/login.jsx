import { useState } from "react";
import { Form, Link, redirect, useActionData, useTransition } from "remix";

import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { authenticator } from "~/services/auth.server";
import { commitSession, getSession } from "~/services/session.server";

export default function Login() {
  const theme = useTheme();
  const transition = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const actionData = useActionData();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Grid
      style={{ height: "100vh", minHeight: "800px" }}
      container
      justifyContent="center"
      className="p-2"
    >
      <Grid item xs={12} container alignItems="center" justifyContent="center">
        <Form method="post" style={{ maxWidth: 444 }}>
          <Typography
            style={{ fontWeight: 800 }}
            className="mb-4 text-center"
            variant="h3"
          >
            Sign in
          </Typography>

          <FormControl
            className="mb-3"
            fullWidth
            sx={{ ...theme.typography.customInput }}
          >
            <InputLabel htmlFor="outlined-adornment-email-login">
              Email Address
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-email-login"
              type="email"
              name="email"
              label="Email Address"
              disabled={transition.state === "submitting"}
              error={!!actionData?.errors.email}
            />
            {actionData?.errors.email ? (
              <FormHelperText
                error
                id="standard-weight-helper-text-email-login"
              >
                {actionData.errors.email}
              </FormHelperText>
            ) : null}
          </FormControl>

          <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
            <InputLabel htmlFor="outlined-adornment-password-login">
              Password
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-password-login"
              type={showPassword ? "text" : "password"}
              name="password"
              disabled={transition.state === "submitting"}
              error={!!actionData?.errors.password}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    size="large"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
            {actionData?.errors.password ? (
              <FormHelperText
                error
                id="standard-weight-helper-text-email-login"
              >
                {actionData.errors.password}
              </FormHelperText>
            ) : null}
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Button
              disableElevation
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              disabled={transition.state === "submitting"}
            >
              Sign in
            </Button>
          </Box>

          <Box className="mt-4 text-center">
            <Link to="/register" style={{ textDecoration: "none" }}>
              <Typography variant="subtitle1">
                Don't have an account? Sign up.
              </Typography>
            </Link>
          </Box>
        </Form>
      </Grid>
      <Grid item>
        <Form method="post" action="/auth/google">
          <Button
            disableElevation
            fullWidth
            size="large"
            type="submit"
            variant="contained"
          >
            Login with google
          </Button>
        </Form>
      </Grid>
    </Grid>
  );
}

export let action = async ({ request }) => {
  const [errors, user] = await authenticator.authenticate(
    "user-pass",
    request,
    {
      failureRedirect: "/login",
    }
  );

  if (errors) {
    return { errors };
  }

  let session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, user);

  let headers = new Headers({ "Set-Cookie": await commitSession(session) });

  return redirect("/", { headers });
};

export let loader = async ({ request }) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
};
