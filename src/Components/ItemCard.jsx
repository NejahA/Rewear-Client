import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Cookies from 'universal-cookie';

const ItemCard = ({ item,setOpenModalLog ,setOpenModalReg, userId,fName,lName,profilePic}) => {
    const cookies = new Cookies()

    // const token = localStorage.getItem('token')
    const navigate = useNavigate()
    return (
        <>
            {
            <div className="card p-2 m-3 " style={{height:'650px'}}>
                <img  src={item && item.itemPics[0] && item.itemPics[0].url ? item.itemPics[0].url: item.itemPics[0]} className="card-img-top" alt="itemPic" style={{width:'20rem',height:'25rem !important'}}/>
                    <div className="card-body">
                        <p className="card-text"><span className='text-black'>Title :</span>  <strong className=''>{item.title}</strong></p>
                        <h5 className="card-text">{item.price} DT</h5>
                        <p className="card-text"><span className='text-black'>Category :</span> <strong>{item.category}</strong></p>
                        <p className="card-text"><span className='text-black'>Size :</span> <strong>{item.size }</strong></p>
                        <p className="card-text"><span className='text-black'>Gender :</span> <strong>{item.gender}</strong></p>
                        {/* <p className="card-text"><span className='text-black'>Brand :</span> <strong>{item.brand}</strong></p> */}
                        <button onClick={(e)=> { 
                            if (
                                fName || lName || userId || profilePic?.url
                            )
                            {navigate(`/items/${item._id}`)}
                            else
                                {setOpenModalLog(true);setOpenModalReg(false)}
                            
                            }} className="btn d-block mx-auto product-btn" style={{backgroundColor:'#5C2D9A',color:'white'}}>
                                Show Product</button>
                    </div>
            </div>}
        </>
    )
}
export default ItemCard