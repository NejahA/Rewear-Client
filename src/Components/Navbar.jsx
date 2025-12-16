import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logout from "./Logout";
import axios from "axios";
import Button from "@mui/material/Button";
import { IconButton } from "@mui/material";
// import Cookies from "universal-cookies";
import { MdAddShoppingCart } from "react-icons/md";
import { useAuth } from "../context/AuthContex";

// A hook to detect screen width
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop;
};

// Helper function to detect if device is Android
const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

const Navbar = ({
  setOpenModalReg,
  setOpenModalLog,
  openLog,
  openReg,
  setSort,
  sort,
}) => {
  const { isLoggedIn, user } = useAuth();

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [userNav, setUserNav] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const isAndroidDevice = isAndroid(); // Detect Android once

  // Check if there's an active search query
  const hasActiveSearch = search.trim().length > 0;
  
  useEffect(() => {}, [isLoggedIn]);
  
  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const clearSearch = () => {
    setSearch("");
    setSort({ category: "", gender: "", search: "" });
  };

  const mobileSearchStyle = isSearchFocused
    ? { width: "100%", transition: "width 0.3s ease-in-out" }
    : { width: "auto", transition: "width 0.3s ease-in-out" };

  const [isAppInstalled, setIsAppInstalled] = useState(null);
  
  useEffect(() => {
    // Only check for app on mobile Android devices
    if (isDesktop ) return;

    let detected = false;
    const startTime = Date.now();

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = "reweard://home";
    document.body.appendChild(iframe);

    const cleanup = () => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };

    const onBlur = () => {
      detected = true;
      setIsAppInstalled(true);
      cleanup();
    };

    window.addEventListener("blur", onBlur);

    const timeout = setTimeout(() => {
      window.removeEventListener("blur", onBlur);
      if (!detected && Date.now() - startTime < 3000) {
        setIsAppInstalled(false);
      }
      cleanup();
    }, 2000);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("blur", onBlur);
      cleanup();
    };
  }, [isDesktop, isAndroidDevice]);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          {/* Logo and Mobile Toggle */}
          <div className="d-flex align-items-center w-100">
            {/* Logo - Hidden on mobile when searching */}
            {(isDesktop || !isSearchFocused) && (
              <div
                onClick={() => {
                  setSort({ home: sort.home ? false : true });
                  navigate("/");
                }}
                className="d-flex align-items-center"
              >
                <img
                  className="rewearlogo me-2"
                  src="/logo/logo.png"
                  alt="logoPic"
                  style={{ height: "40px", width: "auto", cursor: "pointer" }}
                />
              </div>
            )}
            {/* Back button when searching on mobile */}
            {!isDesktop && isSearchFocused && (
              <button
                className="btn btn-link p-0 me-2"
                onClick={clearSearch}
                style={{ color: "#8356C0", fontSize: "1.2rem" }}
              >
                <i className="bi bi-arrow-left"></i>
              </button>
            )}
            {/* Filter Button - Only on Homepage */}
            {location.pathname === "/" && isDesktop && (
              <div
                className={`d-flex justify-content-center my-2 ${
                  isDesktop ? "me-3" : ""
                }`}
              >
                <div
                  className="px-3 filter-btn d-flex align-items-center"
                  onClick={() => {
                    setSort({
                      ...sort,
                      nav: typeof sort.nav === "boolean" ? !sort.nav : true,
                    });
                  }}
                >
                  <i
                    className="bi bi-filter-circle-fill me-2"
                    style={{
                      color: sort?.nav ? "#8356C0" : "#C2C3C4",
                      fontSize: "1.5rem",
                    }}
                  ></i>
                  <span>Filters</span>
                </div>
              </div>
            )}

            {/* Search Bar - Expanded on mobile when searching */}
            <div
              className={`search-bar my-2 my-lg-0 ${
                isDesktop ? "flex-grow-1 mx-4" : "flex-grow-1 mx-3"
              }`}
              style={!isDesktop ? mobileSearchStyle : {}}
            >
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate("/");
                  setSort({ category: "", gender: "", search: search });
                }}
              >
                <div className="input-group">
                  <input
                    type="search"
                    placeholder="Search products..."
                    className="form-control"
                    onChange={(e) => {
                      navigate("/");
                      setSearch(e.target.value);
                    }}
                    value={search}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                  <button className="btn bg-white border" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>
            </div>

            {/* Mobile menu toggle - Hidden when searching */}
            {!isDesktop && !isSearchFocused && (
              <button
                className="navbar-toggler"
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle navigation"
                style={{ marginLeft: "auto" }}
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            )}
          </div>

          {/* Collapsible / Desktop Menu - Hidden on mobile when searching */}
          {(isDesktop || (!hasActiveSearch && !isSearchFocused)) && (
            <div
              className={`${
                isDesktop
                  ? "d-flex align-items-center ms-auto"
                  : `collapse navbar-collapse ${isMenuOpen ? "show" : ""}`
              }`}
              id="navbarContent"
            >
              {/* User Section */}
              <div
                className={`d-flex ${
                  isDesktop
                    ? "flex-row gap-4 align-items-center"
                    : "flex-row justify-content-around gap-2 mt-3 flex-wrap"
                }`}
              >
                {isLoggedIn && user && user.fName ? (
                  <>
                    <Link
                      className="nav-link d-flex align-items-center"
                      to={"/user/" + user._id}
                    >
                      <img
                        className="user-avatar"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                        src={user?.profilePic?.url}
                        alt="Profile"
                      />
                    </Link>

                    <Link
                      className="nav-link d-flex align-items-center"
                      to={"/items/new"}
                    >
                      <img
                        className="icon"
                        src="/logo/shopping.png"
                        alt="Sell item"
                        style={{ width: "24px", height: "24px" }}
                      />
                    </Link>
                    <Link
                      className="nav-link d-flex align-items-center"
                      to={"/cart"}
                    >
                      <MdAddShoppingCart fontSize="large" color="#8356C0" />
                    </Link>
                    <Logout />
                  </>
                ) : (
                  <div className="d-flex  gap-4">
                    <Button
                      variant="outlined"
                      sx={{
                        color: "#7745B9",
                        borderColor: "#7745B9",
                        "&:hover": {
                          borderColor: "#7745B9",
                          backgroundColor: "rgba(138, 43, 226, 0.04)",
                        },
                        whiteSpace: "nowrap",
                        textTransform: "none",
                        fontWeight: 500,
                      }}
                      fullWidth={!isDesktop}
                      onClick={() => {
                        setOpenModalReg(!openReg);
                        setOpenModalLog(false);
                      }}
                      className={`d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3 ${
                        !isDesktop ? "flex-fill" : ""
                      }`}
                    >
                      <i className="bi bi-box-arrow-in-right"></i>
                      Sign Up
                    </Button>

                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#7745B9",
                        "&:hover": { backgroundColor: "#7745B9" },
                        whiteSpace: "nowrap",
                        textTransform: "none",
                        fontWeight: 500,
                      }}
                      fullWidth={!isDesktop}
                      onClick={() => {
                        setOpenModalLog(!openLog);
                        setOpenModalReg(false);
                      }}
                      className={`d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3 ${
                        !isDesktop ? "flex-fill" : ""
                      }`}
                    >
                      <i className="bi bi-person-fill"></i>
                      Log in
                    </Button>
                  </div>
                )}
                {/* APK Button - ONLY on mobile Android devices */}
                {!isDesktop && isAndroidDevice && (
                  <div className="mt-4 w-100 d-flex justify-content-center">
                    <button
                      type="button"
                      className="btn d-flex align-items-center justify-content-center gap-2 py-2 px-4 rounded-4 text-decoration-none shadow-sm"
                      style={{
                        backgroundColor: "transparent",
                        border: "2px solid #8356C0",
                        color: "#8356C0",
                        fontWeight: "600",
                        fontSize: "0.95rem",
                        minWidth: "200px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (isAppInstalled === true) {
                          window.location.href = "reweard://open";
                        } else {
                          window.location.href = "https://github.com/NejahA/Rewear-Client/releases/download/v1.0.0/Reweard.apk";
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#8356C0";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#8356C0";
                      }}
                      disabled={isAppInstalled === null}
                    >
                      <i
                        className="bi bi-android2"
                        style={{ fontSize: "1.6rem", color: "inherit" }}
                      ></i>
                      <span>
                        {isAppInstalled === null
                          ? "Checking..."
                          : isAppInstalled
                          ? "Open App"
                          : "Download App"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;