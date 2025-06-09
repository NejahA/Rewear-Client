import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import Cookies from 'universal-cookie';

const Login = (props) => {
    
    const navigate = useNavigate();
    const [user, setUser] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({ email: '', password: '' })
    const login = async (e) => {
        e.preventDefault()
        
            // const response = await axios.post('http://localhost:10000/api/login', user, { withCredentials: true })
              await axios.post('http://localhost:10000/api/login', user, { withCredentials: true })
              .then(res=>{
                // sessionStorage.setItem("token", res.data.token);
                console.log("token from login" ,res.data);
                  console.log('SERVER RESPONSE:', res.data);
                //   localStorage.setItem('token', res.data)  ;
                  navigate('/')
                }
                )
        // } catch (error) {
                .catch(error => 

                    {console.log("Error:", error.response.data);
                    let tempErrors = {}
                    for (let key of Object.keys(error.response.data)) {
                        console.log(key, '------', error.response.data[key].message);
                        tempErrors[key] = error.response.data[key].message
                    }
                    setErrors({ ...tempErrors })}
                )
        
    }
    return (
        <div className='card shadow p-2'>
            <div className="card-head text-center">
                <h2 className=''>Login</h2>
            </div>
            <div className="card-body">
                <form onSubmit={login}>
                    <div className="row align-items-center mb-3">
                        <label htmlFor="" className="col-2">Email</label>
                        <input type="text" className="form-control col"
                            onChange={e => setUser({ ...user, email: e.target.value })}
                            value={user.email} />
                        <span className="text-danger">{errors.email}</span>

                    </div>
                    <div className="row align-items-center mb-3">
                        <label htmlFor="" className="col-2">Password</label>
                        <input type="text" className="form-control col"
                            onChange={e => setUser({ ...user, password: e.target.value })}
                            value={user.password} />
                        <span className="text-danger">{errors.password}</span>
                    </div>
                    <div className="text-end">
                        <button className="btn btn-dark w-50">Login</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login