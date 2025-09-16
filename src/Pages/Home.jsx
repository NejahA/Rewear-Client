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
  Box,
  Grid,
  Skeleton,
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
  "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y", "10-12Y",
];
const teenSizes = ["12-14Y", "14-16Y", "16-18Y"];
const babySizes = ["0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M"];
const tagOptions = [
  "Eco-friendly", "Sustainable", "Vintage", "Minimal", "Streetwear", "Luxury", 
  "Formal", "Casual", "Colorful", "Neutral", "Trendy", "Classic", "90s", "Y2K", 
  "Preppy", "Boho", "Sporty", "Plus Size",
];

// Custom hook for responsive design
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile, isTablet, isDesktop };
};

// Skeleton loader component for better UX
const ItemSkeleton = ({ isMobile }) => (
  <div className={`${isMobile ? 'col-6 mb-3' : 'col-lg-3 col-md-4 col-sm-6 mb-4'}`}>
    <Skeleton 
      variant="rectangular" 
      height={isMobile ? 200 : 250} 
      className="rounded mb-2" 
    />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" width="40%" />
  </div>
);

const Home = ({ setOpenModalLog, setOpenModalReg, sort, setSort, logged }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const fetchedPagesRef = useRef(new Set());
  const pageRef = useRef(0);
  const [openCategory, setOpenCategory] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState();
  const [categoryCounts, setCategoryCounts] = useState();
  const location = useLocation();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // State for temporary filters
  const [tempFilters, setTempFilters] = useState({ ...sort });

  // Update tempFilters when sort changes (from outside)
  useEffect(() => {
    setTempFilters({ ...sort });
  }, [sort]);

  // Ensure tempFilters.category is an array at startup
  useEffect(() => {
    if (tempFilters && !Array.isArray(tempFilters.category)) {
      setTempFilters({ ...tempFilters, category: tempFilters.category ? [tempFilters.category] : [] });
    }
  }, []);

  useEffect(() => {
    axios
      .get("" + import.meta.env.VITE_VERCEL_URI + "/api/users/logged")
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
    setTempFilters({ ...tempFilters, size: newValue });
  };

  // Helper to determine if a name is footwear
  const isFootwear = (name) => footwearCategories.includes(name);

  // Multi-select toggle enforcing the rule
  const toggleCategory = (name) => {
    const current = Array.isArray(tempFilters.category) ? tempFilters.category : [];
    const selectedSet = new Set(current);
    const alreadySelected = selectedSet.has(name);

    if (alreadySelected) {
      selectedSet.delete(name);
      setTempFilters({ ...tempFilters, category: Array.from(selectedSet) });
      return;
    }

    if (isFootwear(name)) {
      const onlyFootwear = Array.from(selectedSet).filter(isFootwear);
      onlyFootwear.push(name);
      const unique = Array.from(new Set(onlyFootwear));
      setTempFilters({ ...tempFilters, category: unique });
    } else {
      const hasAnyFootwear = Array.from(selectedSet).some(isFootwear);
      let next = hasAnyFootwear ? [] : Array.from(selectedSet);
      next.push(name);
      const unique = Array.from(new Set(next.filter((n) => !isFootwear(n))));
      setTempFilters({ ...tempFilters, category: unique });
    }
  };

  // Handler for gender change
  const handleGenderChange = (e) => {
    setTempFilters({ ...tempFilters, gender: e.target.value });
  };

  // Handler for age change
  const handleAgeChange = (e) => {
    setTempFilters({ ...tempFilters, age: e.target.value });
  };

  // Handler for condition change
  const handleConditionChange = (e) => {
    setTempFilters({ ...tempFilters, condition: e.target.value });
  };

  // Handler for brand change
  const handleBrandChange = (e) => {
    setTempFilters({ ...tempFilters, brand: e.target.value });
  };

  // Handler for min price change
  const handleMinPriceChange = (e) => {
    const value = parseInt(e.target.value, 10);
    const max = tempFilters?.maxP || 1000;
    const minLimit = 0;

    if (!isNaN(value) && value >= minLimit && value <= max) {
      setTempFilters({ ...tempFilters, minP: value });
    } else if (e.target.value === "") {
      setTempFilters({ ...tempFilters, minP: "" });
    }
  };

  // Handler for max price change
  const handleMaxPriceChange = (e) => {
    const value = parseInt(e.target.value, 10);
    const min = tempFilters?.minP || 0;
    const max = 1000;

    if (!isNaN(value) && value >= min && value <= max) {
      setTempFilters({ ...tempFilters, maxP: value });
    } else if (e.target.value === "") {
      setTempFilters({ ...tempFilters, maxP: "" });
    }
  };

  // Handler for size change
  const handleSizeChange = (e, newValue) => {
    setTempFilters({ ...tempFilters, size: sizeLabels[newValue] });
  };

  // Handler for search change
  const handleSearchChange = (e) => {
    setTempFilters({ ...tempFilters, search: e.target.value });
  };

  // Handler for tag selection
  const handleTagSelection = (tag) => {
    const isSelected = tempFilters.tags && tempFilters.tags.includes(tag);
    const updatedTags = isSelected
      ? tempFilters.tags.filter((t) => t !== tag)
      : [...(tempFilters.tags || []), tag];
    setTempFilters({ ...tempFilters, tags: updatedTags });
  };

  // Modified fetchItems to accept filters as parameter
  const fetchItems = async (p, filters, force = false) => {
    if (fetchedPagesRef.current.has(p) && !force) return;
    if (isFetchingRef.current) return;
    if (!hasMore && !force) return;

    isFetchingRef.current = true;
    setLoading(true);

    const params = new URLSearchParams({
      category:
        Array.isArray(filters?.category) && filters.category.length > 0
          ? filters.category.join(",")
          : "",
      gender: filters?.gender || "",
      age: filters?.age || "",
      q: filters?.search || "",
      page: p,
      condition: filters?.condition || "",
      size: filters?.size || "",
      minP: filters?.minP || "",
      maxP: filters?.maxP || "",
      priceSort: filters?.priceSort || "",
      sizeSort: filters?.sizeSort || "",
      brand: filters?.brand || "",
    });
    
    if (filters?.tags && filters.tags.length > 0) {
      params.set("tags", filters.tags.join(","));
    } else {
      params.delete("tags");
    }

    const url = `${import.meta.env.VITE_VERCEL_URI}/api/items?${params.toString()}`;

    try {
      const res = await axios.get(url, { withCredentials: true });
      
      if (res.data.length === 0) {
        setHasMore(false);
      } else if (res.data.length < 6) {
        setItems((items) => [...items, ...res.data]);
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
    } catch (err) {
      console.error("Fetching error:", err);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    setHasMore(true);
    setLoading(false);
    setPage(0);
    setItems([]);
    setInitialLoading(true);
    isFetchingRef.current = false;
    fetchedPagesRef.current = new Set();

    const timer = setTimeout(() => {
      fetchItems(0, sort, true);
    }, 300); // Reduced delay for better UX
    
    return () => clearTimeout(timer);
  }, [sort.home, JSON.stringify(sort)]);

  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
    }
  }, [JSON.stringify(items)]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    // Apply the temporary filters to the actual sort state
    setSort({ ...tempFilters });
    
    setHasMore(true);
    setLoading(false);
    setPage(0);
    setItems([]);
    setInitialLoading(true);
    isFetchingRef.current = false;
    fetchedPagesRef.current = new Set();

    const timer = setTimeout(() => {
      fetchItems(0, tempFilters, true);
    }, 300);
    
    if (!isDesktop) {
      setSort({ ...tempFilters, nav: false });
    }
    
    return () => clearTimeout(timer);
  };

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    if (items.length == 0) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (category) => {
    toggleCategory(category);
    handleClose();
    setAnchorEl(null);
  };

  // Calculate grid columns based on screen size
  const getGridColumns = () => {
    if (isMobile) return 2; // 2 columns on mobile
    if (isTablet) return 3; // 3 columns on tablet
    return 4; // 4 columns on desktop
  };

  // Custom loader component
  const LoadingComponent = () => (
    <div className="w-100 d-flex flex-column align-items-center py-4">
      <SyncLoader
        color="#8356C0"
        loading
        size={8}
        margin={4}
        speedMultiplier={0.7}
      />
      <p className="mt-2 text-muted small">Chargement...</p>
    </div>
  );

  // End message component
  const EndMessage = () => (
    <div className="w-100 text-center py-4">
      <p className="text-muted">
        {items.length === 0 ? "Aucun article trouvé" : "Vous avez vu tous les articles"}
      </p>
    </div>
  );

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="d-flex">
        {/* Sidebar Filters - Desktop/Tablet */}
        {tempFilters && tempFilters.nav && (
          <div
            className={`${isDesktop ? 'col-lg-3' : 'col-12'} d-flex flex-column px-3 bg-white border-end`}
            style={{
              maxHeight: "100vh",
              overflowY: "auto",
              position: isDesktop ? "sticky" : "relative",
              top: 0,
            }}
          >
            <form className="d-flex flex-column py-3" onSubmit={handleFilterSubmit}>
              {/* Mobile close button */}
              {!isDesktop && (
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 fw-bold">Filtres</h5>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setTempFilters({ ...tempFilters, nav: false })}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="btn text-white w-100 mb-4 py-2 fw-bold"
                style={{ backgroundColor: "#8356C0", borderRadius: "8px" }}
              >
                Appliquer les filtres
              </button>

              {/* Gender */}
              <div className="mb-4">
                <h6
                  className="mb-3 fw-bold"
                  style={{ cursor: "pointer", color: "#8356C0" }}
                  onClick={() => {
                    setTempFilters({
                      ...tempFilters,
                      gender: typeof tempFilters.gender === "string" ? false : !tempFilters.gender,
                    });
                  }}
                >
                  Genre
                </h6>
                <RadioGroup
                  value={tempFilters && tempFilters.gender}
                  onChange={handleGenderChange}
                  className="d-flex flex-column gap-1"
                >
                  {genderOptions.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={
                        <Radio
                          disabled={tempFilters.gender === false}
                          sx={{
                            "&.Mui-checked": { color: "#8356C0" },
                            padding: isMobile ? "8px" : "9px",
                          }}
                        />
                      }
                      label={option}
                      sx={{ margin: 0 }}
                    />
                  ))}
                </RadioGroup>
              </div>

              {/* Age */}
              <div className="mb-4">
                <h6
                  className="mb-3 fw-bold"
                  style={{ cursor: "pointer", color: "#8356C0" }}
                  onClick={() => {
                    setTempFilters({
                      ...tempFilters,
                      age: typeof tempFilters.age === "string" ? false : !tempFilters.age,
                    });
                  }}
                >
                  Âge
                </h6>
                <RadioGroup
                  value={tempFilters && tempFilters.age}
                  onChange={handleAgeChange}
                  className="d-flex flex-column gap-1"
                >
                  {ageOptions.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={
                        <Radio
                          disabled={tempFilters.age === false}
                          sx={{
                            "&.Mui-checked": { color: "#8356C0" },
                            padding: isMobile ? "8px" : "9px",
                          }}
                        />
                      }
                      label={option}
                      sx={{ margin: 0 }}
                    />
                  ))}
                </RadioGroup>
              </div>

              {/* Categories */}
              <div className="mb-4">
                <h6
                  className="mb-3 fw-bold"
                  style={{ cursor: "pointer", color: "#8356C0" }}
                  onClick={handleClick}
                >
                  Catégories
                </h6>

                <div
                  className="category-list mb-3"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {Object.entries(categories).map(([categoryTitle, itemsArr], index) => (
                    <div key={categoryTitle} className="mb-3">
                      <Typography
                        variant="subtitle2"
                        className="fw-bold mb-2 text-muted"
                        sx={{ textTransform: "uppercase", fontSize: "0.75rem" }}
                      >
                        {categoryTitle}
                      </Typography>
                      <div className="d-flex flex-wrap gap-1">
                        {itemsArr.map((item) => (
                          <Chip
                            key={item}
                            label={item}
                            size={isMobile ? "small" : "medium"}
                            color={
                              Array.isArray(tempFilters.category) && tempFilters.category.includes(item)
                                ? "primary"
                                : "default"
                            }
                            onClick={() => toggleCategory(item)}
                            sx={{
                              fontSize: isMobile ? "0.7rem" : "0.8rem",
                              backgroundColor: Array.isArray(tempFilters.category) && tempFilters.category.includes(item) 
                                ? "#8356C0" : "#f5f5f5",
                              color: Array.isArray(tempFilters.category) && tempFilters.category.includes(item) 
                                ? "white" : "#666",
                              "&:hover": {
                                backgroundColor: Array.isArray(tempFilters.category) && tempFilters.category.includes(item) 
                                  ? "#7043a3" : "#e0e0e0",
                              }
                            }}
                          />
                        ))}
                      </div>
                      {index < Object.entries(categories).length - 1 && (
                        <Divider className="mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Size Section */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6
                    className="mb-0 fw-bold"
                    style={{ cursor: "pointer", color: "#8356C0" }}
                    onClick={() => {
                      setTempFilters({
                        ...tempFilters,
                        size: typeof tempFilters.size === "string" ? false : !tempFilters.size,
                      });
                    }}
                  >
                    Taille
                  </h6>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => {
                        setTempFilters({
                          ...tempFilters,
                          priceSort: "",
                          sizeSort: tempFilters.sizeSort === "ASC" ? "" : "ASC",
                        });
                      }}
                      style={{
                        color: tempFilters?.sizeSort === "ASC" ? "#8356C0" : "#6c757d",
                        backgroundColor: "transparent",
                        border: "none",
                        padding: "4px",
                      }}
                    >
                      <i className="bi bi-arrow-up"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => {
                        setTempFilters({
                          ...tempFilters,
                          priceSort: "",
                          sizeSort: tempFilters.sizeSort === "DESC" ? "" : "DESC",
                        });
                      }}
                      style={{
                        color: tempFilters?.sizeSort === "DESC" ? "#8356C0" : "#6c757d",
                        backgroundColor: "transparent",
                        border: "none",
                        padding: "4px",
                      }}
                    >
                      <i className="bi bi-arrow-down"></i>
                    </button>
                  </div>
                </div>

                {/* Size input/selector based on category */}
                {Array.isArray(tempFilters.category) &&
                tempFilters.category.some((c) => footwearCategories.includes(c)) ? (
                  <TextField
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    type="number"
                    disabled={tempFilters.size === false}
                    placeholder="Pointure (ex: 40)"
                    onChange={(e) => setTempFilters({ ...tempFilters, size: e.target.value })}
                    sx={{
                      "& label.Mui-focused": { color: "#8356C0" },
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": { borderColor: "#8356C0" },
                      },
                    }}
                  />
                ) : tempFilters?.gender === "Kids" ||
                  tempFilters?.category?.includes("Babywear") ||
                  tempFilters?.category?.includes("Kidswear") ||
                  tempFilters?.category?.includes("Teenswear") ? (
                  <Select
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    disabled={tempFilters.size === false}
                    value={tempFilters && tempFilters.size}
                    onChange={(e) => setTempFilters({ ...tempFilters, size: e.target.value })}
                    sx={{
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#8356C0",
                      },
                    }}
                  >
                    {(tempFilters?.category?.includes("Babywear") ? babySizes :
                      tempFilters?.category?.includes("Kidswear") ? kidsSizes : teenSizes
                    ).map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                ) : (
                  <Slider
                    disabled={tempFilters.size === false}
                    value={sizeLabels.indexOf(tempFilters.size) || 0}
                    onChange={handleSizeChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => sizeLabels[value]}
                    marks={sizeLabels.map((label, index) => ({
                      value: index,
                      label: label,
                    }))}
                    step={1}
                    min={0}
                    max={sizeLabels.length - 1}
                    sx={{
                      color: "#8356C0",
                      height: isMobile ? 6 : 8,
                      "& .MuiSlider-thumb": {
                        width: isMobile ? 16 : 20,
                        height: isMobile ? 16 : 20,
                        "&:hover, &.Mui-focusVisible, &.Mui-active": {
                          boxShadow: "0 0 0 8px rgba(131, 86, 192, 0.16)",
                        },
                      },
                    }}
                  />
                )}
              </div>

              {/* Brand */}
              <div className="mb-4">
                <h6
                  className="mb-3 fw-bold"
                  style={{ cursor: "pointer", color: "#8356C0" }}
                  onClick={() => {
                    setTempFilters({
                      ...tempFilters,
                      brand: typeof tempFilters.brand === "string" ? false : !tempFilters.brand,
                    });
                  }}
                >
                  Marque
                </h6>
                <TextField
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  type="text"
                  disabled={tempFilters.brand === false}
                  placeholder="Marque"
                  onChange={handleBrandChange}
                  sx={{
                    "& label.Mui-focused": { color: "#8356C0" },
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": { borderColor: "#8356C0" },
                    },
                  }}
                />
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6
                    className="mb-0 fw-bold"
                    style={{ cursor: "pointer", color: "#8356C0" }}
                    onClick={() => {
                      setTempFilters({
                        ...tempFilters,
                        minP: typeof tempFilters.minP === "number" ? false : !tempFilters.minP,
                        maxP: typeof tempFilters.maxP === "number" ? false : !tempFilters.minP,
                      });
                    }}
                  >
                    Prix
                  </h6>
                  <div className="d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => {
                        setTempFilters({
                          ...tempFilters,
                          sizeSort: "",
                          priceSort: tempFilters.priceSort === "ASC" ? "" : "ASC",
                        });
                      }}
                      style={{
                        color: tempFilters?.priceSort === "ASC" ? "#8356C0" : "#6c757d",
                        backgroundColor: "transparent",
                        border: "none",
                        padding: "4px",
                      }}
                    >
                      <i className="bi bi-arrow-up"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => {
                        setTempFilters({
                          ...tempFilters,
                          sizeSort: "",
                          priceSort: tempFilters.priceSort === "DESC" ? "" : "DESC",
                        });
                      }}
                      style={{
                        color: tempFilters?.priceSort === "DESC" ? "#8356C0" : "#6c757d",
                        backgroundColor: "transparent",
                        border: "none",
                        padding: "4px",
                      }}
                    >
                      <i className="bi bi-arrow-down"></i>
                    </button>
                  </div>
                </div>
                
                <div className="d-flex gap-2 mb-3">
                  <TextField
                    label="Min"
                    size={isMobile ? "small" : "medium"}
                    type="number"
                    placeholder="Min"
                    onChange={handleMinPriceChange}
                    value={tempFilters?.minP || ""}
                    inputProps={{ min: 0, max: tempFilters?.maxP || 1000 }}
                    disabled={tempFilters.minP === false}
                    sx={{
                      "& label.Mui-focused": { color: "#8356C0" },
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": { borderColor: "#8356C0" },
                      },
                    }}
                  />
                  <TextField
                    label="Max"
                    size={isMobile ? "small" : "medium"}
                    value={tempFilters?.maxP || ""}
                    onChange={handleMaxPriceChange}
                    inputProps={{ min: tempFilters?.minP || 0, max: 1000 }}
                    type="number"
                    placeholder="Max"
                    disabled={tempFilters.minP === false}
                    sx={{
                      "& label.Mui-focused": { color: "#8356C0" },
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": { borderColor: "#8356C0" },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="mb-4">
                <h6
                  className="mb-3 fw-bold"
                  style={{ cursor: "pointer", color: "#8356C0" }}
                  onClick={() => {
                    setTempFilters({
                      ...tempFilters,
                      condition: typeof tempFilters.condition === "string" ? false : !tempFilters.condition,
                    });
                  }}
                >
                  État
                </h6>
                <RadioGroup
                  value={tempFilters && tempFilters.condition}
                  onChange={handleConditionChange}
                  className="d-flex flex-column gap-1"
                >
                  {conditionOptions.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={
                        <Radio
                          disabled={tempFilters.condition === false}
                          sx={{
                            "&.Mui-checked": { color: "#8356C0" },
                            padding: isMobile ? "8px" : "9px",
                          }}
                        />
                      }
                      label={option}
                      sx={{ margin: 0 }}
                    />
                  ))}
                </RadioGroup>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <h6
                  className="mb-3 fw-bold"
                  style={{ cursor: "pointer", color: "#8356C0" }}
                  onClick={() =>
                    setTempFilters({
                      ...tempFilters,
                      showTags: !tempFilters.showTags,
                      tags: tempFilters.showTags ? [] : tempFilters.tags || [],
                    })
                  }
                >
                  Tags
                </h6>

                {tempFilters && tempFilters.showTags && (
                  <div
                    className="d-flex flex-wrap gap-1"
                    style={{
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                  >
                    {tagOptions.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size={isMobile ? "small" : "medium"}
                        color={
                          tempFilters && tempFilters.tags && tempFilters.tags.includes(tag)
                            ? "primary"
                            : "default"
                        }
                        onClick={() => handleTagSelection(tag)}
                        sx={{
                          fontSize: isMobile ? "0.7rem" : "0.8rem",
                          backgroundColor: tempFilters && tempFilters.tags && tempFilters.tags.includes(tag) 
                            ? "#8356C0" : "#f5f5f5",
                          color: tempFilters && tempFilters.tags && tempFilters.tags.includes(tag) 
                            ? "white" : "#666",
                          "&:hover": {
                            backgroundColor: tempFilters && tempFilters.tags && tempFilters.tags.includes(tag) 
                              ? "#7043a3" : "#e0e0e0",
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        )}
        
        {/* Main Content Area */}
        <div 
          className={`${tempFilters && tempFilters.nav && isDesktop ? 'col-lg-9' : 'col-12'} ${
            tempFilters && tempFilters.nav && !isDesktop ? 'd-none' : ''
          }`}
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <div>
          <div className="container-fluid px-3 py-4">
            {/* Loading skeletons for initial load */}
            {initialLoading && (
              <div className="row">
                {Array.from({ length: getGridColumns() * 2 }).map((_, index) => (
                  <ItemSkeleton key={index} isMobile={isMobile} />
                ))}
              </div>
            )}

            {/* Infinite Scroll Content */}
            {!initialLoading && (
              <InfiniteScroll
                dataLength={items.length}
                next={() => fetchItems(pageRef.current, sort)}
                hasMore={hasMore}
                loader={<LoadingComponent />}
                endMessage={<EndMessage />}
                scrollThreshold={0.8} // Load more when 80% scrolled
                style={{ overflow: 'visible' }} // Prevent scroll issues
              >
                {/* Responsive Grid Layout */}
                <div className="row g-3">
                  {items && items.map((item, index) => (
                    <div 
                      key={`${item.id}-${index}`}
                      className={`${
                        isMobile 
                          ? 'col-6' // 2 columns on mobile
                          : isTablet 
                            ? 'col-md-4' // 3 columns on tablet
                            : 'col-lg-3' // 4 columns on desktop
                      }`}
                      style={{
                        minHeight: isMobile ? '280px' : '320px',
                      }}
                    >
                      <ItemCard
                        userId={user?.id}
                        fName={user?.fName}
                        lName={user?.lName}
                        profilePic={user?.profilePic}
                        item={item}
                        setOpenModalLog={setOpenModalLog}
                        setOpenModalReg={setOpenModalReg}
                        isMobile={isMobile}
                      />
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {!loading && !initialLoading && items.length === 0 && (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5">
                    <div className="text-center">
                      <i 
                        className="bi bi-search" 
                        style={{ fontSize: "4rem", color: "#8356C0", opacity: 0.3 }}
                      ></i>
                      <h5 className="mt-3 text-muted">Aucun article trouvé</h5>
                      <p className="text-muted">
                        Essayez de modifier vos filtres de recherche
                      </p>
                      <button
                        className="btn mt-2"
                        style={{ backgroundColor: "#8356C0", color: "white" }}
                        onClick={() => {
                          setSort({
                            ...sort,
                            category: [],
                            gender: "",
                            age: "",
                            search: "",
                            condition: "",
                            size: "",
                            minP: "",
                            maxP: "",
                            brand: "",
                            tags: [],
                          });
                          setTempFilters({
                            ...tempFilters,
                            category: [],
                            gender: "",
                            age: "",
                            search: "",
                            condition: "",
                            size: "",
                            minP: "",
                            maxP: "",
                            brand: "",
                            tags: [],
                          });
                        }}
                      >
                        Réinitialiser les filtres
                      </button>
                    </div>
                  </div>
                )}
              </InfiniteScroll>
            )}
          </div>
        </div>
      </div>
            
      {/* Mobile Filter Button - Fixed at bottom */}
      {!isDesktop && !tempFilters?.nav && (
        <div 
          className="position-fixed bottom-0 start-0 end-0 p-3 bg-white border-top"
          style={{ zIndex: 1000 }}
        >
          <button
            className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-3 fw-bold"
            style={{ 
              backgroundColor: "#8356C0", 
              color: "white",
              borderRadius: "12px",
              border: "none"
            }}
            onClick={() => setTempFilters({ ...tempFilters, nav: true })}
          >
            <i className="bi bi-funnel"></i>
            <span>Filtres</span>
          </button>
        </div>
      )}

      {/* Category Count Menu */}
      {categoryCounts && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: isMobile ? '90vw' : 450,
              maxWidth: '450px',
              maxHeight: 300,
            },
          }}
          MenuListProps={{
            style: {
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
              gap: "4px",
            },
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          {Object.entries(categoryCounts).map(([categoryTitle, count], index) => (
            <MenuItem
              key={categoryTitle}
              onClick={() => toggleCategory(categoryTitle)}
              sx={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                minHeight: "60px",
                justifyContent: "center"
              }}
            >
              <Typography
                variant="subtitle2"
                className="fw-bold text-center"
                sx={{ 
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  textTransform: "capitalize" 
                }}
              >
                {categoryTitle}
              </Typography>
              <Chip
                label={count}
                size="small"
                sx={{ 
                  backgroundColor: "#8356C0", 
                  color: "white",
                  fontSize: "0.7rem",
                  height: "20px",
                  mt: 0.5
                }}
              />
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
    </div>
  );
};

export default Home;