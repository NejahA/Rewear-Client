import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ItemCard from "../Components/ItemCard";
import { useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
// import { Spinner } from "flowbite-react"; SyncLoader
import { SyncLoader } from "react-spinners";
import {
  Chip,
  Divider,
  FormControl,
  TextField,
  Input,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Slider,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
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
const ageOptions = ["Baby", "Child", "Teen", "Adult"];

const sizeLabels = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
// const genderOptions = ['Men', 'Women', 'Unisex', 'Kids'];
const genderOptions = ["Male", "Female", "Unisex"];

const sizesMarks = sizeLabels.map((label, index) => ({
  value: index,
  label: label,
}));
const categories = {
  Footwear: ["Shoes", "Sneakers", "Heels", "Boots", "Sandals"],
  Tops: ["T-Shirts", "Shirts", "Sweaters"],
  Bottoms: ["Jeans", "Trousers", "Shorts", "Skirts"],
  Outerwear: ["Jackets", "Coats"],
  "One-Piece Outfits": ["Dresses"],
  Functional: ["Activewear", "Sleepwear", "Swimwear"],
  // 'Age-Specific': ['Kidwear', 'Babywear', "Teenwear"],
  Accessories: ["Bags", "Accessories"],
};
const footwearCategories = ["Shoes", "Sneakers", "Heels", "Boots", "Sandals"];

const allCategories = [
  "T-Shirts",
  "Shirts",
  "Sweaters",
  "Jeans",
  "Trousers",
  "Shorts",
  "Jackets",
  "Coats",
  "Dresses",
  "Skirts",
  "Shoes",
  "Sneakers",
  "Heels",
  "Bags",
  "Accessories",
  "Activewear",
  "Sleepwear",
  "Swimwear",
  "Kidswear",
  "Babywear",
  "Boots",
];
const conditionOptions = ["New with tags", "Like new", "Good", "Acceptable"];
const kidSizes0 = [
  "0-3M",
  "3-6M",
  "6-9M",
  "9-12M",
  "12-18M",
  "18-24M",
  "2Y",
  "3Y",
  "4Y",
  "5Y",
  "6Y",
  "7Y",
  "8Y",
  "9Y",
  "10Y",
  "12Y",
  "14Y",
  "16Y",
];
const kidsSizes = [
  "2-3Y",
  "3-4Y",
  "4-5Y",
  "5-6Y",
  "6-7Y",
  "7-8Y",
  "8-9Y",
  "9-10Y",
  "10-12Y",
];
const teenSizes = ["12-14Y", "14-16Y", "16-18Y"];
const babySizes = ["0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M"];
const tagOptions = [
  "Eco-friendly",
  "Sustainable",
  "Vintage",
  "Minimal",
  "Streetwear",
  "Luxury",
  "Formal",
  "Casual",
  "Colorful",
  "Neutral",
  "Trendy",
  "Classic",
  "90s",
  "Y2K",
  "Preppy",
  "Boho",
  "Sporty",
  "Plus Size",
];
const Home = ({ setOpenModalLog, setOpenModalReg, sort, setSort , logged}) => {
  // const [items, setItems] = useState([])
  // const [userId, SetUserId] = useState(null)
  // const [page, setPage] = useState(1);
  // const listInnerRef = useRef();
  // const [loading, setLoading] = useState(false);

  // useEffect( ()  => {
  //       axios.get(''+import.meta.env.VITE_GITHUB_URI+'/api/items',{withCredentials:true})
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


  // useEffect(() => {
  //   fetchItems(page);
  //   console.log("page",page)
  // }, [page]);

  // const fetchItems = async (pageNum) => {
  //     setLoading(true);
  //   try {
  //     const res = await fetch(`https://localhost:10000/api/items?page=${pageNum}`);
  //     const data = await res.json();
  //     setItems((prev) => [...prev, ...data]);
  //   } catch (error) {
  //     console.error('Fetching error:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false); // Track loading state
  const isFetchingRef = useRef(false);
  const fetchedPagesRef = useRef(new Set());
  const pageRef = useRef(0);
  const [openCategory, setOpenCategory] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user,setUser] = useState()
  const [categoryCounts, setCategoryCounts] = useState();
    const location = useLocation();
  
  useEffect(()=>{
    axios.get(""+import.meta.env.VITE_GITHUB_URI+"/api/users/logged")
          .then((res)=>{
            console.log("user from home axios for state",JSON.stringify(res.data?.id))
            setUser(res.data)
          })
          .catch((err)=> {
            console.log("error from home user state =>",err)
          })
  },[location.pathname,logged])
  useEffect(() => {
    const counts = {};
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    setCategoryCounts(counts);
    console.log("count items", categoryCounts);
  }, [items]);
  const handleSliderChange = (event, newValue) => {
    setSort({ ...sort, size: newValue });
  };

  const fetchItems = async (p, force = false) => {
    {
      if (fetchedPagesRef.current.has(p) && !force) {
        console.log("Skipping fetch: page already fetched");
        return;
      }
      console.log(
        "loading at beginning",
        loading,
        "hasemore state at beginning ",
        hasMore,
        "force",
        force
      );
      // if (loading || !hasMore) return;
      if (isFetchingRef.current) return; // hard lock
      if (!hasMore && !force) return; //  no more items to fetch
      isFetchingRef.current = true; // lock fetching

      // if (loading == true   ) return;  // Prevent fetching if already loading or no more items
      setLoading(true); // Set loading to true to prevent duplicate requests


      const params = new URLSearchParams({
        category: sort?.category || "",
        gender: sort?.gender || "",
        age: sort?.age || "",
        q: sort?.search || "",
        page: p,
        condition: sort?.condition || "",
        size: sort?.size || "",
        minP: sort?.minP || "",
        maxP: sort?.maxP || "",
        priceSort: sort?.priceSort || "",
        sizeSort: sort?.sizeSort || "",
        brand: sort?.brand || "",
      });
      if (sort?.tags && sort.tags.length > 0) {
        params.set("tags", sort.tags.join(","));
      } else {
        params.delete("tags"); // or leave empty
      }

      const url = `${import.meta.env.VITE_GITHUB_URI}/api/items?${params.toString()}`;
      console.log("this is the url",url)

      axios
        .get(url, { withCredentials: true })
        .then((res) => {
          console.log("p in func", p);
          console.log("url=>", url);
          console.log("this is the data fetched", res.data);
          if (res.data.length === 0) {
            setHasMore(false);
          } else if (res.data.length < 6) {
            // setItems( items =>[...items, ...res.data]);
            setItems((items) => {
              const updated = [...items, ...res.data];
              return updated;
            });
            setHasMore(false);
          } else {
            setItems((items) => [...items, ...res.data]);
            setPage((prev) => {
              const next = prev + 1;
              pageRef.current = next; // keep ref in sync
              return next;
            });
            fetchedPagesRef.current.add(p); // ✅ Mark page as fetched
          }
        })
        .catch((err) => console.error("Fetching error:", err))
        .finally(() => {
          isFetchingRef.current = false; // ✅ unlock here
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    setHasMore(true);
    console.log("set has more in useffect", hasMore);
    setLoading(false);
    setPage(0); // reset page
    setItems([]);
    isFetchingRef.current = false; // ✅ Unlock before first fetch

    fetchedPagesRef.current = new Set(); // ✅ Clear fetched pages

    // setSort({category: "", search: "", gender: ""} )

    {
      const timer = setTimeout(() => {
        fetchItems(0, true); // Call fetchItems after delay
      }, 1000); // Delay in milliseconds (e.g., 300ms)

      return () => clearTimeout(timer); // Cleanup on unmount or dependency change
    }
    // else {
    //   setItems([]);
    // }
  }, [ sort.home]);

  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
    }
  }, [JSON.stringify(items)]);
  // const filteredItems = items.filter(item => {
  //   if (!sort) return item;
  //   if (sort.category) return item.category === sort.category;
  //   if (sort.search) return item.title.includes(sort.search);
  // });
  useEffect(() => {
    console.log("sort from useffect", sort);
  }, [JSON.stringify(sort)]);
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setHasMore(true);
    console.log("set has more in useffect", hasMore);
    setLoading(false);
    setPage(0); // reset page
    setItems([]);
    isFetchingRef.current = false; // ✅ Unlock before first fetch

    fetchedPagesRef.current = new Set(); // ✅ Clear fetched pages

    // setSort({category: "", search: "", gender: ""} )

    {
      const timer = setTimeout(() => {
        fetchItems(0, true); // Call fetchItems after delay
      }, 1000); // Delay in milliseconds (e.g., 300ms)

      return () => clearTimeout(timer); // Cleanup on unmount or dependency change
    }
    // else {
    //   setItems([]);
    // }
  };

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    if (items.length == 0) {
      return;
    }
    setAnchorEl(event.currentTarget); // open menu anchored to h5
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (category) => {
    setSort({ ...sort, category: category === sort.category ? "" : category });
    handleClose();
    setAnchorEl(null);
  };
  const handleSelectTag = (tags) => {
    // setSort({ ...sort, tags:  tags === sort.tags ? "null" : tags });
  };
  return (
    <>
      <div className="d-flex">
        {sort && sort.nav && (
          <div
            className=" col-3 d-flex flex-column px-5 bg-body-tertiary  "
            style={{
              // height: "100vh",
              display: "hidden",
              maxHeight: "100%",
              overflowY: "auto",
            }}
          >
            {
              <form
                className=" d-flex flex-column "
                onSubmit={handleFilterSubmit}
              >
                <button
                  type="submit"
                  className="btn rounded text-light w-50 align-self-end mb-3"
                  style={{ backgroundColor: "#713CC5" }}
                >
                  Apply Filters
                </button>
                <div>
                  <h5
                    className="mb-3 category-title-hover"
                    onClick={() => {
                      setSort({
                        ...sort,
                        gender:
                          typeof sort.gender === "string"
                            ? false
                            : !sort.gender,
                      });
                      // console.log("h5 size ===>", JSON.stringify(sort));
                    }}
                  >
                    Gender
                  </h5>
                  <div className="d-flex gap-4 mb-3">
                    <RadioGroup
                      row
                      aria-labelledby="condition-label"
                      name="condition"
                      value={sort && sort.gender}
                      onChange={(e) => {
                        setSort({ ...sort, gender: e.target.value });
                      }}
                    >
                      {genderOptions.map((c) => (
                        <FormControlLabel
                          key={c}
                          value={c}
                          control={
                            <Radio
                              disabled={sort.gender === false}
                              color="violet"
                            />
                          }
                          label={c}
                        />
                      ))}
                    </RadioGroup>
                  </div>
                </div>
                <div>
                  <h5
                    className="mb-3 category-title-hover"
                    onClick={() => {
                      setSort({
                        ...sort,
                        age: typeof sort.age === "string" ? false : !sort.age,
                      });
                      // console.log("h5 size ===>", JSON.stringify(sort));
                    }}
                  >
                    Age
                  </h5>
                  <div className="d-flex gap-4 mb-3">
                    <RadioGroup
                      row
                      aria-labelledby="condition-label"
                      name="condition"
                      value={sort && sort.age}
                      onChange={(e) => {
                        setSort({ ...sort, age: e.target.value });
                      }}
                    >
                      {ageOptions.map((c) => (
                        <FormControlLabel
                          key={c}
                          value={c}
                          control={
                            <Radio
                              disabled={sort.age === false}
                              color="violet"
                            />
                          }
                          label={c}
                        />
                      ))}
                    </RadioGroup>
                  </div>
                </div>
                <div>
                  <Typography
                    variant="h6"
                    onClick={handleClick}
                    // onMouseOut={handleClose}
                    // onMouseLeave={handleClose}
                    className="mb-3 category-title-hover d-block w-100 "
                    style={{ cursor: "pointer" }}
                  >
                    Categories
                  </Typography>

                  <div
                    className="category-list mb-3 graybg-scrollbar scroll-container thumb-round"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {Object.entries(categories).map(
                      ([categoryTitle, items], index) => (
                        <div
                          className="ps-2 d-flex flex-column align-items-center"
                          key={categoryTitle}
                        >
                          <Typography
                            className="text-center"
                            variant="subtitle1"
                            sx={{
                              fontWeight: "bold",
                              padding: "",
                              textTransform: "capitalize",
                            }}
                          >
                            {categoryTitle}
                          </Typography>
                          <div
                            style={{ display: "flex", flexWrap: "wrap" }}
                            className="d-flex justify-content-center"
                          >
                            {items.map((item) => (
                              <Chip
                                key={item}
                                label={item}
                                color={
                                  sort.category === item ? "violet" : "default"
                                }
                                onClick={() => handleSelect(item)}
                                sx={{ margin: 0.5 }}
                              />
                            ))}
                          </div>
                          {index < Object.entries(categories).length - 1 && (
                            <Divider />
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {categoryCounts && (
                    <Menu
                      anchorEl={anchorEl}
                      open={open}
                      // onMouseEnter={handleClick}
                      // onMouseOutCapture={handleClose}
                      onClose={handleClose}
                      PaperProps={{
                        sx: {
                          width: 450,
                          maxHeight: 300,
                        },
                      }}
                      MenuListProps={{
                        style: {
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)", // 3 columns across
                        },
                      }}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                    >
                      {Object.entries(categoryCounts).map(
                        ([categoryTitle, count], index) => (
                          <div
                            className=" d-flex flex-column align-items-center"
                            key={categoryTitle}
                          >
                            <MenuItem
                              key={index}
                              onClick={() => {
                                handleSelect(categoryTitle);
                              }}
                            >
                              <Typography
                                onClick={() => {
                                  setItems(
                                    items.filter(
                                      (item) => item.category === categoryTitle
                                    )
                                  );
                                  setHasMore(false);
                                }}
                                className="text-center"
                                variant="subtitle1"
                                sx={{
                                  fontWeight: "bold",
                                  padding: "",
                                  textTransform: "capitalize",
                                }}
                              >
                                {categoryTitle}
                                {/* Display category count */}
                                <Chip
                                  label={count}
                                  color="violet"
                                  size="small"
                                  sx={{ marginLeft: 1 }}
                                />
                              </Typography>
                            </MenuItem>

                            {index <
                              Object.entries(categoryCounts).length - 1 && (
                              <Divider />
                            )}
                          </div>
                        )
                      )}
                    </Menu>
                  )}
                </div>

                {/* {categoryCounts && Object.keys(categoryCounts).length > 0 && (
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
              )} */}

                {
                  <>
                    <div className="d-flex justify-content-between">
                      <h5
                        className="mb-3 category-title-hover"
                        onClick={() => {
                          setSort({
                            ...sort,
                            size:
                              typeof sort.size === "string"
                                ? false
                                : !sort.size,
                          });
                          console.log("h5 size ===>", JSON.stringify(sort));
                        }}
                      >
                        Size
                      </h5>
                      <div className="d-flex">
                        <i
                          className="nav-link bi-arrow-up VioletCred"
                          onClick={() => {
                            setSort({
                              ...sort,
                              priceSort: "",

                              sizeSort:
                                sort.sizeSort === "ASC"
                                  ? ""
                                  : sort.sizeSort === "DESC"
                                  ? "ASC"
                                  : "ASC",
                            });
                          }}
                          style={{
                            fontSize: "30px",
                            textDecoration: "none",
                            cursor: "pointer",
                            color:
                              sort?.sizeSort === "ASC" ? "#8356C0" : "#C2C3C4", // Violet if nav is true, black otherwise
                          }}
                          onMouseOver={(e) => {
                            e.target.style.color =
                              sort?.sizeSort === "ASC" ? "#C2C3C4" : "#8356C0";
                            e.target.style.textDecoration = "underline";
                            e.target.style.fontWeight = "bold";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.color =
                              sort?.sizeSort === "ASC" ? "#8356C0" : "#C2C3C4";
                            e.target.style.textDecoration = "none";
                            e.target.style.fontWeight = "normal";
                          }}
                        ></i>
                        <i
                          className="nav-link bi-arrow-down VioletCred"
                          onClick={() => {
                            // navigate("/");
                            setSort({
                              ...sort,
                              priceSort: "",
                              sizeSort:
                                sort.sizeSort === "DESC"
                                  ? ""
                                  : sort.sizeSort === "ASC"
                                  ? "DESC"
                                  : "DESC",
                            });
                            console.log("sort from navbar", sort && sort.nav);
                          }}
                          style={{
                            fontSize: "30px",
                            textDecoration: "none",
                            cursor: "pointer",
                            color:
                              sort?.sizeSort === "DESC" ? "#8356C0" : "#C2C3C4", // Violet if nav is true, black otherwise
                          }}
                          onMouseOver={(e) => {
                            e.target.style.color =
                              sort?.sizeSort === "DESC" ? "#C2C3C4" : "#8356C0";
                            e.target.style.textDecoration = "underline";
                            e.target.style.fontWeight = "bold";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.color =
                              sort?.sizeSort === "DESC" ? "#8356C0" : "#C2C3C4";
                            e.target.style.textDecoration = "none";
                            e.target.style.fontWeight = "normal";
                          }}
                        ></i>
                      </div>
                    </div>
                    {footwearCategories.includes(sort?.category) ? (
                      <Input
                        sx={{
                          "&:after": {
                            borderBottom: "2px solid #8356C0", // underline color on focus
                          },
                        }}
                        className="form-control w-100 mb-3"
                        type="number"
                        disabled={sort.size === false}
                        placeholder="Pointure (ex: 40)"
                        onChange={(e) =>
                          setSort({ ...sort, size: e.target.value })
                        }
                      />
                    ) : sort?.gender === "Kids" ||
                      sort?.category === "Babywear" ||
                      sort?.category === "Kidwear" ||
                      sort?.category === "Teenwear" ? (
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
                        disabled={sort.size === false}
                        onChange={(e) =>
                          setSort({ ...sort, size: e.target.value })
                        }
                      >
                        {sort?.category === "Babywear"
                          ? babySizes.map((s) => (
                              <MenuItem key={s} value={s}>
                                {s}
                              </MenuItem>
                            ))
                          : sort?.category === "Kidwear"
                          ? kidsSizes.map((s) => (
                              <MenuItem key={s} value={s}>
                                {s}
                              </MenuItem>
                            ))
                          : teenSizes.map((s) => (
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

                {
                  <>
                    <div className="d-flex justify-content-between">
                      <h5
                        className="mb-3 category-title-hover"
                        onClick={() => {
                          setSort({
                            ...sort,
                            brand:
                              typeof sort.brand === "string"
                                ? false
                                : !sort.brand,
                          });
                          console.log("h5 size ===>", JSON.stringify(sort));
                        }}
                      >
                        Brand
                      </h5>
                    </div>

                    <Input
                      sx={{
                        "&:after": {
                          borderBottom: "2px solid #8356C0", // underline color on focus
                        },
                      }}
                      className="form-control w-100 mb-3"
                      type="text"
                      disabled={sort.brand === false}
                      placeholder="Pointure (ex: 40)"
                      onChange={(e) =>
                        setSort({ ...sort, brand: e.target.value })
                      }
                    />
                  </>
                }

                {
                  <>
                    <div className="d-flex justify-content-between">
                      <h5
                        className="mb-3 category-title-hover"
                        onClick={() => {
                          setSort({
                            ...sort,
                            minP:
                              typeof sort.minP === "number"
                                ? false
                                : !sort.minP,
                            maxP:
                              typeof sort.maxP === "number"
                                ? false
                                : !sort.minP,
                          });
                          console.log("h5 size ===>", JSON.stringify(sort));
                        }}
                      >
                        Price
                      </h5>
                      <div className="d-flex">
                        <i
                          className="nav-link bi-arrow-up VioletCred"
                          onClick={() => {
                            setSort({
                              ...sort,
                              sizeSort: "",

                              priceSort:
                                sort.priceSort === "ASC"
                                  ? ""
                                  : sort.priceSort === "DESC"
                                  ? "ASC"
                                  : "ASC",
                            });
                          }}
                          style={{
                            fontSize: "30px",
                            textDecoration: "none",
                            cursor: "pointer",
                            color:
                              sort?.priceSort === "ASC" ? "#8356C0" : "#C2C3C4", // Violet if nav is true, black otherwise
                          }}
                          onMouseOver={(e) => {
                            e.target.style.color =
                              sort?.priceSort === "ASC" ? "#C2C3C4" : "#8356C0";
                            e.target.style.textDecoration = "underline";
                            e.target.style.fontWeight = "bold";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.color =
                              sort?.priceSort === "ASC" ? "#8356C0" : "#C2C3C4";
                            e.target.style.textDecoration = "none";
                            e.target.style.fontWeight = "normal";
                          }}
                        ></i>
                        <i
                          className="nav-link bi-arrow-down VioletCred"
                          onClick={() => {
                            // navigate("/");
                            setSort({
                              ...sort,
                              sizeSort: "",
                              priceSort:
                                sort.priceSort === "DESC"
                                  ? ""
                                  : sort.priceSort === "ASC"
                                  ? "DESC"
                                  : "DESC",
                            });
                            console.log("sort from navbar", sort && sort.nav);
                          }}
                          style={{
                            fontSize: "30px",
                            textDecoration: "none",
                            cursor: "pointer",
                            color:
                              sort?.priceSort === "DESC"
                                ? "#8356C0"
                                : "#C2C3C4", // Violet if nav is true, black otherwise
                          }}
                          onMouseOver={(e) => {
                            e.target.style.color =
                              sort?.priceSort === "DESC"
                                ? "#C2C3C4"
                                : "#8356C0";
                            e.target.style.textDecoration = "underline";
                            e.target.style.fontWeight = "bold";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.color =
                              sort?.priceSort === "DESC"
                                ? "#8356C0"
                                : "#C2C3C4";
                            e.target.style.textDecoration = "none";
                            e.target.style.fontWeight = "normal";
                          }}
                        ></i>
                      </div>
                    </div>
                    <div className="d-flex mb-3 gap-5">
                      <TextField
                        label="Lowest"
                        color="violet"
                        sx={{
                          "&:after": {
                            borderBottom: "2px solid #8356C0", // underline color on focus
                          },
                        }}
                        id="min-price"
                        className="form-control w-100"
                        type="number"
                        placeholder="Lowest"
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          const max = sort?.maxP || 1000;
                          const minLimit = 0;

                          if (
                            !isNaN(value) &&
                            value >= minLimit &&
                            value <= max
                          ) {
                            setSort({ ...sort, minP: value });
                          } else if (e.target.value === "") {
                            setSort({ ...sort, minP: "" });
                          }
                        }}
                        value={sort?.minP || ""}
                        inputProps={{
                          min: 0,
                          max: sort?.maxP || 1000,
                        }}
                        disabled={sort.minP === false}
                      />
                      <TextField
                        label="Highest"
                        color="violet"
                        value={sort?.maxP || ""}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          const min = sort?.minP || 0;
                          const max = 1000;

                          if (!isNaN(value) && value >= min && value <= max) {
                            setSort({ ...sort, maxP: value });
                          } else if (e.target.value === "") {
                            setSort({ ...sort, maxP: "" }); // allow clearing
                          }
                        }}
                        inputProps={{
                          min: sort?.minP || 0,
                          max: 1000,
                        }}
                        sx={{
                          "&:after": {
                            borderBottom: "2px solid #8356C0", // underline color on focus
                          },
                        }}
                        id="max-price"
                        className="form-control w-100"
                        type="number"
                        placeholder="Highest"
                        disabled={sort.minP === false}
                      />
                    </div>
                  </>
                }
                <div>
                  <h5
                    className="mb-3 category-title-hover"
                    onClick={() => {
                      setSort({
                        ...sort,
                        condition:
                          typeof sort.condition === "string"
                            ? false
                            : !sort.condition,
                      });
                      console.log("h5 size ===>", JSON.stringify(sort));
                    }}
                  >
                    Condition
                  </h5>
                  <div className="d-flex gap-4 mb-3">
                    <RadioGroup
                      row
                      aria-labelledby="condition-label"
                      name="condition"
                      value={sort && sort.condition}
                      onChange={(e) => {
                        setSort({ ...sort, condition: e.target.value });
                      }}
                    >
                      {conditionOptions.map((c) => (
                        <FormControlLabel
                          key={c}
                          value={c}
                          control={
                            <Radio
                              disabled={sort.condition === false}
                              color="violet"
                            />
                          }
                          label={c}
                        />
                      ))}
                    </RadioGroup>
                  </div>
                </div>
                <Typography
                  variant="h6"
                  onClick={() =>
                    setSort({
                      ...sort,
                      // tags: typeof sort.tags === "string" ? false : !sort.tags,
                      showTags: !sort.showTags,
                      tags: [],
                    })
                  }
                  className="mb-3 category-title-hover d-block w-100 "
                  style={{ cursor: "pointer" }}
                >
                  Tags
                </Typography>

                <div
                  className="category-list mb-3 d-flex"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    maxHeight: "170px",
                    overflowY: "auto",
                  }}
                >
                  {sort &&
                    sort.showTags &&
                    tagOptions.map((tag, index) => (
                      <div key={index}>
                        <div
                          style={{ display: "flex", flexWrap: "wrap" }}
                          className="d-flex justify-content-center"
                        >
                          <Chip
                            key={tag}
                            label={tag}
                            color={
                              sort && sort.tags && sort.tags.includes(tag)
                                ? "violet"
                                : "default"
                            }
                            // color={sort.tags === tags ? "violet" : "default"}
                            onClick={() => {
                              const isSelected =
                                sort && sort.tags && sort.tags.includes(tag);
                              const updatedTags = isSelected
                                ? sort.tags.filter((t) => t !== tag)
                                : [...sort.tags, tag];
                              setSort({ ...sort, tags: updatedTags });
                              handleSelectTag(updatedTags);

                              // handleSelectTag(tags);
                              console.log(
                                " sort tag from chipon",
                                sort.tags,
                                "tag=>",
                                tags
                              );
                            }}
                            sx={{ margin: 0.5 }}
                          />
                        </div>
                        {index < Object.entries(categories).length - 1 && (
                          <Divider />
                        )}
                      </div>
                    ))}
                </div>
              </form>
            }
          </div>
        )}
        <div className="container py-5 col-10" >
          <div className="">
            <div
              className="scroll-container    d-flex flex-wrap gap-3 
   justify-content-center  h-100"
          // style={{height: "100vh"}}
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
                sx={{
                  // minHeight: "100vh",
                }}
              >
                <div className="d-flex flex-wrap gap-3" style={{ minHeight: "100vh" }}>
                  {items.map((item) => (
                    <ItemCard
                      userId = {user?.id}
                      fName= {user?.fName}
                      lName= {user?.lName}
                      profilePic= {user?.profilePic}
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
};

export default Home;
