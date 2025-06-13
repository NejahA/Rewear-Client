import axios from "axios";
import React, { useState, useEffect } from "react";
import Logout from "../Components/Logout";
import { useNavigate, useParams } from "react-router-dom";

const Edit = () => {
  const [item, setItem] = useState({
    title: "",
    category: "",
    brand: "",
    size: "",
    description: "",
    price: "",
  });
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [userId, SetUserId] = useState(null)
  const [errors,setErrors] =useState(null)

  // const nav = useNavigate(); 
  const navigate = useNavigate()

  // const token = localStorage.getItem('token')
  const { id } = useParams()
  // console.log("this is id : ",id);

  useEffect(() => {
    // if (!token) {
    //   navigate('/')
    // } else 
    {
      axios.get(""+import.meta.env.VITE_GITHUB_URI+"/api/items/" + id,{withCredentials:true})
        .then(res => {
          setItem(res.data)
        })
        .then(axios.get(''+import.meta.env.VITE_GITHUB_URI+'/api/users/logged',{withCredentials:true})
        .then((res)=> {
          console.log("res ===>",res.data);
          SetUserId(res.data._id)
    
        }))
        
        .catch(err=>console.log(err))
      console.log();
    // }
  }}, [])
  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
    console.log("FILE =====> :", selectedFiles);
  };
  const handleRemoveImage = (index) => {
    const updatedFiles = Array.from(selectedFiles);
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
};
  const handleUpload = (e) => {
    // const formData = new FormData();
    // formData.append("file", selectedFiles);
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", item.title);
    formData.append("category", item.category);
    formData.append("brand", item.brand);
    formData.append("size", item.size);
    formData.append("description", item.description);
    formData.append("price", item.price);
    // formData.append("user", item.user  )
    if (selectedFiles) {

      for (let i = 0; i < selectedFiles.length ; i++) {
        // newarr.push(selectedFiles[i]);
        if (selectedFiles[i].filename){

          formData.append("files", selectedFiles[i]);
        }
      }
    }
    else {
      for (let i = 0; i < item.itemPics.length; i++) {

        formData.append("itemPics",{url:item.itemPics[i].url})
        // formData.append("itemPics", item.itemPics);
        console.log("this is item pic number "+ i , "==>",item.itemPics[i]);
      }
      }
  
    axios
      .put(""+import.meta.env.VITE_GITHUB_URI+"/api/items/"+id, formData,{withCredentials:true})
      .then((res) => {
        console.log(res);
        console.log(JSON.stringify(formData));
        navigate(-1)
      })
      .catch((err) => {console.log(err)
        setErrors(err.response.data.errors)
    })

  };

  return (
    <div>
      


      <form onSubmit={(e) => { handleUpload(e) }}>

<div className="container d-flex flex-column gap-5 p-5">
    <div className="card p-3 d-flex flex-column gap-3">
        <p>Ajoute jusqu'à 5 photos</p>
        <div className=" p-3 d-flex gap-5 imageCompo " >
            <div className="file-btn upload col-2" >
                <input className="inputPic " type="file" multiple required={false} onChange={handleFileChange} />
                <span className="material-symbols-rounded"><i class="bi bi-cloud-plus"></i></span> Upload File
            </div>
            <div className="d-flex flex-row flex-wrap gap-2">
                {selectedFiles ?  Array.from(selectedFiles).map((file, idx) => (
                    <div key={idx} className="imgsel">
                        <img src={URL.createObjectURL(file)} className="selectedImg " alt={`preview-${idx}`} />
                        <button  className="x rounded-circle " type="button" onClick={() => handleRemoveImage(idx)}><i class="bi bi-trash-fill"></i></button>
                    </div>
                    
                )) : 
                item.itemPics &&  Array.from(item.itemPics).map((imagepath, idx) => (
                  <div key={idx} className="imgsel">
                      <img src={imagepath.url ? imagepath.url : imagepath} className="selectedImg " alt={`preview-${idx}`} />
                      <button  className="x rounded-circle " type="button" onClick={() => handleRemoveImage(idx)}><i class="bi bi-trash-fill"></i></button>
                  </div>
                  
              ))
                
                // <img src={item.itemPics[0]} />
                
                }
            </div>
        </div>
        <div className="d-flex gap-2 border p-3">
            <div>
                <i style={{ color: '#5C2D9A' }} class="bi bi-info-circle-fill"></i>
            </div>
            <div>
                <h5 style={{ color: '#5C2D9A' }}>Utilise uniquement tes propres photos</h5>
                <h6>Cette annonce peut être masquée ou supprimée si elle contient des photos qui ne sont pas les tiennes</h6>
            </div>

        </div>
    </div>
    <div className="card p-3">
        <div className="d-flex justify-content-between">
            <label htmlFor="title">Title</label>
            <input className="form-control w-25" type="text" placeholder="ex: sweatshirt noir" value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} />

            {/* !!!!!!!!!!!!!!!!!!!!!!!!!!! ERROR VALIDATOR FOR TITLE (COPY PASTE FOR ALL FEILDS) */}
            
            {errors && errors.title.message && <p>Veuillez inserer un titre</p> }
        </div>

        <hr />
        <div className="d-flex justify-content-between">
            <label htmlFor="description">Description</label>
            <textarea className="form-control description w-50" name="" id="description" cols="" rows="5" placeholder="ex: porté quelques fois,taille correcte" value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} type="text" />
        </div>
    </div>
    <div className="card p-3">
        <div className="d-flex justify-content-between">

            <label htmlFor="category">Categories</label>
            <select class="form-select w-25" aria-label="Default select example" value={item.category} onChange={(e) => setItem({ ...item, category: e.target.value })}>
                <option selected>Select Categorie</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Kids">Kids</option>
            </select>
        </div>
    </div>
    <div className="card p-3">
        <div className="d-flex justify-content-between">
            <label htmlFor="size">Size</label>
            <input className="form-control w-25" type="text" placeholder="..Taille/..Pointure" value={item.size} onChange={(e) => setItem({ ...item, size: e.target.value })} />
        </div>
    </div>
    <div className="card p-3">
        <div className="d-flex justify-content-between">
            <label htmlFor="brand">Brand</label>
            <input className="form-control w-25" type="text" placeholder="Zara,Bershka,ect.." value={item.brand} onChange={(e) => setItem({ ...item, brand: e.target.value })} />
        </div>
    </div>
    <div className="card p-3">
        <div className="d-flex justify-content-between">
            <label htmlFor="price">Price</label>
            <input className="form-control w-25" type="number" placeholder="0.00 DT" value={item.price  } onChange={(e) => setItem({ ...item, price: e.target.value })} />
        </div>
    </div>
    <button className="btn-submit w-25 rounded p-2 text-light">Edit Article</button>
</div>
</form>
    <button className=" w-25 rounded p-2 " onClick={()=>navigate(-1)}>Go Back</button>








      {/* <button onClick={() => nav("/home")}>Home</button>
      <form enctype="multipart/form-data">
        <input name="photo" type="file" multiple onChange={handleFileChange} />
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            onChange={(e) => setItem({ ...item, title: e.target.value })}
            value={item.title}
          />
        </div>
        <div>
          <label htmlFor="category"></label>category
          <input
            onChange={(e) => setItem({ ...item, category: e.target.value })}
            value={item.category}
            type="text"
          />
        </div>
        <div>
          <label htmlFor="brand"></label>brand
          <input
            onChange={(e) => setItem({ ...item, brand: e.target.value })}
            value={item.brand}
            type="text"
          />
        </div>
        <div>
          <label htmlFor="size"></label>size
          <input
            onChange={(e) => setItem({ ...item, size: e.target.value })}
            value={item.size}
            type="text"
          />
        </div>
        <div>
          <label htmlFor="description"></label>description
          <input
            onChange={(e) => setItem({ ...item, description: e.target.value })}
            value={item.description}
            type="text"
          />
        </div>
        <div>
          <label htmlFor="price"></label>price
          <input
            onChange={(e) => setItem({ ...item, price: e.target.value })}
            value={item.price}
            type="number"
          />
        </div>
        <button onClick={handleUpload}>Edit</button>
      </form> */}
      {/* <img src="/images/arboraissance.png-1705238926451.png" /> */}
    </div>
  );
};

export default Edit;
