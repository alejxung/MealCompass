import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    category: [],
    services: [],
    parking: [],
    price: [],
    ribbonType: [],
    michelinType: [],
  });
  const [filterOptions, setFilterOptions] = useState({
    category: [],
    services: [],
    parking: [],
    price: [],
    ribbonType: [],
    michelinType: [],
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/restaurants/filters"
        );
        setFilterOptions(response.data);
      } catch (error) {
        console.error("There was an error fetching the filter options!", error);
      }
    };
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (type, value) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (Array.isArray(newFilters[type])) {
        newFilters[type] = newFilters[type].includes(value)
          ? newFilters[type].filter((item) => item !== value)
          : [...newFilters[type], value];
      } else {
        newFilters[type] = newFilters[type] === value ? "" : value;
      }
      return newFilters;
    });
  };

  const searchRestaurant = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/restaurants/search",
        {
          params: {
            name: query,
            category: filters.category.join(","),
            services: filters.services.join(","),
            parking: filters.parking.join(","),
            price: filters.price.join(","),
            ribbonType: filters.ribbonType.join(","),
            michelinType: filters.michelinType.join(","),
          },
        }
      );
      setResults(response.data);
    } catch (error) {
      console.error("There was an error fetching the data!", error);
      setResults([]);
    }
  };

  return (
    <div>
      <h1>Restaurant Search</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a restaurant"
      />
      <button onClick={searchRestaurant}>Search</button>

      <div>
        <h4>Category</h4>
        {filterOptions.category.map((category) => (
          <button
            key={category}
            onClick={() => handleFilterChange("category", category)}
            className={filters.category.includes(category) ? "selected" : ""}
          >
            {category}
          </button>
        ))}
      </div>
      <div>
        <h4>Services</h4>
        {filterOptions.services.map((service) => (
          <button
            key={service}
            onClick={() => handleFilterChange("services", service)}
            className={filters.services.includes(service) ? "selected" : ""}
          >
            {service}
          </button>
        ))}
      </div>
      <div>
        <h4>Parking</h4>
        {filterOptions.parking.map((parking) => (
          <button
            key={parking}
            onClick={() => handleFilterChange("parking", parking)}
            className={filters.parking.includes(parking) ? "selected" : ""}
          >
            {parking}
          </button>
        ))}
      </div>
      <div>
        <h4>Price</h4>
        {filterOptions.price.map((price) => (
          <button
            key={price}
            onClick={() => handleFilterChange("price", price)}
            className={filters.price.includes(price) ? "selected" : ""}
          >
            {price}
          </button>
        ))}
      </div>
      <div>
        <h4>Ribbon Type</h4>
        {filterOptions.ribbonType.map((ribbon) => (
          <button
            key={ribbon}
            onClick={() => handleFilterChange("ribbonType", ribbon)}
            className={filters.ribbonType.includes(ribbon) ? "selected" : ""}
          >
            {ribbon}
          </button>
        ))}
      </div>
      <div>
        <h4>Michelin Type</h4>
        {filterOptions.michelinType.map((michelin) => (
          <button
            key={michelin}
            onClick={() => handleFilterChange("michelinType", michelin)}
            className={
              filters.michelinType.includes(michelin) ? "selected" : ""
            }
          >
            {michelin}
          </button>
        ))}
      </div>

      <ul>
        {results.length > 0 ? (
          results.map((restaurant, index) => (
            <li key={index}>
              {index + 1}. {restaurant.name}
            </li>
          ))
        ) : (
          <li>No results found</li>
        )}
      </ul>
    </div>
  );
}

export default App;
