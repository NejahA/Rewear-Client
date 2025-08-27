import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ItemCard from "../Components/ItemCard";
import { useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
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

const ageOptions = ["Baby", "Child", "Teen", "Adult"];
const sizeLabels = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
const genderOptions = ["Male", "Female", "Unisex"];

const categories = {
  Footwear: ["Shoes", "Sneakers", "Heels", "Boots", "Sandals"],
  Tops: ["T-Shirts", "Shirts", "Sweaters"],
  Bottoms: ["Jeans", "Trousers", "Shorts", "Skirts"],
  Outerwear: ["Jackets", "Coats"],
  "One-Piece Outfits": ["Dresses"],
  Functional: ["Activewear", "Sleepwear", "Swimwear"],
  Accessories: ["Bags", "Accessories"],
};
const footwearCategories = ["Shoes", "Sneakers", "Heels", "Boots", "Sandals"];

const conditionOptions = ["New with tags", "Like new", "Good", "Acceptable"];
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

const Home = ({ setOpenModalLog, setOpenModalReg, sort, setSort, logged }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const fetchedPagesRef = useRef(new Set());
  const pageRef = useRef(0);
  const [openCategory, setOpenCategory] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState();
  const [categoryCounts, setCategoryCounts] = useState();
  const location = useLocation();

  // NEW: ensure sort.category is an array at startup
  useEffect(() => {
    if (sort && !Array.isArray(sort.category)) {
      setSort({ ...sort, category: sort.category ? [sort.category] : [] });
    }
  }, []); // run once

  useEffect(() => {
    axios
      .get("" + import.meta.env.VITE_GITHUB_URI + "/api/users/logged")
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.log("error from home user state =>", err);
      });
  }, [location.pathname, logged]);

  useEffect(() => {
    const counts = {};
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    setCategoryCounts(counts);
  }, [items]);

  const handleSliderChange = (event, newValue) => {
    setSort({ ...sort, size: newValue });
  };

  // NEW: helper to determine if a name is footwear
  const isFootwear = (name) => footwearCategories.includes(name);

  // NEW: multi-select toggle enforcing the rule
  const toggleCategory = (name) => {
    const current = Array.isArray(sort.category) ? sort.category : [];
    const selectedSet = new Set(current);
    const alreadySelected = selectedSet.has(name);

    if (alreadySelected) {
      // remove
      selectedSet.delete(name);
      setSort({ ...sort, category: Array.from(selectedSet) });
      return;
    }

    if (isFootwear(name)) {
      // selecting a footwear => keep only footwear categories
      const onlyFootwear = Array.from(selectedSet).filter(isFootwear);
      onlyFootwear.push(name);
      const unique = Array.from(new Set(onlyFootwear));
      setSort({ ...sort, category: unique });
    } else {
      // selecting a non-footwear => if there is any footwear selected, clear them first
      const hasAnyFootwear = Array.from(selectedSet).some(isFootwear);
      let next = hasAnyFootwear
        ? [] // clear all if switching from footwear to non-footwear world
        : Array.from(selectedSet);
      next.push(name);
      const unique = Array.from(new Set(next.filter((n) => !isFootwear(n))));
      setSort({ ...sort, category: unique });
    }
  };

  const fetchItems = async (p, force = false) => {
    if (fetchedPagesRef.current.has(p) && !force) return;
    if (isFetchingRef.current) return;
    if (!hasMore && !force) return;

    isFetchingRef.current = true;
    setLoading(true);

    // UPDATED: category is now an array; send as comma-separated list
    const params = new URLSearchParams({
      category:
        Array.isArray(sort?.category) && sort.category.length > 0
          ? sort.category.join(",")
          : "",
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
      params.delete("tags");
    }

    const url = `${import.meta.env.VITE_GITHUB_URI}/api/items?${params.toString()}`;

    axios
      .get(url, { withCredentials: true })
      .then((res) => {
        if (res.data.length === 0) {
          setHasMore(false);
        } else if (res.data.length < 6) {
          setItems((items) => {
            const updated = [...items, ...res.data];
            return updated;
          });
          setHasMore(false);
        } else {
          setItems((items) => [...items, ...res.data]);
          setPage((prev) => {
            const next = prev + 1;
            pageRef.current = next;
            return next;
          });
          fetchedPagesRef.current.add(p);
        }
      })
      .catch((err) => console.error("Fetching error:", err))
      .finally(() => {
        isFetchingRef.current = false;
        setLoading(false);
      });
  };

  useEffect(() => {
    setHasMore(true);
    setLoading(false);
    setPage(0);
    setItems([]);
    isFetchingRef.current = false;
    fetchedPagesRef.current = new Set();

    const timer = setTimeout(() => {
      fetchItems(0, true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [sort.home]);

  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
    }
  }, [JSON.stringify(items)]);

  useEffect(() => {
    // console.log("sort from useffect", sort);
  }, [JSON.stringify(sort)]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setHasMore(true);
    setLoading(false);
    setPage(0);
    setItems([]);
    isFetchingRef.current = false;
    fetchedPagesRef.current = new Set();

    const timer = setTimeout(() => {
      fetchItems(0, true);
    }, 1000);
    return () => clearTimeout(timer);
  };

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    if (items.length == 0) {
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // UPDATED: no longer set a single category; use toggle
  const handleSelect = (category) => {
    toggleCategory(category);
    handleClose();
    setAnchorEl(null);
  };

  const handleSelectTag = (tags) => {};

  return (
    <>
      <div className="d-flex">
        {sort && sort.nav && (
          <div
            className=" col-3 d-flex flex-column px-5 bg-body-tertiary  "
            style={{
              display: "hidden",
              maxHeight: "100%",
              overflowY: "auto",
            }}
          >
            {
              <form className=" d-flex flex-column " onSubmit={handleFilterSubmit}>
                <button
                  type="submit"
                  className="btn rounded text-light w-50 align-self-end mb-3"
                  style={{ backgroundColor: "#713CC5" }}
                >
                  Apply Filters
                </button>

                {/* Gender */}
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

                {/* Age */}
                <div>
                  <h5
                    className="mb-3 category-title-hover"
                    onClick={() => {
                      setSort({
                        ...sort,
                        age: typeof sort.age === "string" ? false : !sort.age,
                      });
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

                {/* Categories */}
                <div>
                  <Typography
                    variant="h6"
                    onClick={handleClick}
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
                      ([categoryTitle, itemsArr], index) => (
                        <div
                          className="ps-2 d-flex flex-column align-items-center"
                          key={categoryTitle}
                        >
                          <Typography
                            className="text-center"
                            variant="subtitle1"
                            sx={{
                              fontWeight: "bold",
                              textTransform: "capitalize",
                            }}
                          >
                            {categoryTitle}
                          </Typography>
                          <div
                            style={{ display: "flex", flexWrap: "wrap" }}
                            className="d-flex justify-content-center"
                          >
                            {itemsArr.map((item) => (
                              <Chip
                                key={item}
                                label={item}
                                // UPDATED: active if included in array
                                color={
                                  Array.isArray(sort.category) &&
                                  sort.category.includes(item)
                                    ? "violet"
                                    : "default"
                                }
                                onClick={() => toggleCategory(item)}
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
                          gridTemplateColumns: "repeat(3, 1fr)",
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
                                toggleCategory(categoryTitle);
                              }}
                            >
                              <Typography
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // UPDATED: filter view by currently selected categories
                                  const selected =
                                    Array.isArray(sort.category) &&
                                    sort.category.length > 0
                                      ? sort.category
                                      : [categoryTitle];
                                  setItems((prev) =>
                                    prev.filter((it) =>
                                      selected.includes(it.category)
                                    )
                                  );
                                  setHasMore(false);
                                }}
                                className="text-center"
                                variant="subtitle1"
                                sx={{
                                  fontWeight: "bold",
                                  textTransform: "capitalize",
                                }}
                              >
                                {categoryTitle}
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

                {/* Size */}
                <div className="">
                  <div className="d-flex justify-content-between">
                    <h5
                      className="mb-3 category-title-hover"
                      onClick={() => {
                        setSort({
                          ...sort,
                          size:
                            typeof sort.size === "string" ? false : !sort.size,
                        });
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
                          cursor: "pointer",
                          color:
                            sort?.sizeSort === "ASC" ? "#8356C0" : "#C2C3C4",
                        }}
                      ></i>
                      <i
                        className="nav-link bi-arrow-down VioletCred"
                        onClick={() => {
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
                        }}
                        style={{
                          fontSize: "30px",
                          cursor: "pointer",
                          color:
                            sort?.sizeSort === "DESC" ? "#8356C0" : "#C2C3C4",
                        }}
                      ></i>
                    </div>
                  </div>

                  {Array.isArray(sort.category) &&
                  sort.category.some((c) => footwearCategories.includes(c)) ? (
                    <Input
                      sx={{
                        "&:after": { borderBottom: "2px solid #8356C0" },
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
                    sort?.category?.includes("Babywear") ||
                    sort?.category?.includes("Kidwear") ||
                    sort?.category?.includes("Teenwear") ? (
                    <Select
                      sx={{
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#8356C0",
                        },
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": { borderColor: "#8356C0" },
                        },
                      }}
                      className="form-control mb-5 align-content-center"
                      MenuProps={{
                        PaperProps: {
                          style: { maxHeight: 300, overflowY: "auto" },
                        },
                        MenuListProps: {
                          style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "8px",
                          },
                        },
                      }}
                      labelId="size-select-label"
                      value={sort && sort.size}
                      disabled={sort.size === false}
                      onChange={(e) =>
                        setSort({ ...sort, size: e.target.value })
                      }
                    >
                      {sort?.category?.includes("Babywear")
                        ? babySizes.map((s) => (
                            <MenuItem key={s} value={s}>
                              {s}
                            </MenuItem>
                          ))
                        : sort?.category?.includes("Kidwear")
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
                        color: "#8356C0",
                        "& .MuiSlider-thumb": {
                          "&:hover, &.Mui-focusVisible, &.Mui-active": {
                            boxShadow: "0 0 0 8px #8356C0)",
                          },
                        },
                      }}
                      className=" w-100 mb-5"
                      disabled={sort.size === false}
                      value={sizeLabels.indexOf(sort.size)}
                      onChange={(e, newValue) => {
                        setSort({ ...sort, size: sizeLabels[newValue] });
                      }}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => sizeLabels[value]}
                      marks={sizeLabels.map((label, index) => ({
                        value: index,
                        label,
                      }))}
                      step={1}
                      min={0}
                      max={sizeLabels.length - 1}
                    />
                  )}
                </div>

                {/* Brand */}
                <div>
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
                      }}
                    >
                      Brand
                    </h5>
                  </div>

                  <Input
                    sx={{ "&:after": { borderBottom: "2px solid #8356C0" } }}
                    className="form-control w-100 mb-3"
                    type="text"
                    disabled={sort.brand === false}
                    placeholder="Brand"
                    onChange={(e) => setSort({ ...sort, brand: e.target.value })}
                  />
                </div>

                {/* Price */}
                <div>
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
                          cursor: "pointer",
                          color:
                            sort?.priceSort === "ASC" ? "#8356C0" : "#C2C3C4",
                        }}
                      ></i>
                      <i
                        className="nav-link bi-arrow-down VioletCred"
                        onClick={() => {
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
                        }}
                        style={{
                          fontSize: "30px",
                          cursor: "pointer",
                          color:
                            sort?.priceSort === "DESC" ? "#8356C0" : "#C2C3C4",
                        }}
                      ></i>
                    </div>
                  </div>
                  <div className="d-flex mb-3 gap-5">
                    <TextField
                      label="Lowest"
                      color="violet"
                      sx={{ "&:after": { borderBottom: "2px solid #8356C0" } }}
                      id="min-price"
                      className="form-control w-100"
                      type="number"
                      placeholder="Lowest"
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        const max = sort?.maxP || 1000;
                        const minLimit = 0;

                        if (!isNaN(value) && value >= minLimit && value <= max) {
                          setSort({ ...sort, minP: value });
                        } else if (e.target.value === "") {
                          setSort({ ...sort, minP: "" });
                        }
                      }}
                      value={sort?.minP || ""}
                      inputProps={{ min: 0, max: sort?.maxP || 1000 }}
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
                          setSort({ ...sort, maxP: "" });
                        }
                      }}
                      inputProps={{ min: sort?.minP || 0, max: 1000 }}
                      sx={{ "&:after": { borderBottom: "2px solid #8356C0" } }}
                      id="max-price"
                      className="form-control w-100"
                      type="number"
                      placeholder="Highest"
                      disabled={sort.minP === false}
                    />
                  </div>
                </div>

                {/* Condition */}
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

                {/* Tags */}
                <Typography
                  variant="h6"
                  onClick={() =>
                    setSort({
                      ...sort,
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
                            onClick={() => {
                              const isSelected =
                                sort && sort.tags && sort.tags.includes(tag);
                              const updatedTags = isSelected
                                ? sort.tags.filter((t) => t !== tag)
                                : [...sort.tags, tag];
                              setSort({ ...sort, tags: updatedTags });
                              handleSelectTag(updatedTags);
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
        <div className="container py-5 col-10">
          <div className="">
            <div
              className="scroll-container    d-flex flex-wrap gap-3 
   justify-content-center  h-100"
              id="scrollableDiv"
            >
              <InfiniteScroll
                className=""
                dataLength={items.length}
                next={() => fetchItems(pageRef.current)}
                hasMore={hasMore}
                loader={
                  <SyncLoader
                    className="text-center mt-3"
                    color="#5C2D9A"
                    loading
                    margin={10}
                    speedMultiplier={0.5}
                  />
                }
                scrollableTarget="scrollableDiv"
              >
                <div
                  className="d-flex flex-wrap gap-3"
                  style={{ minHeight: "100vh" }}
                >
                  {items.map((item) => (
                    <ItemCard
                      userId={user?.id}
                      fName={user?.fName}
                      lName={user?.lName}
                      profilePic={user?.profilePic}
                      item={item}
                      setOpenModalLog={setOpenModalLog}
                      setOpenModalReg={setOpenModalReg}
                      key={item.id}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
