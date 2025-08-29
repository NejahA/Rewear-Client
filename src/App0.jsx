import './App.css';
import { Link,Routes,Route } from 'react-router-dom';
import Home from "./Pages/Home"
import LogReg from './Pages/LogReg';
import ShowOne from "./Pages/ShowOne"
import Edit from './Pages/Edit'
import 'bootstrap/dist/css/bootstrap.min.css'
import "bootstrap-icons/font/bootstrap-icons.css";
import Create from './Pages/Create';
import Navbar from './Components/Navbar';
import { useState } from "react"
import ModalReg from './Components/RegModal/ModalReg';
import ModalLog from './Components/LogModal/ModalLog';
import {
  fetchUtils,
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
} from "react-admin";
import AdminDash from './Pages/AdminDash';
import simpleRestProvider  from 'ra-data-simple-rest';
  import { ItemList } from "./admin components/items";
  import itemEdit from "./admin components/itemEdit";
  import adminAuth from "./admin components/adminAuth"
import ShowUser from './Pages/ShowUser';
import UpdateUser from './Pages/UpdateUser'
// import Upload from './Pages/Upload';
function App() {
  
  const [sort, setSort]= useState(null)
  const [userNav,setUserNav]=useState(null)

  const [openModalLog, setOpenModalLog] = useState(false);
  const [openModalReg, setOpenModalReg] = useState(false);

  
  return (
    <div className="App">
      {/* <Admin authProvider={adminAuth} loginPage={<><Navbar setOpenModalReg={setOpenModalReg}  setOpenModalLog={setOpenModalLog} /><Home setOpenModalReg={setOpenModalReg} setOpenModalLog={setOpenModalLog} /></> }  dataProvider= {simpleRestProvider(''+import.meta.env.VITE_VERCEL_URI+'/api' )} >
    <Resource name="items" edit={itemEdit} list={ItemList} />
  </Admin>; */}
          <ModalLog open={openModalLog} setOpenModalReg={setOpenModalReg} setOpenModalLog={setOpenModalLog}  />
          <ModalReg open={openModalReg}  setOpenModalLog={setOpenModalLog} setOpenModalReg={setOpenModalReg}/>
        {/* <AdminDash  />   */}
      <Routes >
        
        <Route path='/admin/*' element={<AdminDash />  } />
        <Route path='/logreg' element={<LogReg />  } />
        <Route path='/items/new' element={<><Navbar userNav={userNav}  setSort={setSort} setOpenModalReg={setOpenModalReg}  setOpenModalLog={setOpenModalLog} /><Create /></> } />
        <Route path='/items/edit/:id' element={<><Navbar  userNav={userNav}setSort={setSort} setOpenModalReg={setOpenModalReg} setOpenModalLog={setOpenModalLog}  /><Edit /></> } />
        <Route path='/items/:id' element={<><Navbar userNav={userNav} setSort={setSort} setOpenModalReg={setOpenModalReg}  setOpenModalLog={setOpenModalLog} /><ShowOne /></> } />
        <Route path='/user/:id' element={<><Navbar  userNav={userNav}setSort={setSort} setOpenModalReg={setOpenModalReg}  setOpenModalLog={setOpenModalLog} /><ShowUser /></> } />
        <Route path='/edituser' element={<><Navbar  userNav={userNav}setSort={setSort} setOpenModalReg={setOpenModalReg}  setOpenModalLog={setOpenModalLog} /><UpdateUser /></> } />
        {/* <Route path='/' element={<UpdateUser />  } /> */}

        <Route path='/' element={<>
        <Navbar userNav={userNav} setUserNav={setUserNav} setOpenModalReg={setOpenModalReg} setSort={setSort} setOpenModalLog={setOpenModalLog} />
        <Home  setUserNav={setUserNav} sort={sort} setOpenModalReg={setOpenModalReg} setOpenModalLog={setOpenModalLog} /></> } />
        {/* <Route path='/thing/:id' element={<ShowOne />} /> */}
        {/* <Route path='/thing/edit/:id' element={<Edit />} /> */}
      </Routes>
    </div>
  );
}

export default App;
