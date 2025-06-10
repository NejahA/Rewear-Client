import React, { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from "react-router-dom";
import Logout from './Logout';
import axios from "axios";
const Footer =  (
    { setOpenModalReg, setOpenModalLog ,openLog , openReg, setSort}
) => {
    const navigate = useNavigate();
    
  
    return (
        <>
            <nav className="f  bg-body-tertiary " style={{height:"100px", paddingTop:"20px"}}>
                <div className="container d-flex w-50  "  style={{justifyContent:"space-around", }}  >
                    
                   <a href="https://github.com/NejahA" target="_blank">
                                   {/* <img
                                    style={{width:'40px',height:'40px'}}
                                     loading="lazy"
                                     alt=""
                                     src="/logo/Github.svg"
                                     /> */}
                                     <i className="bi-brands bi-github" style={{color:'#8356C0',fontSize:'40px'}}></i>
                                     </a> 
                                   <a href="https://www.linkedin.com/in/achref-nejah-254b12210/" target="_blank">
                                  
                                     <i className="bi-brands bi-linkedin" style={{color:'#8356C0',fontSize:'40px'}}></i>
                                     </a>
                                   <a href="mailto:achref.nejah@gmail.com" target="_blank">
                                   
                                   <i className="bi bi-envelope" style={{color:'#8356C0',fontSize:'40px'}}></i>
                                   </a>
                    
                   
                </div>
            </nav>
        </>
    )
}

export default Footer