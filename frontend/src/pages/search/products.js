import axios from 'axios';

export const fetchProducts = async (query, page, filtered_shops, min_range_price, max_range_price, sorting, reset_page) => {
    console.log("Query = ", query);

    if (reset_page) {
      page = 1;
    }

    let url;
    if (filtered_shops) {
        const shopsQuery = filtered_shops.join(',');
        url = `http://127.0.0.1:8000/components/api/search/?page=${page}&shops=${shopsQuery}`;
    } else {
        url = `http://127.0.0.1:8000/components/api/search/?page=${page}`;
    }

    if (min_range_price && max_range_price) {
      url += `&min_price=${min_range_price}&max_price=${max_range_price}`;
    }
    if (sorting) {
      url += `&sorting=${sorting}`;
    }

    const data = { "query": query };
  
    try {
      const response = await axios.post(url, data);
      console.log("Data:\n", response.data);

      return response.data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    }
};

