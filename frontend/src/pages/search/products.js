import axios from 'axios';

export const fetchProducts = async (query, page) => {
    console.log("Query = ", query);
    const url = `http://127.0.0.1:8000/components/api/search/?page=${page}`;
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

