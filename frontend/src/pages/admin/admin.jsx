import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const fetchShopsData = async () => {
  const url = "http://127.0.0.1:8000/components/api/admin";

  try {
    const response = await axios.get(url);
    console.log("Admin data:\n", response.data);
    return response.data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error;
  }
};

const downloadFile = async (shop_url) => {
  const url = "http://127.0.0.1:8000/components/api/admin";

  const data = {
    "operation": "download",
    "shop_url": shop_url
  };

  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error;
  }
};

export const Admin = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchShopsData();
        setShops(result.shops);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('operation', 'add');
      formData.append('filename', selectedFile.name);

      const response = await axios.post("http://127.0.0.1:8000/components/api/admin", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('File successfully sent:', response.data);
    } catch (error) {
      console.error('Error sending file:', error);
    }
  };

  const handleDownload = async (shop_url) => {
    try {
      const result = await downloadFile(shop_url);
      const jsonData = JSON.stringify(result.data.data);
      const fileName = result.data.file_name;
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
  
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleSendFile = async (e, base_url) => {
    try {
      const file = e.target.files[0];
      console.log("Shiop url 2 = ", base_url);

      if (!file) {
        console.error('No file selected');
        return;
      }
  
      const formData = new FormData();
      formData.append('file', file);
      formData.append("operation", "send");
      formData.append("shop_url", base_url);
  
      const url = "http://127.0.0.1:8000/components/api/admin";
  
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      console.log("Файл успішно відправлений", response.data);
    } catch (error) {
      console.error('Error sending file:', error);
    }
  };  

  const handleDelete = async (shop_url) => {
    try {
      const data = {
        "operation": "delete",
        "shop_url": shop_url
      };
      
      const url = "http://127.0.0.1:8000/components/api/admin";
      const response = await axios.post(url, data);
      console.log("Файл успішно видалений", response.data);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>

        <div align="center" style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
          <button className="btn btn-success">Додати</button>
          <input type="file" style={{ position: 'absolute', top: 0, right: 0, minWidth: '100%', minHeight: '100%', fontSize: '100px', textAlign: 'right', opacity: 0, outline: 'none', cursor: 'inherit' }} onChange={handleFileChange} />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th scope="col">Назва</th>
              <th scope="col">Посилання</th>
              <th scope="col">Країна</th>
              <th scope="col">Завантажити</th>
              <th scope="col">Редагувати</th>
              <th scope="col">Видалити</th>
            </tr>
          </thead>
          <tbody>
            {shops.map(shop => (
              <tr key={shop.name}>
                <td>{shop.name}</td>
                <td>{shop.base_url}</td>
                <td>{shop.country}</td>
                <td>
                  <button className="btn btn-primary" 
                    onClick={() => handleDownload(shop.base_url)}
                  >
                    Завантажити
                  </button>
                </td>
                <td>
                  <div align="center" style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
                    <button className="btn btn-warning">Оновити</button>
                    <input type="file" style={{ position: 'absolute', top: 0, right: 0, minWidth: '100%', minHeight: '100%', fontSize: '100px', textAlign: 'right', opacity: 0, outline: 'none', cursor: 'inherit' }} onChange={(e) => handleSendFile(e, shop.base_url)} />
                  </div>
                </td>
                <td>
                  <button className="btn btn-danger" 
                    onClick={() => handleDelete(shop.base_url)}
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
};

