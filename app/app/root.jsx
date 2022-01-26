import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useSearchParams,
} from "remix";
import {
  alpha,
  AppBar,
  createTheme,
  InputBase,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";
import SearchIcon from "@mui/icons-material/Search";

import styles from "~/styles/global.css";
import { useState } from "react";
import { useEffect } from "react";

export function meta() {
  return { title: "ASC" };
}

export function links() {
  return [
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
    },
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
}

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

export default function App() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSearchParams(`?q=${q || ""}`);
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body vocab="http://schema.org/">
        <ThemeProvider theme={darkTheme}>
          <AppBar position="static">
            <div className="container">
              <Toolbar
                variant="regular"
                className="d-flex px-0"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <Typography variant="h6" color="inherit" component="div">
                  Application Security Control
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
                    <Typography
                      variant="subtitle1"
                      color="inherit"
                      component="div"
                    >
                      Fixes
                    </Typography>
                  </Link>
                </span>
              </Toolbar>
            </div>
          </AppBar>
        </ThemeProvider>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
