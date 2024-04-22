import React, { useState, useEffect } from "react";
import { fetchProducts } from "./products";
import { Product } from "./product";
import { Pagination } from "./pagination";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./search.css";

const ProductList = ({ search_result }) => {
  return (
      <>
          {Array.isArray(search_result) && search_result.length > 0 ? (
              search_result.map((product) => <Product key={product.id} data={product} />)
          ) : (
              <p>Немає результатів для введеного запиту</p>
          )}
      </>
  );
};

export const Search = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Додали стан для поточної сторінки

  // Get data from server
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProducts(query, currentPage); // Додали currentPage
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
  }, [query, currentPage]);

  if (query === "") {
    return (
        <div>
            <label htmlFor="component-search-input">Введіть назву:</label> {/* Виправили "for" на "htmlFor" */}
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
  const componentsNumber = jsonData.count;
  const componentsPerPage = 20;
  // const nextPageUrl = jsonData.next;
  // const prevPageUrl = jsonData.previous;

  return (
    <div className="shop">
      <label htmlFor="component-search-input">Введіть назву:</label>
      <input type="search" id="component-search-input" name="query" />
      <button id="component-search-button" onClick={() => setQuery(document.getElementById("component-search-input").value)}>Пошук</button>
      
      <div className="products">
        <ProductList search_result={search_result}/>
      </div>
        <Pagination
          componentsNumber={componentsNumber}
          componentsPerPage={componentsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
    </div>
  );
};

