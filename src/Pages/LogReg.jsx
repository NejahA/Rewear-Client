import React from 'react'
import Register from '../Components/Register'
import Login from '../Components/Login'

const LogReg = (props) => {
    return (
        <div>
            <div className="text-center my-5">
                <h1 className='text-secondary display-2 fst-italic'>Rewear log/reg</h1>
            </div>
            <div className="row container">
                <div className="col-6">
                    <Register />
                </div>
                <div className="col-6">
                    <Login />
                </div>
            </div>
        </div>
    )
}

export default LogReg