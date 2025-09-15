import "./App.css";
import {
  Link,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./Pages/Home";
import LogReg from "./Pages/LogReg";
import ShowOne from "./Pages/ShowOne";
import Edit from "./Pages/Edit";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Create from "./Pages/Create";
import Navbar from "./Components/Navbar";
import { useEffect, useState } from "react";
import ModalReg from "./Components/RegModal/ModalReg";
import ModalLog from "./Components/LogModal/ModalLog";
import {
  fetchUtils,
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
} from "react-admin";
import AdminDash from "./Pages/AdminDash";
import simpleRestProvider from "ra-data-simple-rest";
import { ItemList } from "./admin components/items";
import itemEdit from "./admin components/itemEdit";
import adminAuth from "./admin components/adminAuth";
import ShowUser from "./Pages/ShowUser";
import UpdateUser from "./Pages/UpdateUser";
import Footer from "./Components/Footer";

// import Upload from './Pages/Upload';
import {
  alpha,
  createTheme,
  getContrastRatio,
  ThemeProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./Components/theme";
import ResetPassword from "./Pages/ResetPassword";
import VerifyEmail from "./Components/VerifyEmail/VerifyEmail";
const violetBase = "#7745B9";
const violetMain = alpha(violetBase, 0.7);

const customTheme = createTheme({
  palette: {
    violet: {
      main: violetMain,
      light: alpha(violetBase, 0.5),
      dark: alpha(violetBase, 0.9),
      contrastText:
        getContrastRatio(violetMain, "#fff") > 4.5 ? "#fff" : "#111",
    },
  },
});
function App() {
  const location = useLocation();
  const hideNavbarOnRoutes = ["/admin/"];
  const [sort, setSort] = useState({
    category: "",
    gender: "",
    search: "",
    size: "",
  });
  const [userNav, setUserNav] = useState(null);
  const [logged, setLogged] = useState(null);
  console.log("location path", location.pathname);
  const [openModalLog, setOpenModalLog] = useState(false);
  const [openModalReg, setOpenModalReg] = useState(false);
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ height: "100vh" }}>
        {/* <Admin authProvider={adminAuth} loginPage={<><Navbar setOpenModalReg={setOpenModalReg}  setOpenModalLog={setOpenModalLog} /><Home setOpenModalReg={setOpenModalReg} setOpenModalLog={setOpenModalLog} /></> }  dataProvider= {simpleRestProvider(''+import.meta.env.VITE_VERCEL_URI+'/api' )} >
    <Resource name="items" edit={itemEdit} list={ItemList} />
  </Admin>; */}
        <ModalLog
          open={openModalLog}
          logged={logged}
          setLogged={setLogged} setOpenModalReg={setOpenModalReg}
          setOpenModalLog={setOpenModalLog}
        />
        <ModalReg
          open={openModalReg}
          logged={logged}
          setLogged={setLogged} setOpenModalLog={setOpenModalLog}
          setOpenModalReg={setOpenModalReg}
        />
        {/* <AdminDash  />   */}

        {/* <Navbar /> */}
        {/* {hideNavbarOnRoutes.filter(element => element.includes("/admin/")) && <Navbar />} */}
        {!location.pathname.includes("/admin/") && (
          <Navbar
            logged={logged}
            setLogged={setLogged}
            sort={sort}
            setSort={setSort}
            userNav={userNav}
            setUserNav={setUserNav}
            setOpenModalReg={setOpenModalReg}
            setOpenModalLog={setOpenModalLog}
          />
        )}

        <Routes>
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          <Route path="/logreg" element={<LogReg />} />
          <Route path="/items/new" element={<Create logged={logged}
            setLogged={setLogged} />} />
          <Route
            path="/items/edit/:id"
            element={
              <>
                <Edit logged={logged}
                  setLogged={setLogged} />
              </>
            }
          />
          <Route
            path="/items/:id"
            element={
              <>
                <ShowOne logged={logged}
                  setLogged={setLogged} />
              </>
            }
          />
          <Route
            path="/user/:id"
            element={
              <>
                <ShowUser logged={logged}
                  setLogged={setLogged} />
              </>
            }
          />
          <Route
            path="/edituser"
            element={
              <>
                <UpdateUser logged={logged}
                  setLogged={setLogged} />
              </>
            }
          />
          {/* <Route path='/' element={<UpdateUser />  } /> */}
          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
  />
          <Route
            path="/"
            element={
              <>
                <Home
                  logged={logged}
                  setLogged={setLogged}
                  setSort={setSort}
                  sort={sort}
                  setOpenModalReg={setOpenModalReg}
                  setOpenModalLog={setOpenModalLog}
                />
              </>
            }
          />
          {/* <Route path='/thing/:id' element={<ShowOne />} /> */}
          {/* <Route path='/thing/edit/:id' element={<Edit />} /> */}
        </Routes>
        <Routes>
          <Route path="/admin/*" element={<AdminDash logged={logged}
            setLogged={setLogged} />} />
        </Routes>
        {/* <Footer
          userNav={userNav}
          setUserNav={setUserNav}
          setOpenModalReg={setOpenModalReg}
          setSort={setSort}
          setOpenModalLog={setOpenModalLog}
        /> */}
      </div>
    </ThemeProvider>
  );
}

export default App;
