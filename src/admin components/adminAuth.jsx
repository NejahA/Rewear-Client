import axios from "axios";
axios.defaults.withCredentials = true; // Allow cookies to be sent
const API_URL = "http://localhost:10000"; // Update with your backend URL
import {jwtDecode} from "jwt-decode" 
const authProvider = {
    login: async ({ username, password }) => {
      const url = `${import.meta.env.VITE_GITHUB_URI}/api/login`;

        const response = await fetch(`${import.meta.env.VITE_GITHUB_URI}/api/login`, {
          method: "POST",
          body: JSON.stringify({ email: username, password }),
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Important! Sends cookies with the request
        });
        if (!response.ok) {
          throw new Error("Invalid credentials");
        }
        const json = await response.json();
        console.log("json ",json)
          const decodedToken = jwtDecode(json.token);
          localStorage.setItem('permissions', decodedToken.isAdmin);
          console.log("is admin =>",decodedToken.isAdmin, " in storage", localStorage.getItem('permissions')); 
        if (decodedToken.isAdmin==true){
          return Promise.resolve();
        }
        
        else {
          return Promise.reject("You are not an admin");
        }

        
        axios.post('http://localhost:10000/api/login', { email: username, password }, { withCredentials: true })
            .then(async res => {
              const decodedToken = await jwtDecode(res);
              await localStorage.setItem('permissions', decodedToken.isAdmin);
              console.log("is admin =>",decodedToken.isAdmin, " in storage", localStorage.getItem('permissions')); 
              if (decodedToken.isAdmin==true){

                return Promise.resolve();
              }
              
              else {
                return Promise.reject("You are not an admin");
              }
              // localStorage.setItem('token', token);
              
            })
            .catch( err => new Error(err.response.data)
            )
      },
    
      logout: async () => {
        await fetch(`${import.meta.env.VITE_GITHUB_URI}/api/logout`, {
          method: "POST",
          credentials: "include",
        });
        localStorage.clear();
        return Promise.resolve();

        axios.post('http://localhost:10000/api/logout', {  }, { withCredentials: true })
            .then(res => {
              return Promise.resolve();
            })
            .catch( err => new Error(err.response.data)
            )
      },
      checkError: async (error) => {
        
      },`${import.meta.env.VITE_GITHUB_URI}/api/users/logged`
      checkAuth: async () => {
        const response = await fetch(`${import.meta.env.VITE_GITHUB_URI}/api/users/logged`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Error");
        }
        const json = await response.json();
        if (json.isAdmin == true) {
          console.log("role",json.isAdmin)
          return Promise.resolve();
        } else {
          return Promise.reject("You do not have admin authorization");
        }

        axios.get('http://localhost:10000/api/users/logged', { withCredentials: true })
            .then(res => {
              return Promise.resolve();
            })
            .catch( err => new Error(err.response.data)
            )
      },
  

      getPermissions: () => {
        const role = localStorage.getItem('permissions');
        return role==true ? Promise.resolve(role) : Promise.reject();
    }
    
      // getIdentity: async () => {
      //   const response = await fetch("http://localhost:10000/api/users/logged", {
      //     method: "GET",
      //     credentials: "include",
      //   });
    
      //   if (!response.ok) return Promise.reject();
    
      //   const user = await response.json();
      //   return Promise.resolve();
      // },
    };
    


export default authProvider;