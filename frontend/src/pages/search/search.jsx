import React, { useState, useEffect } from "react";
import { fetchProducts } from "./products";
import { Product } from "./product";
import "./search.css";

export const Search = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  // Get data from server
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProducts(query);
        setData(JSON.stringify(data, null, 2));
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
        fetchData();
    }
  }, [query]);

  if (query === "") {
    return (
        <div>
            <label for="component-search-input">Введіть назву:</label>
            <input type="search" id="component-search-input" name="query" />
            <button id="component-search-button" onClick={() => setQuery(document.getElementById("component-search-input").value)}>Пошук</button>
            <div>Введіть комплектуючу для пошуку!!!</div>
        </div>
    );
  }

  if (isLoading) {
    return <div>Зачекайте, відбувається пошук комплектуючих...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Extract components list
  const jsonData = JSON.parse(data);
  const { search_result } = jsonData;

  return (
    <div className="shop">
      <label for="component-search-input">Введіть назву:</label>
      <input type="search" id="component-search-input" name="query" />
      <button id="component-search-button" onClick={() => setQuery(document.getElementById("component-search-input").value)}>Пошук</button>
      
      {/* <div className="shopTitle">
        <h1>Shop</h1>
      </div> */}
      
      <div className="products">
        {Array.isArray(search_result) && search_result.length > 0 ? (
          search_result.map((product) => <Product key={product.id} data={product} />)
        ) : (
          <p>Зачекайте, відбувається пошук комплектуючих...</p>
        )}
      </div>
    </div>
  );
};