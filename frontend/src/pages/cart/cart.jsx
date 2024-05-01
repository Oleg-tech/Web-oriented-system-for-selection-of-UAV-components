import React, { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import { CartProduct } from "./cartProduct"

export const Cart = () => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
      const storedCartItems = JSON.parse(localStorage.getItem('favorites')) || [];
      setCartItems(storedCartItems);
    }, []);

    const clearCart = () => {
        console.log("Clear cart");
        setCartItems([]);
        localStorage.clear();
    }

    const downloadComponents = () => {
        try {
            const allData = JSON.parse(localStorage.getItem('favorites')) || [];
        
            const headers = ["Назва", "Ціна, грн.", "Зображення", "Сторінка в магазині", "Магазин"];
            const data = [headers];
        
            for (const item of allData) {
              data.push([
                item.name,
                item.price,
                item.imageURL,
                item.externalURL,
                item.shopName
              ]);
            }
        
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, 'Components');
            XLSX.writeFile(wb, 'cart-components.xlsx');
        } catch (err) {
          console.error('Error:', err);
        }
    }; 
    
    return (
        <div>
            {cartItems.length === 0 ? (
                <p>Кошик порожній</p>
            ) : (
                <div>
                    <div align="center">
                        <button className="w3-button w3-black" onClick={clearCart}>Очистити кошик</button>

                        <button onClick={downloadComponents} style={{ border: 'none', background: 'none', marginRight: "50px", marginTop: "25px", marginLeft: "40px" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
                            </svg>
                        </button>
                    </div>

                    <div class="container py-2">
                        <div class="row" style={{ paddingTop: "20px" }}>
                            {Array.isArray(cartItems) && cartItems.length > 0 ? (
                                cartItems.map((product, cartIndex) => <CartProduct data={product} cartIndex={cartIndex} cartItems={cartItems} setCartItems={setCartItems} />)
                            ) : (
                                <p>Немає результатів для введеного запиту</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
