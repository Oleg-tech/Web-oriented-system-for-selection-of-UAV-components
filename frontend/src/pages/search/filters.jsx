import React, { useEffect, useState, useRef } from 'react';
import "./price-range-filter.css";
import "./checkbox.css";

export const Filter = ({
    query, shops, selectedShops, setSelectedShops,
    countries, selectedCountries, setSelectedCountries,
    setMinRangePrice, setMaxRangePrice,
    minRangePrice, maxRangePrice, setMinBufRangePrice, setMaxBufRangePrice, setResetPage
  }) => {
  const [isFixed, setIsFixed] = useState(false);
  const sidebarRef = useRef(null);
  const sidebarOffsetTop = useRef(null);

  const [minPrice, setMinPrice] = useState(minRangePrice);
  const [maxPrice, setMaxPrice] = useState(maxRangePrice);

  // Зміна ціни
  useEffect(() => {
    const handleSetup = () => {
      setMinPrice(minRangePrice);
      setMaxPrice(maxRangePrice);
    };

    handleSetup();
  }, [minRangePrice, maxRangePrice]);

  useEffect(() => {
    sidebarOffsetTop.current = sidebarRef.current.offsetTop;

    const handleScroll = () => {
      const scrollPosition = window.pageYOffset;

      if (scrollPosition >= sidebarOffsetTop.current) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const rangevalue = document.querySelector(".slider-container .price-slider");
    const rangeInputvalue = document.querySelectorAll(".range-input input");
  
    rangevalue.style.left = `${(minPrice / rangeInputvalue[0].max) * 100}%`;
    rangevalue.style.right = `${100 - (maxPrice / rangeInputvalue[1].max) * 100}%`;
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const rangevalue = document.querySelector(".slider-container .price-slider");
    const rangeInputvalue = document.querySelectorAll(".range-input input");
    const priceInputvalue = document.querySelectorAll(".price-input input");

    let priceGap = 50;

    const handlePriceInputChange = (e) => {
      let minp = parseInt(priceInputvalue[0].value, 10);
      let maxp = parseInt(priceInputvalue[1].value, 10);
      let diff = maxp - minp;

      if (minp < minRangePrice) {
        alert("minimum price cannot be less than 0");
        setMinPrice(minRangePrice);
        minp = minRangePrice;
      }

      if (maxp > maxRangePrice) {
        alert(`maximum price cannot be greater than ${maxRangePrice}`);
        setMaxPrice(maxRangePrice);
        maxp = maxRangePrice;
      }

      if (minp > maxp - priceGap) {
        setMinPrice(maxp - priceGap);
        minp = maxp - priceGap;

        if (minp < minRangePrice) {
          setMinPrice(minRangePrice);
          minp = minRangePrice;
        }
      }

      if (diff >= priceGap && maxp <= rangeInputvalue[1].max) {
        if (e.target.className === "min-input") {
          rangeInputvalue[0].value = minp;
          let value1 = rangeInputvalue[0].max;
          rangevalue.style.left = `${(minp / value1) * 100}%`;
        } else {
          rangeInputvalue[1].value = maxp;
          let value2 = rangeInputvalue[1].max;
          rangevalue.style.right = `${100 - (maxp / value2) * 100}%`;
        }
      }
    };

    const handleRangeInputChange = (e) => {
      let minVal = parseInt(rangeInputvalue[0].value, 10);
      let maxVal = parseInt(rangeInputvalue[1].value, 10);
      let diff = maxVal - minVal;

      if (diff < priceGap) {
        if (e.target.className === "min-range") {
          setMinPrice(maxVal - priceGap);
        } else {
          setMaxPrice(minVal + priceGap);
        }
      } else {
        setMinPrice(minVal);
        setMaxPrice(maxVal);
        rangevalue.style.left = `${(minVal / rangeInputvalue[0].max) * 100}%`;
        rangevalue.style.right = `${100 - (maxVal / rangeInputvalue[1].max) * 100}%`;
      }
    };

    priceInputvalue[0].addEventListener("input", handlePriceInputChange);
    priceInputvalue[1].addEventListener("input", handlePriceInputChange);
    rangeInputvalue[0].addEventListener("input", handleRangeInputChange);
    rangeInputvalue[1].addEventListener("input", handleRangeInputChange);

    return () => {
      priceInputvalue[0].removeEventListener("input", handlePriceInputChange);
      priceInputvalue[1].removeEventListener("input", handlePriceInputChange);
      rangeInputvalue[0].removeEventListener("input", handleRangeInputChange);
      rangeInputvalue[1].removeEventListener("input", handleRangeInputChange);
    };
  }, []);

  const handleShopChange = (shop) => {
    setResetPage(true); // Обнулення пагінації
    
    if (selectedShops.includes(shop)) {
      setSelectedShops(selectedShops.filter((s) => s !== shop));
    } else {
      setSelectedShops([...selectedShops, shop]);
    }
    console.log("Selected shops = ", selectedShops);
  };

  const handleCountryChange = (country) => {
    setResetPage(true);
    
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter((s) => s !== country));
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
    console.log("Country = ", country);
    console.log("Selected countries = ", selectedCountries);
  };

  // Обробка зміни інтервалу цін
  const handlePriceRangeChange = () => {
    // console.log("\n\nMin range = ", minPrice);
    // console.log("Max range = ", maxPrice);

    setMinRangePrice(minPrice);
    setMaxRangePrice(maxPrice);
    setMinBufRangePrice(minPrice);
    setMaxBufRangePrice(maxPrice);
  };

  // console.log("MinP: ", minPrice, " != ", minRangePrice);
  // console.log("MaxP: ", maxPrice, " != ", maxRangePrice);

  // Обробка зкидання фільтрів
  const handleFilterReset = () => {
    // console.log("Reset");
    setSelectedShops([]);
    setSelectedCountries([]);
    setMinBufRangePrice(null);
    setMaxBufRangePrice(null);
  };

  return (
    <div
      ref={sidebarRef}
      className={`w3-sidebar w3-bar-block w3-card ${isFixed ? 'fixed' : ''}`}
      style={{
        width: '17%',
        left: 0,
        ...(isFixed ? { position: 'fixed', top: 0 } : {}),
      }}
    >
      <div className="filter-container">
        <div align="center">
          <h4 className="w3-bar-item main-title">Фільтри</h4>
          <button onClick={handleFilterReset} className="w3-button w3-black" style={{ marginTop: "5px" }}>Очистити фільтри</button>
        </div>

        <div className="price-filter" style={{ marginTop: "15px", paddingBottom: "15px" }}>
          <h5 className="w3-bar-item sub-title" style={{ marginTop: 0, paddingTop: 0 }}>Ціна</h5>
          <div className="custom-wrapper" style={{ paddingBottom: "0px" }}>
            <div className="price-input-container">
              <div className="price-input">
                <div className="price-field">
                  <span>Від</span>
                  <input 
                    type="number" 
                    className="min-input" 
                    value={minPrice}
                    readOnly
                    onChange={(e) => setMinPrice(parseFloat(e.target.value))}
                    style={{ marginLeft: "2px" }}
                  />
                </div>
                <div className="price-field">
                  <span>До</span>
                  <input 
                    type="number" 
                    className="max-input" 
                    value={maxPrice}
                    readOnly
                    onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                    style={{ marginLeft: "7px" }}
                  />
                </div>
              </div>
              <div className="slider-container">
                <div className="price-slider"></div>
              </div>
            </div>

            <div className="range-input">
              <input 
                type="range"
                className="min-range"
                min={minRangePrice}
                max={maxRangePrice}
                value={minPrice}
                onChange={() => {}}
                step="1"
              />
              <input 
                type="range"
                className="max-range"
                min={minRangePrice}
                max={maxRangePrice}
                value={maxPrice}
                onChange={() => {}}
                step="1"
              />
            </div>
            <div style={{ marginLeft: "0px", marginTop: "15px", paddingBottom: "0px" }}>
              <button className="w3-button w3-black" onClick={handlePriceRangeChange}>Застосувати</button>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: "0" }}>
          <h5 className="w3-bar-item sub-title">Магазини</h5>
          {Array.isArray(shops) && shops.length > 0 ? (
            <ul className="shop-list" style={{ paddingLeft: "10px" }}>
              {shops.map((shop, index) => (
                <li key={index} className="w3-bar-item w3-button" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedShops.includes(shop)}
                      onChange={() => handleShopChange(shop)}
                    />
                    <span className="checkmark"></span>
                    <span className="label-text">{shop}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p>Немає доступних магазинів</p>
          )}
        </div>

        <div style={{ marginTop: "15px" }}>
          <h5 className="w3-bar-item sub-title">Країни</h5>
          {Array.isArray(countries) && countries.length > 0 ? (
            <ul className="shop-list" style={{ paddingLeft: "10px" }}>
              {countries.map((country, index) => (
                <li key={index} className="w3-bar-item w3-button" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(country)}
                      onChange={() => handleCountryChange(country)}
                    />
                    <span className="checkmark"></span>
                    <span className="label-text">{country}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p>Немає доступних країн</p>
          )}
        </div>
      </div>
    </div>
  );
};
