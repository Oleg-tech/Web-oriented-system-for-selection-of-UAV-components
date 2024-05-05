import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import { Product } from './product';
import { Filter } from "./filters";

import 'w3-css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';


export const bufFetchComponents = async (category) => {
    console.log("Category = ", category);

    let url = "http://127.0.0.1:8000/components/api/categories";

    const data = { 
      "category": category
    };
  
    try {
      const response = await axios.post(url, data);
      console.log("Data:\n", response.data);

      return response.data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    }
};

export const fetchComponents = async (category, filtered_shops, filtered_countries, filtered_companies, selected_parameters, sorting) => {
    console.log("Category = ", category);

    let url = "http://127.0.0.1:8000/components/api/categories";
    
    if (filtered_shops) {
        if(url.includes("?")) {
            const shopsQuery = filtered_shops.join(',');
            url += `&shops=${shopsQuery}`;            
        }
        else {
            const shopsQuery = filtered_shops.join(',');
            url += `?shops=${shopsQuery}`;
        }
    }

    if (filtered_countries) {
        if(url.includes("?")) {
            const countriesQuery = filtered_countries.join(',');
            url += `&countries=${countriesQuery}`;
        }
        else {
            const countriesQuery = filtered_countries.join(',');
            url += `?countries=${countriesQuery}`;
        }
    }

    if (filtered_companies) {
        if(url.includes("?")) {
            const companiesQuery = filtered_companies.join(',');
            url += `&companies=${companiesQuery}`;
        }
        else {
            const companiesQuery = filtered_companies.join(',');
            url += `?companies=${companiesQuery}`;
        }
    }

    if (sorting) {
        if(url.includes("?")) {
            url += `&sorting=${sorting}`;
        }
        else {
            url += `?sorting=${sorting}`;
        }
    }

    const data = { 
        "category": category,
        "parameters": selected_parameters
    };
  
    try {
        const response = await axios.post(url, data);
        console.log("Data:\n", response.data);

        return response.data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;
    }
};

const ProductList = ({ search_result }) => {
    return (
      <div class="container py-2">
        <div class="row">
            {Array.isArray(search_result) && search_result.length > 0 ? (
              search_result.map((product) => <Product key={product.id} data={product} />)
            ) : (
              <p>Немає результатів для введеного запиту</p>
            )}
        </div>
      </div>
    );
};

export const Categories = (props) => {
    const [category, setCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchResult, setSearchResult] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [componentsNumber, setComponentsNumber] = useState(null);
    const [sorting, setSorting] = useState(null);

    const [shopsList, setShopsList] = useState([]);
    const [countriesList, setCountriesList] = useState([]);
    const [companiesList, setCompaniesList] = useState([]);
    const [parametersList, setParametersList] = useState([]);

    const [selectedShops, setSelectedShops] = useState([]);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedParameters, setSelectedParameters] = useState([]);

    const handleDataUpdate = (newData) => {
        console.log("NewData = ", newData);
        let { data, category_name, shops, countries, companies, components_number, parameters } = newData;
        setSearchResult(data);
        setCategoryName(category_name);
        setShopsList(shops);
        setCountriesList(countries);
        setCompaniesList(companies);
        setComponentsNumber(components_number);
        setParametersList(parameters);
    };

    // Get data from server
    const fetchData = async () => {
        setIsLoading(true);
        try {
        const data = await fetchComponents(
            category, selectedShops, selectedCountries, selectedCompanies, selectedParameters, sorting
        );
        handleDataUpdate(data);
        } catch (err) {
            console.log("err");
        //   setError(err);
        } finally {
        setIsLoading(false);
        //   setResetPage(false);
        //   return data;
        }
    };

    useEffect(() => {
        if (category) {
            fetchData();
        }
    }, [category, selectedShops, selectedCountries, selectedCompanies, selectedParameters, sorting]);

    const handleSortChange = (event) => {
        const sortOption = event.target.value;
    
        setSorting(sortOption);
      };

    if (category === "") {
        return (
            <div className="shop">
                <div className="w3-sidebar w3-bar-block w3-card" style={{ width: '17%', left: 0 }}>
                    <div align="center">
                        <h4 className="w3-bar-item main-title">Категорії</h4>
                    </div>

                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Motor")}>
                        Мотори
                    </button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Propellers")}>Пропелери</button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Flight controller")}>Контроллери польоту</button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Battery")}>Акумулятори</button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Frame")}>Каркаси</button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Camera")}>Камери</button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("motors")}>Пульти керування</button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("motors")}>Навігаційні модулі</button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Antenna")}>Антени</button>
                </div>
        
                <div className="product-info" style={{marginLeft: '17%', marginRight: '1%'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: "20px"}}>
                        <div className="product-count" style={{
                            fontSize: '1.5rem',
                            color: '#333',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            paddingTop: '15px'
                        }}>
                            Оберіть категорію
                        </div>
                    </div>
        
                    <div className="products">
                    </div>
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="shop">
                <div className="w3-sidebar w3-bar-block w3-card" style={{ width: '17%', left: 0 }}>
                    <div align="center">
                        <h4 className="w3-bar-item main-title">Категорії</h4>
                    </div>

                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Motor")}>
                        Мотори
                    </button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Propellers")}>
                        Пропелери
                    </button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Flight controller")}>
                        Контроллери польоту
                    </button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Battery")}>
                        Акумулятори
                    </button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Frame")}>
                        Каркаси
                    </button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Camera")}>
                        Камери
                    </button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Motor")}>
                        Пульти керування
                    </button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Motor")}>
                        Навігаційні модулі
                    </button>
                    <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Antenna")}>
                        Антени
                    </button>
                </div>
        
                <div className="product-info" style={{marginLeft: '17%', marginRight: '1%'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: "20px"}}>
                        <div className="product-count" style={{
                            fontSize: '1.5rem',
                            color: '#333',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            paddingTop: '15px'
                        }}>
                            Зачекайте, відбувається пошук комплектуючих...
                        </div>
                    </div>
        
                    <div className="products">
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="shop">
            <div className="w3-sidebar w3-bar-block w3-card" style={{ width: '17%', left: 0 }}>
                <div align="center">
                    <h4 className="w3-bar-item main-title">Категорії</h4>
                </div>

                <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Motor")}>
                    Мотори
                </button>

                {category === "Motor" ? (
                    <Filter
                        category={category}
                        shops={shopsList}
                        selectedShops={selectedShops}
                        setSelectedShops={setSelectedShops}
                        countries={countriesList}
                        selectedCountries={selectedCountries}
                        setSelectedCountries={setSelectedCountries} 
                        companies={companiesList}
                        selectedCompanies={selectedCompanies} 
                        setSelectedCompanies={setSelectedCompanies}
                        parameters={parametersList}
                        selectedParameters={selectedParameters}
                        setSelectedParameters={setSelectedParameters}
                    />
                ) : null }

                <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Propellers")}>
                    Пропелери
                </button>

                {category === "Propellers" ? (
                    <Filter
                        category={category}
                        shops={shopsList}
                        selectedShops={selectedShops}
                        setSelectedShops={setSelectedShops}
                        countries={countriesList}
                        selectedCountries={selectedCountries}
                        setSelectedCountries={setSelectedCountries} 
                        companies={companiesList}
                        selectedCompanies={selectedCompanies} 
                        setSelectedCompanies={setSelectedCompanies}
                        parameters={parametersList}
                        selectedParameters={selectedParameters}
                        setSelectedParameters={setSelectedParameters}
                    />
                ) : null }

                <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Flight controller")}>
                    Контроллери польоту
                </button>

                {category === "Flight controller" ? (
                    <Filter
                        category={category}
                        shops={shopsList}
                        selectedShops={selectedShops}
                        setSelectedShops={setSelectedShops}
                        countries={countriesList}
                        selectedCountries={selectedCountries}
                        setSelectedCountries={setSelectedCountries} 
                        companies={companiesList}
                        selectedCompanies={selectedCompanies} 
                        setSelectedCompanies={setSelectedCompanies}
                        parameters={parametersList}
                        selectedParameters={selectedParameters}
                        setSelectedParameters={setSelectedParameters}
                    />
                ) : null }

                <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Battery")}>
                    Акумулятори
                </button>

                {category === "Battery" ? (
                    <Filter
                        category={category}
                        shops={shopsList}
                        selectedShops={selectedShops}
                        setSelectedShops={setSelectedShops}
                        countries={countriesList}
                        selectedCountries={selectedCountries}
                        setSelectedCountries={setSelectedCountries} 
                        companies={companiesList}
                        selectedCompanies={selectedCompanies} 
                        setSelectedCompanies={setSelectedCompanies}
                        parameters={parametersList}
                        selectedParameters={selectedParameters}
                        setSelectedParameters={setSelectedParameters}
                    />
                ) : null }

                <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Frame")}>
                    Каркаси
                </button>



                <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Camera")}>
                    Камери
                </button>

                {category === "Camera" ? (
                    <Filter
                        category={category}
                        shops={shopsList}
                        selectedShops={selectedShops}
                        setSelectedShops={setSelectedShops}
                        countries={countriesList}
                        selectedCountries={selectedCountries}
                        setSelectedCountries={setSelectedCountries} 
                        companies={companiesList}
                        selectedCompanies={selectedCompanies} 
                        setSelectedCompanies={setSelectedCompanies}
                        parameters={parametersList}
                        selectedParameters={selectedParameters}
                        setSelectedParameters={setSelectedParameters}
                    />
                ) : null }

                <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Control panel")}>
                    Пульти керування
                </button>
                <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Navigation module")}>
                    Навігаційні модулі
                </button>
                <button className="w3-bar-item w3-button" style={{ fontSize: '18px' }} onClick={() => setCategory("Antenna")}>
                    Антени
                </button>
            </div>
    
            <div className="product-info" style={{marginLeft: '17%', marginRight: '1%'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: "20px"}}>
                    <div className="product-count" style={{
                        fontSize: '1.5rem',
                        color: '#333',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        paddingTop: '15px'
                    }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                {categoryName} ({componentsNumber})
                            </div>

                            <div>
                                Показувати спочатку:
                                <select onChange={handleSortChange} className="form-select">
                                    <option value="most_appropriate">-</option>
                                    <option value="cheapest">Дешеві</option>
                                    <option value="expensive">Дорогі</option>
                                </select>
                            </div>
                        </div>

                        <ProductList search_result={searchResult}/>
                    </div>
                </div>
    
                <div className="products">
                </div>
            </div>
        </div>
    );
};
