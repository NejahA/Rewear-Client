import React from 'react'
import {
  defaultTheme,
    fetchUtils,
    Admin,
    Resource,
    ListGuesser,
    EditGuesser,
    ShowGuesser,
  } from "react-admin";
  // import { dataProvider } from './dataProvider';
  import simpleRestProvider  from 'ra-data-simple-rest';
  import { ItemList } from "../admin components/items";
  import itemEdit from "../admin components/itemEdit";
  import {createBrowserHistory } from 'history';
import LoginPage from '../admin components/LoginPage';
import {UserList} from '../admin components/users'
import authProvider from '../admin components/adminAuth';
import dataProvider from '../admin components/dataProvider';
import theme from '../Components/theme';
import deepPurple from '@mui/material/colors/deepPurple';
import pink from '@mui/material/colors/pink';
import red from '@mui/material/colors/red';
import purple from '@mui/material/colors/purple';
import UserEdit from '../admin components/userEdit';
//   const httpClient = (url, options = {}) => {
//     if (!options.headers) {
//         options.headers = new Headers({ Accept: 'application/json' });
//     }
//     const token = localStorage.getItem('token');
//     options.headers.set('Authorization', `Bearer ${token}`);
//     return fetchUtils.fetchJson(url, options);
// }
// const dataProvider = simpleRestProvider(""+import.meta.env.VITE_VERCEL_URL+'/api' );
const adminTheme = {
  ...defaultTheme,
  palette: {
        // mode: "dark",
        // primary: deepPurple,
        primary: {main: "#5C2D9Ath"},
        // secondary: purple,
        error: red,
  },
  

};
const AdminDash = () => {
  return (
    <div>
        <Admin basename="/admin" loginPage={LoginPage} theme={theme} authProvider={authProvider}  
        // dataProvider= {simpleRestProvider(""+import.meta.env.VITE_VERCEL_URL+'/api' )} >
        dataProvider= {dataProvider} >
    <Resource name="items" edit={itemEdit} list={ItemList}    />
    <Resource name="users" edit={UserEdit} list={UserList} />
  </Admin>;
        </div>
  )
}

export default AdminDash