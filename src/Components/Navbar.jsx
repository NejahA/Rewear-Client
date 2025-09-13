import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logout from "./Logout";
import axios from "axios";
import Button from "@mui/material/Button";
import Cookies from "universal-cookie";

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

const Navbar = ({
  logged,
  setLogged,
  setOpenModalReg,
  setOpenModalLog,
  openLog,
  openReg,
  setSort,
  sort,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [userNav, setUserNav] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const cookies = new Cookies();
  const isDesktop = useIsDesktop(); // detect mode

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_VERCEL_URI + "/api/users/logged", {
        withCredentials: true,
      })
      .then((res) => setUserNav(res.data))
      .catch(() => setUserNav(null));
  }, [JSON.stringify(cookies.get("userToken")), location.pathname, logged]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          {/* Logo and Mobile Toggle */}
          <div className="d-flex align-items-center w-100">
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
{/* Filter Button - Only on Homepage */}
            {location.pathname === "/" && isDesktop && (
              <div
                className={`d-flex justify-content-center my-2 ${
                  isDesktop ? "me-3" : ""
                }`}
              >
                <button
                  className="btn filter-btn d-flex align-items-center"
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
                </button>
              </div>
            )}
            {/* Search Bar - Moved to the middle on mobile */}
            <div
              className={`search-bar my-2 my-lg-0 ${
                isDesktop ? "flex-grow-1 mx-4" : "flex-grow-1 mx-3"
              }`}
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
                  />
                  <button className="btn bg-white border" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>
            </div>

            {!isDesktop && (
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

          {/* Collapsible / Desktop Menu */}
          <div
            className={`${
              isDesktop ? "d-flex align-items-center ms-auto" : `collapse navbar-collapse ${isMenuOpen ? "show" : ""}`
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
              {userNav && userNav.fName ? (
                <>
                  <Link
                    className="nav-link d-flex align-items-center"
                    to={"/user/" + userNav._id}
                  >
                    <img
                      className="user-avatar"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                      src={userNav?.profilePic?.url}
                      alt="Profile"
                    />
                    <span className="ms-2 d-none d-lg-inline">
                      {userNav.fName}
                    </span>
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
                    <span className="ms-2 d-none d-lg-inline">Sell Item</span>
                  </Link>

                  <Logout setLogged={setLogged} />
                </>
              ) : (
                <>
                  <Button
                    color="secondary"
                    fullWidth={!isDesktop}
                    onClick={() => {
                      setOpenModalReg(!openReg);
                      setOpenModalLog(false);
                    }}
                    className={!isDesktop ? "flex-fill" : ""}
                  >
                    <i className="bi bi-box-arrow-in-right pe-2"></i>
                    Sign Up
                  </Button>
                  <Button
                    variant="contained"
                    color="violet"
                    fullWidth={!isDesktop}
                    onClick={() => {
                      setOpenModalLog(!openLog);
                      setOpenModalReg(false);
                    }}
                    className={!isDesktop ? "flex-fill" : ""}
                  >
                    <i className="bi bi-person-fill pe-2"></i>
                    Log in
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;