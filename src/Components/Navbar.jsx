import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Logout from "./Logout";
import axios from "axios";
import Button from "@mui/material/Button";
import { useLocation } from "react-router-dom";
import Cookies from "universal-cookie";
 
import { createTheme, alpha, getContrastRatio } from "@mui/material/styles";
import { ThemeProvider } from "react-admin";
// import axios from '../axios'; // Adjust the import path as necessary
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
  const [search, setSearch] = useState(null);
  // const token = localStorage.getItem('token')
  // const [sort, setSort]= useState(null)
  // const [userNav,setUserNav]=useState({})
  // const [sort, setSort]= useState(null)
  const [userNav, setUserNav] = useState(null);
const location = useLocation();
  const cookies = new Cookies();

  // const [openModalLog, setOpenModalLog] = useState(false);
  // const [openModalReg, setOpenModalReg] = useState(false);
  useEffect(() => {
      console.log("theres token in navbar");
      console.log("cookies",cookies.get("userToken"));
      axios
        .get(""+import.meta.env.VITE_GITHUB_URI+"/api/users/logged", {
          withCredentials: true,
        })
        .then((res) => {
          console.log("res user ===>", res.data);
          setUserNav(res.data);

          console.log("navbar user  =>", res.data);
        })
        .catch((error) => {
          console.log(error);
          setUserNav(null);
        });
    // } else {
    //   console.log("no token in navbar");
    //   setUserNav({});
    // }
    // setSort( {category:"" ,gender: "", search: "" })
    // },[JSON.stringify(token)])
  }, [JSON.stringify(cookies.get("userToken")),
    location.pathname,logged]);
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary ">
        <div className="container-fluid ">
          <div className="container-fluid d-flex col-3 cursor" id="nav">
            <div
              onClick={() => {
                // setSort({category:"" ,gender: "", search: "", size:"" , maxP:0 , minP:0 });
                setSort({ home: sort.home ? false : true });
                navigate("/")
              }}
            >
              <img
                style={{ cursor: "pointer" }}
                className="rewearlogo ms-5 btn"
                src="/logo/logo.png"
                alt="logoPic"
              />
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNavAltMarkup"
                aria-controls="navbarNavAltMarkup"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>
            <div
              className="collapse navbar-collapse dflex justify-content-center"
              id="navbarNavAltMarkup"
            >
              { location.pathname === "/" &&
              <i
                className="nav-link bi-filter-circle-fill VioletCred"
                onClick={() => {
                  // navigate("/");
                  setSort({
                    ...sort,
                    nav: typeof sort.nav === "boolean" ? !sort.nav : true,
                  });
                  console.log("sort from navbar", sort && sort.nav);
                }}
                style={{
                  fontSize: "30px",
                  textDecoration: "none",
                  cursor: "pointer",
                  color: sort?.nav ? "#8356C0" : "#C2C3C4", // Violet if nav is true, black otherwise
                }}
                onMouseOver={(e) => {
                  e.target.style.color = !sort?.nav ? "#8356C0" : "#C2C3C4";
                  e.target.style.textDecoration = "underline";
                  e.target.style.fontWeight = "bold";
                }}
                onMouseOut={(e) => {
                  e.target.style.color = sort?.nav ? "#8356C0" : "#C2C3C4";
                  e.target.style.textDecoration = "none";
                  e.target.style.fontWeight = "normal";
                }}
              ></i>
              }
            </div>
          </div>

          <div className="search col-6">
            <form
              role="search "
              onSubmit={(e) => {
                e.preventDefault();
                navigate("/");
                setSort({ category: "", gender: "", search: search });
              }}
            >
              <div className="input-group">
                <input
                  type="search"
                  placeholder="Search your product"
                  className="form-control col-1"
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
          {userNav && userNav.fName ? (
            <>
              <div
                className="collapse navbar-collapse d-flex gap-4 justify-content-end col-3 pe-5"
                id="navbarNavAltMarkup"
              >
                <div className="d-flex gap-5  align-items-center ">
                  {/* <i class="bi bi-plus-circle-fill"></i> */}
                  <Link
                    className="nav-link "
                    to={userNav && "/user/" + userNav._id}
                    style={{ textDecoration: "none" }}
                    onMouseOver={(e) => {
                      e.target.style.textDecoration = "underline";
                      e.target.style.fontWeight = "bold";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.textDecoration = "none";
                      e.target.style.fontWeight = "normal";
                    }}
                  >
                    <div className="d-flex mt-2 gap-1 ">
                      {/* <i class="bi bi-person-circle"></i> */}
                      {/* <p className='fw-bold'>{userNav && userNav.fName}</p> */}
                      <img
                        className="logo"
                        style={{ borderRadius: "20%" }}
                        src={
                          userNav &&
                          userNav.profilePic &&
                          userNav.profilePic.url
                        }
                        alt="logoPic"
                      />
                    </div>
                  </Link>

                  <Link
                    className="nav-link "
                    to={"/items/new"}
                    style={{ textDecoration: "none" }}
                    onMouseOver={(e) => {
                      e.target.style.textDecoration = "underline";
                      e.target.style.fontWeight = "bold";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.textDecoration = "none";
                      e.target.style.fontWeight = "normal";
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <img
                        className="logo"
                        src="/logo/shopping.png"
                        alt="logoPic"
                      />
                    </div>
                    {/* Sell Article */}
                  </Link>

                  <Logout setLogged={setLogged} />
                </div>
              </div>
            </>
          ) : (
            //   <div className="collapse navbar-collapse " id="navbarNavAltMarkup">
            <div className="d-flex gap-4 justify-content-end col-3 pe-5">
              <div className="d-flex align-items-center gap-2 ">
                <Link
                  onClick={(e) => {
                    setOpenModalReg(!openReg);
                    setOpenModalLog(false);
                  }}
                >
                  <Button color="secondary">
                    <i className="bi bi-box-arrow-in-right pe-2"></i>
                    Sign Up
                  </Button>
                </Link>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Link
                  onClick={(e) => {
                    setOpenModalLog(!openLog);
                    setOpenModalReg(false);
                    console.log("openlog =>", openLog);
                  }}
                >
                  <Button variant="contained" color="violet">
                    <i className="bi bi-person-fill pe-2"></i>
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
          ) }
        </div>
      </nav>
    </>
  );
};
export default Navbar;
