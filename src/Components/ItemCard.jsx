import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
// import Cookies from 'universal-cookies';

const ItemCard = ({ item, setOpenModalLog, setOpenModalReg, userId, fName, lName, profilePic }) => {
    // const cookies = new Cookies()
    const navigate = useNavigate()

    return (
        <div className="card h-100 shadow-sm">
            {/* Image Container with Aspect Ratio */}
            <div className="position-relative overflow-hidden" style={{ paddingTop: '75%' }}>
                <img 
                    src={item && item.itemPics[0] && item.itemPics[0].url ? item.itemPics[0].url : item.itemPics[0]} 
                    className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" 
                    alt="itemPic"
                    loading="lazy"
                />
            </div>
            
            {/* Card Body */}
            <div className="card-body d-flex flex-column p-3">
                {/* Title */}
                <h6 className="card-title text-truncate mb-2" title={item.title}>
                    <strong>{item.title}</strong>
                </h6>
                
                {/* Price - Prominent */}
                <h5 className="statuscl-1 fw-bold mb-3">{item.price} DT</h5>
                
                {/* Details Grid */}
                <div className="row g-2 mb-3 flex-grow-1">
                    <div className="col-6">
                        <small className="text-muted">Category:</small>
                        <div className="fw-semibold small text-truncate" title={item.category}>
                            {item.category}
                        </div>
                    </div>
                    <div className="col-6">
                        <small className="text-muted">Size:</small>
                        <div className="fw-semibold small">
                            {item.size}
                        </div>
                    </div>
                    <div className="col-6">
                        <small className="text-muted">Gender:</small>
                        <div className="fw-semibold small text-truncate" title={item.gender}>
                            {item.gender}
                        </div>
                    </div>
                </div>
                
                {/* Button - Always at bottom */}
                <button 
                    onClick={(e) => { 
                        if (fName || lName || userId || profilePic?.url) {
                            navigate(`/items/${item._id}`)
                        } else {
                            setOpenModalLog(true);
                            setOpenModalReg(false);
                        }
                    }} 
                    className="btn btn-primary w-100 mt-auto"
                    style={{ backgroundColor: '#5C2D9A', borderColor: '#5C2D9A' }}
                >
                    Show Product
                </button>
            </div>
        </div>
    )
}

export default ItemCard