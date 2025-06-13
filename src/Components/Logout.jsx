import React, { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Link} from 'react-router-dom';
import Button from '@mui/material/Button';
import { createTheme, alpha, getContrastRatio } from '@mui/material/styles';
import { ThemeProvider } from 'react-admin';
import LogoutIcon from '@mui/icons-material/Logout';


const violetBase = '#7745B9';
const violetMain = alpha(violetBase, 0.7);

const theme = createTheme({
  palette: {
    violet: {
      main: violetMain,
      light: alpha(violetBase, 0.5),
      dark: alpha(violetBase, 0.9),
      contrastText: getContrastRatio(violetMain, '#fff') > 4.5 ? '#fff' : '#111',
    },
  },
});
const Logout = ({setLogged}) => {
    const navigate = useNavigate();
    // const token = localStorage.getItem('token')
    const logout =  () => {

      // async () =>{
        //     try {
          //         await axios.post(''+import.meta.env.VITE_GITHUB_URI+'/api/logout',{}, {withCredentials:true})
          //         localStorage.removeItem('token')
          //         navigate('/')
          //     } catch (error) {
            //         console.log('Error', error)
            //     }
            // }
            axios.post(''+import.meta.env.VITE_GITHUB_URI+'/api/logout', {} ,
            {withCredentials:true}
            )
            .then(res => {
              console.log("user loggedout")
              // localStorage.setItem('token',null)
              setLogged(false)
                // localStorage.removeItem('token')
              
              // localStorage.setItem("token", false);
              console.log("logout 200")
              navigate('/')
            }
            )
            .catch(err => console.log("error : ",err))
          }
          useEffect(() => {
            
          }, [])
  return (
    // <button className='btn btn-danger' onClick={logout}>Logout</button>
    // <Link className='nav-link text-danger mt-1' ><i class="bi bi-box-arrow-left"></i> Logout</Link>
    <ThemeProvider theme={theme}>

  <Button variant="contained" color="violet" startIcon={<LogoutIcon />} onClick={logout}>Logout</Button>

    </ThemeProvider>
  )
}

export default Logout