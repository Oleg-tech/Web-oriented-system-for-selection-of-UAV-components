import React, { useState, useEffect } from "react";
import { CartProduct } from "./cartProduct"

export const Cart = () => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
      const storedCartItems = JSON.parse(localStorage.getItem('favorites')) || [];
      setCartItems(storedCartItems);
    }, []);

    // console.log("cartItems = ", cartItems);

    const clearCart = () => {
        console.log("Clear cart");
        setCartItems([]);
        localStorage.clear();
    }

    return (
        <div>
            {cartItems.length === 0 ? (
                <p>Кошик порожній</p>
            ) : (
                <div>
                    <h2>Збережені комплектуючі</h2>

                    <button onClick={clearCart}>Очистити кошик</button>

                    <div class="container py-2">
                        <div class="row">
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
