import React from 'react'
import {
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


//   const httpClient = (url, options = {}) => {
//     if (!options.headers) {
//         options.headers = new Headers({ Accept: 'application/json' });
//     }
//     const token = localStorage.getItem('token');
//     options.headers.set('Authorization', `Bearer ${token}`);
//     return fetchUtils.fetchJson(url, options);
// }
// const dataProvider = simpleRestProvider(''+import.meta.env.VITE_LOCAL_URL+'/api' );

const AdminDash = () => {
  return (
    <div>
        <Admin basename="/admin" loginPage={LoginPage}  authProvider={authProvider}  
        // dataProvider= {simpleRestProvider(''+import.meta.env.VITE_LOCAL_URL+'/api' )} >
        dataProvider= {dataProvider} >
    <Resource name="items" edit={itemEdit} list={ItemList} />
    <Resource name="users" list={UserList} />
  </Admin>;
        </div>
  )
}

export default AdminDash