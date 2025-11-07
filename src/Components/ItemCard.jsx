import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext'; // Import CartContext
import { useAuth } from '../context/AuthContex';

const ItemCard = ({ item, setOpenModalLog, setOpenModalReg, userId, fName, lName, profilePic }) => {
    const navigate = useNavigate();
    const { addToCart } = React.useContext(CartContext); // Use addToCart function from CartContext
    const {isLoggedIn,loggedId}= useAuth();
    // State to track hover
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div className="card h-100 shadow-sm">
            {/* Image Container with Aspect Ratio */}
                
                <div className="position-relative overflow-hidden" style={{ paddingTop: '75%' }}>
                <img 
                    src={item && item.itemPics && item.itemPics[0] && item.itemPics[0].url ? item.itemPics[0].url : ""} 
                    className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" 
                    alt="itemPic"
                    loading="lazy"
                    />
                {/* Add to Cart Icon on Top Left Corner */}
                    { isLoggedIn && loggedId !== item.user &&
                <button 
                    onClick={(e) => { 
                        if (isLoggedIn) {
                            addToCart(item._id); // Add item to cart
                        } else {
                            setOpenModalLog(true);
                            setOpenModalReg(false);
                        }
                    }
                } 
                    className="btn position-absolute top-0 start-0 m-2"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        backgroundColor: isHovered ? 'transparent' : '#5C2D9A',
                        borderColor: '#5C2D9A',
                        color: isHovered ? '#5C2D9A' : '#fff',
                        transition: 'background-color 0.3s, border-color 0.3s, color 0.3s'
                    }}
                >
                    <i className="bi bi-cart-plus-fill"></i>
                </button>
                    }
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
                
                {/* Show Product Button */}
                <button 
                    onClick={(e) => { 
                        if (isLoggedIn) {
                            navigate(`/items/${item._id}`);
                        } else {
                            setOpenModalLog(true);
                            setOpenModalReg(false);
                        }
                    }
                } 
                    className="btn btn-primary w-100 mt-auto"
                    style={{ backgroundColor: '#5C2D9A', borderColor: '#5C2D9A' }}
                >
                    Show Product
                </button>
            </div>
        </div>
    )
}

export default ItemCard;