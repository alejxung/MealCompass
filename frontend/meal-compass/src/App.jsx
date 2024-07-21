import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Map from "./Map";

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
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });

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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error fetching location", error);
      }
    );
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
            latitude: location.latitude,
            longitude: location.longitude,
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
    <>
      <div className="container">
        <div className="map">
          <Map center={location} locations={results} />
        </div>
        <header id="header">
          <div className="logo-box">
            <i className="bi bi-compass-fill"></i> {/* Logo icon */}
          </div>
          <nav className="navbar">
            <ul className="list-navbar">
              <li className="search">
                <button type="button" className="btn-navbar">
                  <i className="bi bi-search"></i> {/* Search icon */}
                  <span className="navbar-text"> Search </span>
                </button>
              </li>
              <li className="directions">
                <button type="button" className="btn-navbar">
                  <i className="bi bi-arrow-right"></i> {/* Directions icon */}
                  <span className="navbar-text"> Directions </span>
                </button>
              </li>
              <li className="favorites">
                <button type="button" className="btn-navbar">
                  <i className="bi bi-heart"></i> {/* Favorites icon */}
                  <span className="navbar-text"> Favorites </span>
                </button>
              </li>
              <li className="bus">
                <button type="button" className="btn-navbar">
                  <i className="bi bi-bus-front"></i> {/* Bus icon */}
                  <span className="navbar-text"> Bus </span>
                </button>
              </li>
              <li className="subway">
                <button type="button" className="btn-navbar">
                  <i className="bi bi-train-front"></i> {/* Subway icon */}
                  <span className="navbar-text"> Subway </span>
                </button>
              </li>
            </ul>
          </nav>
          <div className="user">User</div>
        </header>
        <div className="app">
          <div id="toggle" className="toggle-open">
            <div className="search-component">
              <div className="search-section">
                <div className="search-bar">
                  <button
                    type="button"
                    onClick={searchRestaurant}
                    className="btn-search"
                  >
                    🔍
                  </button>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a restaurant"
                    className="search-input"
                  />
                  <button type="button" className="btn-clear"></button>
                </div>
              </div>
              <div className="tag-section">
                {/* <h4>Category</h4>
                <div className="tag-cat">
                  {filterOptions.category.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleFilterChange("category", category)}
                      className={`tag ${
                        filters.category.includes(category) ? "selected" : ""
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div> */}
                <h4>Ribbon Type</h4>
                <div className="tag-cat">
                  {filterOptions.ribbonType.map((ribbon) => (
                    <button
                      key={ribbon}
                      onClick={() => handleFilterChange("ribbonType", ribbon)}
                      className={`tag
                        ${
                          filters.ribbonType.includes(ribbon) ? "selected" : ""
                        }`}
                    >
                      {ribbon}
                    </button>
                  ))}
                </div>
                <h4>Michelin Type</h4>
                <div className="tag-cat">
                  {filterOptions.michelinType.map((michelin) => (
                    <button
                      key={michelin}
                      onClick={() =>
                        handleFilterChange("michelinType", michelin)
                      }
                      className={`tag
                        ${
                          filters.michelinType.includes(michelin)
                            ? "selected"
                            : ""
                        }`}
                    >
                      {michelin}
                    </button>
                  ))}
                </div>
                <h4>Price</h4>
                <div className="tag-cat">
                  {filterOptions.price.map((price) => (
                    <button
                      key={price}
                      onClick={() => handleFilterChange("price", price)}
                      className={`tag
                        ${filters.price.includes(price) ? "selected" : ""}`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
                <h4>Services</h4>
                <div className="tag-cat">
                  {filterOptions.services.map((service) => (
                    <button
                      key={service}
                      onClick={() => handleFilterChange("services", service)}
                      className={`tag ${
                        filters.services.includes(service) ? "selected" : ""
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
                <h4>Parking</h4>
                <div className="tag-cat">
                  {filterOptions.parking.map((parking) => (
                    <button
                      key={parking}
                      onClick={() => handleFilterChange("parking", parking)}
                      className={`tag 
                        ${filters.parking.includes(parking) ? "selected" : ""}`}
                    >
                      {parking}
                    </button>
                  ))}
                </div>
              </div>
              <div className="result-section">
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
            </div>
            <div className="toggle-bar">
              <button
                type="button"
                className="btn-toggle"
                // onClick={toggle()}
              >
                {">"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
