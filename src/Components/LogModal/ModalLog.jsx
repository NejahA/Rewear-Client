import React from "react";
import "./ModalLog.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ModalLog = ({ open ,setOpenModalLog, setOpenModalReg,setLogged}) => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: "", password: "" });
    if (!open) return null;
    const login = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(''+import.meta.env.VITE_VERCEL_URI+'/api/login', user, 
            { withCredentials: true }
            )
            console.log('SERVER RESPONSE:', response.data)
            setLogged(true)
            console.log('TOKEN RESPONSE:', response.data.token)
            // localStorage.setItem('token', response.data.token)

            setOpenModalLog(false)
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
    };
    return (
        <div className="overlay">
            
            <div className="modalContainer p-1">

            <form onSubmit={login} className="d-flex justify-content-center" >
                <div className="d-flex flex-column gap-3 p-5 align-items-center">
                    <div className="">
                        <input
                            className="form-control"
                            placeholder="Email"
                            type="email"
                            onChange={e => setUser({ ...user, email: e.target.value })}
                            value={user.email} 
                            />
                        <span className="text-danger">{errors.email}</span>
                    </div>
                    <div className="">
                        <input
                            className="form-control"
                            placeholder="Password"
                            type="password"
                            onChange={e => setUser({ ...user, password: e.target.value })}
                            value={user.password}
                            />
                        <span className="text-danger">{errors.password}</span>
                    </div>
                    <div className="d-flex gap-4">
                    <button
                        className="btn text-light w-100 mt-3"
                        style={{ backgroundColor: "#5C2D9A" }}
                        >
                        Log In
                    </button>
        <button className="btn border   w-100 mt-3" onClick={(e)=>{
            setOpenModalLog(false)
            setOpenModalReg(true)}} 
            >Register</button>
            </div>
                    {/* <a onClick={(e)=>setOpenModalReg(true)} >Register</a> */}
                </div>
            </form>
            <i className="bi bi-arrow-left-circle-fill VioletCred mt-2 fw-bold " style={{ cursor: "pointer" }} onClick={(e) => setOpenModalLog(false)}></i>
        </div>
            </div>
    );
};

export default ModalLog;
