import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios, { all } from 'axios'
import ItemCard from "../Components/ItemCard"
import Cookies from 'universal-cookie';
import { useRef } from "react";
import InfiniteScroll from 'react-infinite-scroll-component';
// import { Spinner } from "flowbite-react"; SyncLoader
import { SyncLoader } from 'react-spinners';
import { Chip, Divider, FormControl, Input, InputLabel, Menu, MenuItem, Select, Slider, Typography } from "@mui/material";
// const sizeMarks = [
//   { value: 'XXS', label: 'XXS' },
//   { value:  'XS', label: 'XS' },
//   { value: 2, label: 'S' },c
//   { value: 3, label: 'M' },
//   { value: 4, label: 'L' },
//   { value: 5, label: 'XL' },
//   { value: 6, label: 'XXL' },
//   { value: 7, label: 'XXXL' }
// ];
const sizeLabels = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const sizeMarks = sizeLabels.map((label, index) => ({
  value: index,
  label: label,
}));
const categories = {
  Footwear: ['Shoes', 'Sneakers', 'Heels', 'Boots', 'Sandals'],
  Tops: ['T-Shirts', 'Shirts', 'Sweaters'],
  Bottoms: ['Jeans', 'Trousers', 'Shorts', 'Skirts'],
  Outerwear: ['Jackets', 'Coats'],
  'One-Piece Outfits': ['Dresses'],
  Functional: ['Activewear', 'Sleepwear', 'Swimwear'],
  'Age-Specific': ['Kidswear', 'Babywear'],
  Accessories: ['Bags', 'Accessories'],
};
const footwearCategories = ['Shoes', 'Sneakers', 'Heels', 'Boots', 'Sandals']

const allCategories = ['T-Shirts','Shirts','Sweaters','Jeans','Trousers','Shorts', 'Jackets','Coats','Dresses','Skirts','Shoes','Sneakers','Heels','Bags','Accessories','Activewear','Sleepwear','Swimwear','Kidswear','Babywear',"Boots",
]
const conditionOptions = ['New with tags', 'Like new', 'Good', 'Acceptable'];
const kidSizes = [
  '0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M',
  '2Y', '3Y', '4Y', '5Y', '6Y', '7Y', '8Y', '9Y', '10Y', '12Y', '14Y', '16Y'
];
const tagOptions = [ 'Eco-friendly','Sustainable','Vintage','Minimal','Streetwear','Luxury','Formal','Casual','Colorful','Neutral','Trendy','Classic','90s','Y2K','Preppy','Boho','Sporty','Plus Size'];
const testhome = (
  {setOpenModalLog,setOpenModalReg,sort,setSort}
  
) => {
  // const navigate = useNavigate();
  // const [items, setItems] = useState([])
  // const cookies = new Cookies()
  // const [userId, SetUserId] = useState(null)
  // const [page, setPage] = useState(1);
  // const listInnerRef = useRef();
  // const [loading, setLoading] = useState(false);

  // useEffect( ()  => {
  //     if (  cookies.get("userToken"))  {
  //       axios.get(''+import.meta.env.VITE_VERCEL_URI+'/api/items',{withCredentials:true})
  //       .then(  res => {
  //         const allItems = [...res.data]
  //         setItems([...allItems]);
  //       })
  //       .catch(error => 
  //         { 
  //           console.log(error)
  //         }
  //       )
  //     } else {
  //       setItems([])
  //     }

  // },[JSON.stringify(items),cookies.get("userToken"),sort])



  // useEffect(() => {
  //   fetchItems(page);
  //   console.log("page",page)
  // }, [page]);

  // const fetchItems = async (pageNum) => {
  //     setLoading(true);
  //   try {
  //     const res = await fetch(https://localhost:10000/api/items?page=${pageNum});
  //     const data = await res.json();
  //     setItems((prev) => [...prev, ...data]);
  //   } catch (error) {
  //     console.error('Fetching error:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const onScroll = () => {
  //   console.log("on scroll activated")
  //   const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
  // if (scrollHeight - scrollTop - clientHeight < 50) { // allow small gap
  //   setPage(prev => prev + 1);
  // }
  // };









  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const cookies = new Cookies();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);  // Track loading state
  const isFetchingRef = useRef(false);
  const fetchedPagesRef = useRef(new Set());
  const pageRef = useRef(0);
  const [openCategory, setOpenCategory] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);


  const [categoryCounts, setCategoryCounts] = useState();
  useEffect(() => {
    const counts = {};
    items.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    setCategoryCounts(counts);
  }, [items]);
  const handleSliderChange = (event, newValue) => {
      
    setSort({ ...sort, size: newValue });
    };


   const fetchItems = async (p,force=false) => {
    // if (  cookies.get("userToken")) 
      {

      if (fetchedPagesRef.current.has(p) && !force) {
        console.log("Skipping fetch: page already fetched");
        return;
      }
      console.log("loading at beginning",loading, "hasemore state at beginning ",hasMore, "force",force)
      // if (loading || !hasMore) return; 
      if (isFetchingRef.current) return;  // hard lock
        if (!hasMore && !force) return; // Don't fetch if no more data unless forced
        isFetchingRef.current = true;       // lock fetching

        // if (loading == true   ) return;  // Prevent fetching if already loading or no more items
        setLoading(true); // Set loading to true to prevent duplicate requests



        
        const url = http://localhost:10000/api/items?category=${sort && sort.category}&gender=${sort && sort.gender}&q=${sort && sort.search}&page=${p};
        
        //   try {
          //     console.log("p in func",p)
          //     console.log("url=>",url)
          //     const res = await fetch(url, {
            //       credentials: 'include',
            //     });
            //     const data = await res.json();
            //     console.log("this is the data fetched",data)
            //     if (data.length === 0) {
              //       setHasMore(false); // No more items to load
    //     } else {
      //       setItems( items =>[...items, ...data]);
      //       setPage((prev) => prev + 1);
      //   }
      // } catch (error) {
        //   console.error('Fetching error:', error);
        // }finally {
          //   setLoading(false); // Reset loading state once the fetch is done
          // }
          
          axios.get(url,{withCredentials:true})
          .then(res=>{
            console.log("p in func",p)
            console.log("url=>",url);
            console.log("this is the data fetched",res.data)
            if (res.data.length === 0) {
              setHasMore(false);
            } else if (res.data.length <6){
              // setItems( items =>[...items, ...res.data]);
              setItems( items =>{
                const updated = [...items, ...res.data];
                return updated;
              });
              setHasMore(false);
            }
            else
            {
              setItems( items =>[...items, ...res.data]);
              setPage(prev => {
                const next = prev + 1;
                pageRef.current = next;  // keep ref in sync
                return next;
              });
                            fetchedPagesRef.current.add(p);  // ✅ Mark page as fetched

            }   
            
            
          })
          .catch(err => console.error('Fetching error:', err)  )  
          .finally(() => {
            isFetchingRef.current = false; // ✅ unlock here
            setLoading(false);
            
    
          });

        }
      
  };

  useEffect(() => {
    setHasMore(true);
    console.log('set has more in useffect',hasMore)
    setLoading(false)
    setPage(0);    // reset page
    setItems([]);
    isFetchingRef.current = false; // ✅ Unlock before first fetch

    fetchedPagesRef.current = new Set(); // ✅ Clear fetched pages

    // setSort({category: "", search: "", gender: ""} )

//  if (cookies.get("userToken")) 
  {
    const timer = setTimeout(() => {
      fetchItems(0, true);  // Call fetchItems after delay
    }, 1000); // Delay in milliseconds (e.g., 300ms)

    return () => clearTimeout(timer); // Cleanup on unmount or dependency change
  } 
  // else {
  //   setItems([]);
  // }
  }, [cookies.get("userToken"), sort?.gender ]);

  useEffect(() => {
    if(items.length === 0 ) 
      {setLoading(false);}
  },[JSON.stringify(items)])
  // const filteredItems = items.filter(item => {
  //   if (!sort) return item;
  //   if (sort.category) return item.category === sort.category;
  //   if (sort.search) return item.title.includes(sort.search);
  // });
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setHasMore(true);
    console.log('set has more in useffect',hasMore)
    setLoading(false)
    setPage(0);    // reset page
    setItems([]);
    isFetchingRef.current = false; // ✅ Unlock before first fetch

    fetchedPagesRef.current = new Set(); // ✅ Clear fetched pages

    // setSort({category: "", search: "", gender: ""} )

//  if (cookies.get("userToken")) 
  {
    const timer = setTimeout(() => {
      fetchItems(0, true);  // Call fetchItems after delay
    }, 1000); // Delay in milliseconds (e.g., 300ms)

    return () => clearTimeout(timer); // Cleanup on unmount or dependency change
  } 
  // else {
  //   setItems([]);
  // }
  }

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    if(items.length == 0) {return}
    setAnchorEl(event.currentTarget); // open menu anchored to h5
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (category) => {
    setSort({ ...sort, category });
    handleClose();
    setAnchorEl(null);

  };

  return (
    <>
      <div className="d-flex">
        <div className="mt-3 col-2 d-flex flex-column ps-5">
          {
            <form className=" d-flex flex-column" onSubmit={handleFilterSubmit}>
              




              <div>
      <Typography variant="h6" onClick={handleClick} className="mb-3 category-title-hover d-block w-100 "  style={{ cursor: 'pointer' }}>
        Categories 
      </Typography>

      {/* If items.length === 0, display categories on the page without the menu */}
      {items.length === 0 ? (
        <div className="category-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {Object.entries(categories).map(([categoryTitle, items], index) => (
            <div className="ps-2 d-flex flex-column align-items-center" key={categoryTitle}>
              <Typography
                className="text-center"
                variant="subtitle1"
                sx={{ fontWeight: 'bold', padding: '', textTransform: 'capitalize' }}
              >
                {categoryTitle}
              </Typography>
              <div style={{ display: 'flex', flexWrap: 'wrap' }} className="d-flex justify-content-center">
                {items.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    color={sort.category === item ? 'violet' : 'default'}
                    onClick={() => handleSelect(item)}
                    sx={{ margin: 0.5 }}
                  />
                ))}
              </div>
              {index < Object.entries(categories).length - 1 && <Divider />}
            </div>
          ))}
        </div>
      ) : (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: 400,
              maxHeight: 300,
            },
          }}
          MenuListProps={{
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns across
            },
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {Object.entries(categories).map(([categoryTitle, items], index) => (
            <div className="ps-2 d-flex flex-column align-items-center" key={categoryTitle}>
              <Typography
                className="text-center"
                variant="subtitle1"
                sx={{ fontWeight: 'bold', padding: '', textTransform: 'capitalize' }}
              >
                {categoryTitle}
              </Typography>
              <div style={{ display: 'flex', flexWrap: 'wrap' }} className="d-flex justify-content-center">
                {items.map((item) => (
                  <MenuItem key={item} onClick={() => handleSelect(item)}>
                    <Chip
                      label={item}
                      color={sort.category === item ? 'violet' : 'default'}
                    />
                  </MenuItem>
                ))}
              </div>
              {index < Object.entries(categories).length - 1 && <Divider />}
            </div>
          ))}
        </Menu>
      )}
    </div>





    


              
             

              {categoryCounts && Object.keys(categoryCounts).length > 0 && (
                <ul className="list-group mb-5">
                  {Object.entries(categoryCounts).map(([category, count]) => (
                    <li
                      className="list-group-item d-flex justify-content-between align-items-center"
                      key={category}
                    >
                      <span
                        className="category-hover"
                        onClick={() => {
                          setSort({ ...sort, category: category });
                        }}
                      >
                        {category}
                      </span>
                      <span
                        className="count-pill rounded-pill"
                        onClick={() => {
                          // setSort({...sort,category:category})
                          setItems((items) =>
                            items.filter((item) => item.category === category)
                          );
                          setHasMore(false);
                        }}
                      >
                        {count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {
                <>
                  <h5
                    className="mb-3 category-title-hover"
                    onClick={() => {
                      setSort({
                        ...sort,
                        size:
                        typeof sort.size === "string" ? false : !sort.size,
                      });
                      console.log("h5 size ===>", JSON.stringify(sort));
                    }}
                  >
                    Size
                  </h5>
                  {
                  footwearCategories.includes(sort?.category) ? (
                    <Input
                      sx={{
                        "&:after": {
                          borderBottom: "2px solid #8356C0", // underline color on focus
                        },
                      }}
                      className="form-control w-100"
                      type="number"
                      placeholder="Pointure (ex: 40)"
                      onChange={(e) =>
                        setSort({ ...sort, size: e.target.value })
                      }
                    />
                  ) : sort?.gender === "Kids" ||
                    sort?.category === "Babywear" ||
                    sort?.category === "Kidswear" ? (
                    <Select
                      sx={{
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8356C0", // border color on focus
                        },
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": {
                            borderColor: "#8356C0", // another way to ensure border color
                          },
                        },
                      }}
                      className="form-control mb-5 align-content-center"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            overflowY: "auto",
                          },
                        },
                        MenuListProps: {
                          style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)", // 3 columns across
                            gap: "8px", // spacing between items
                          },
                        },
                      }}
                      labelId="size-select-label"
                      value={sort && sort.size}
                      // label="Sélectionner une taille"
                      onChange={(e) =>
                        setSort({ ...sort, size: e.target.value })
                      }
                    >
                      {kidSizes.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Slider
                      sx={{
                        color: "#8356C0", // base color (thumb, track, active state)
                        "& .MuiSlider-thumb": {
                          "&:hover, &.Mui-focusVisible, &.Mui-active": {
                            boxShadow: "0 0 0 8px #8356C0)", // optional focus ring
                          },
                        },
                      }}
                      className=" w-100 mb-5"
                      disabled={sort.size === false}
                      // value={sort && sort.size}
                      // onChange={handleSliderChange}
                      // valueLabelDisplay="auto"
                      // valueLabelFormat={(value) =>
                      //   sizeMarks.find((mark) => mark.value === value)?.label
                      // }
                      value={sizeLabels.indexOf(sort.size)} // Make sure this gives a valid index (not -1)
                      onChange={(e, newValue) => {
                        setSort({ ...sort, size: sizeLabels[newValue] }); // Save string value
                      }}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => sizeLabels[value]}
                      marks={sizeLabels.map((label, index) => ({
                        value: index,
                        label,
                      }))}
                      step={1}
                      // marks={sizeMarks}
                      min={0}
                      max={sizeLabels.length - 1}
                    />
                  )}
                </>
              }

              <button
                type="submit"
                className="btn rounded text-light w-50 align-self-end "
                style={{ backgroundColor: "#713CC5" }}
              >
                Apply Filters
              </button>
            </form>
          }
        </div>
        <div className="container col-10">
          <div className="">
            <div
              className="scroll-container    d-flex flex-wrap gap-3 
   justify-content-center 
  "
              id="scrollableDiv"
            >
              {/* {items.filter(item=>{ if (!sort){return item} else if (sort && sort.category) {return item.category===sort.category} else if (sort && sort.search) { return item.title.includes(sort.search)}})
              .map((item) => (
                <ItemCard item={item} 
                  setOpenModalLog={setOpenModalLog} setOpenModalReg={setOpenModalReg}    
                  key={item.id}
                  />
              ))} */}

              <InfiniteScroll
                className=""
                dataLength={items.length}
                next={() => fetchItems(pageRef.current)}
                hasMore={hasMore}
                // loader={<h4 className="text-center">Loading...</h4>}
                loader={
                  <SyncLoader
                    className="text-center mt-3"
                    color="#5C2D9A"
                    loading
                    margin={10}
                    speedMultiplier={0.5}
                  />
                }
                // endMessage={<p className="text-center">You have seen it all!</p>}
                scrollableTarget="scrollableDiv"
              >
                <div className="d-flex flex-wrap gap-3">
                  {items.map((item) => (
                    <ItemCard
                      item={item}
                      setOpenModalLog={setOpenModalLog}
                      setOpenModalReg={setOpenModalReg}
                      key={item.id}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            </div>

            {/* <div className="col-1"></div> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default testhome