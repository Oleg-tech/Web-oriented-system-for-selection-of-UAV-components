import React from "react";

export const Product = (props) => {
    const { componentName, componentPrice, componentImageURL, componentExternalURL, componentShopName } = props.data;
    return (
        <div className="product">
            <img src={componentImageURL} />
            <div className="description">
                <a href={componentExternalURL}>
                    <p>
                        <b>{componentName}</b>
                    </p>
                    <p>{componentPrice}</p>
                    <p>{componentShopName}</p>
                </a>
            </div>
            <button className="addToCartBttn">Порівняти</button>
        </div>
    );
};
