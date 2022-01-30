import { useSearchParams, useLocation, Link, Form } from "remix";
import { useEffect, useState } from "react";

import styled from "@emotion/styled";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  alpha,
  AppBar,
  createTheme,
  IconButton,
  InputBase,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

const darkTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#212121",
    },
  },
});

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  console.log(user);
  return null;
};

export default function Header({ user }) {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    setSearchParams(q ? `?q=${q}` : "");
  }, [q]);

  useEffect(() => {
    setSearchParams();
  }, [pathname]);

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="static">
        <div className="container">
          <Toolbar
            variant="regular"
            className="d-flex px-0"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Typography variant="h6" color="inherit" component="div">
              Welcome {user?.name}
            </Typography>
            <span className="d-flex align-items-center">
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>
              <Link
                to="/"
                className={`link-item ${pathname === "/" && "active"}`}
              >
                <Typography
                  className="mx-3"
                  variant="subtitle1"
                  color="inherit"
                  component="div"
                >
                  Vulnerabilities
                </Typography>
              </Link>
              <Link
                to="/fixes"
                className={`link-item ${pathname === "/fixes" && "active"}`}
              >
                <Typography variant="subtitle1" color="inherit" component="div">
                  Fixes
                </Typography>
              </Link>
              <Form method="post">
                <IconButton
                  className="mx-3"
                  style={{ marginRight: "0 !important" }}
                  color="info"
                  size="small"
                  type="submit"
                >
                  <LogoutIcon />
                </IconButton>
              </Form>
            </span>
          </Toolbar>
        </div>
      </AppBar>
    </ThemeProvider>
  );
}
