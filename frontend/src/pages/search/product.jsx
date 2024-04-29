import React from "react";
import { SuitHeart } from 'react-bootstrap-icons';

const formatPrice = (price) => {
    if (typeof price === 'string') {
      const [minPrice, maxPrice] = price.split(' - ');

      if (maxPrice) {
        return `${parseFloat(minPrice).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ${parseFloat(maxPrice).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴`;
      } else {
        return `${parseFloat(minPrice).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴`;
      }
    }
  
    return `${price.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴`;
};

export const Product = (props) => {
    const { componentName, componentPrice, componentImageURL, componentExternalURL, componentShopName } = props.data;
    return (
        <div class="col-md-3 col-lg-3 mb-1 mb-lg-1">
            <div class="card custom-card" style={{ border: "1px solid gray" }}>
                <div class="d-flex justify-content-between pr-3 pt-3">
                    <div class="d-flex align-items-center"><p class="lead mb-0"></p></div>
                    <SuitHeart style={{ fontSize: '24px', marginRight: '10px' }} />
                </div>
                <a href={componentExternalURL} target="_blank" class="card-link">
                    <img 
                        src={componentImageURL}
                        class="card-img-top custom-img mt-0" 
                        alt={componentName}
                        style={{
                            minHeight: "200px",
                            maxHeight: "200px",
                            minWidth: "300px",
                            maxWidth: "300px",
                            margin: "auto"
                        }}
                    />
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-3">
                            <h5 class="mb-0 clamp-text">{componentName}</h5>
                        </div>

                        <div class="d-flex justify-content-between">
                            <h5 class="text-dark mb-0">
                                {formatPrice(componentPrice)}
                            </h5>
                        </div>

                        <div class="d-flex justify-content-between pt-1 mb-2">
                            <p class="text-muted mb-0 larger-text">{componentShopName}</p>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    );

    <div className="card">
    <img src={componentImageURL} className="card-img-to" alt="..."/>
    <div className="card-body">
        <a href={componentExternalURL}>
            <h5 className="card-title">
                <b>{componentName}</b>
            </h5>
            <p className="card-text">{componentPrice}</p>
            <p>{componentShopName}</p>
        </a>
    </div>
    <button className="addToCartBttn">Порівняти</button>
    </div>
};
