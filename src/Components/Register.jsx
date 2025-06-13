import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = (props) => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: '', email: '', password: '', confirmPW: '' })
    const [errors, setErrors] = useState({ username: '', email: '', password: '', confirmPW: '' })
    const register = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(''+import.meta.env.VITE_GITHUB_URI+'/api/register', user,{withCredentials:true})
            console.log('SERVER RESPONSE:', response.data)
            // localStorage.setItem('token',response.data.token)
            navigate('/')
        } catch (error) {
            console.log("Error:", error.response.data);
            let tempErrors = {}
            for (let key of Object.keys(error.response.data)) {
                console.log(key, '------', error.response.data[key].message);
                tempErrors[key] = error.response.data[key].message
            }
            setErrors({ ...tempErrors })
        }
    }
    return (
        <div className='card shadow p-2'>
            <div className="card-head text-center">
                <h2 className=''>Register</h2>
            </div>
            <div className="card-body">
                <form onSubmit={register}>
                    <div className="row align-items-center mb-3">
                        <label htmlFor="" className="col-2">Username</label>
                        <input type="text" className="form-control col"
                            onChange={e => setUser({ ...user, username: e.target.value })}
                            value={user.username}
                        />
                        <span className="text-danger">{errors.username}</span>
                    </div>
                    <div className="row align-items-center mb-3">
                        <label htmlFor="" className="col-2">Email</label>
                        <input type="email" className="form-control col"
                            onChange={e => setUser({ ...user, email: e.target.value })}
                            value={user.email}
                        />
                        <span className="text-danger">{errors.email}</span>

                    </div>
                    <div className="row align-items-center mb-3">
                        <label htmlFor="" className="col-2">Password</label>
                        <input type="password" className="form-control col"
                            onChange={e => setUser({ ...user, password: e.target.value })}
                            value={user.password} />
                        <span className="text-danger">{errors.password}</span>

                    </div>
                    <div className="row align-items-center mb-3">
                        <label htmlFor="" className="col-2">Confirm PW</label>
                        <input type="password" className="form-control col"
                            onChange={e => setUser({ ...user, confirmPW: e.target.value })}
                            value={user.confirmPW} />
                        <span className="text-danger">{errors.confirmPW}</span>

                    </div>
                    <div className="text-end">
                        <button className="btn btn-primary w-50">Register</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register