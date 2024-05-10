import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { PrivateRoute } from './privateComp';

import 'w3-css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';

axios.defaults.withCredentials = true;

const fetchUserMessagesData = async () => {
  const url = "http://127.0.0.1:8000/components/api/admin/check_messages";
  const accessToken = localStorage.getItem('accessToken');

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log("Admin data:\n", response.data);

    if (response.status === 403) {
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    throw error;
  }
};

export const CheckMessages = () => {
  const [userMessages, setUserMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogin = async () => {
      try {
        const result = await fetchUserMessagesData();

        if (result === null) {
            navigate('/login');
        } else {
            setUserMessages(result.user_messages);
            setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchLogin();
  }, []);

  const handleIsChecked = async (e, message_id) => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!message_id) {
        console.error('No message selected');
        return;
      }
      console.log("message_id = ", message_id);
      const url = "http://127.0.0.1:8000/components/api/admin/check_messages";
  
      const response = await axios.post(url, {"message_id": message_id}, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      console.log("Статус повідомлення успішно змінено", response.data);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };  

  return (
    <PrivateRoute>
      <div className="container" style={{ paddingTop: "90px" }}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div align="center">
            <div align="center" style={{ paddingTop: "0px" }}>
              <Link to="/admin" className="btn btn-primary">
                Список магазинів
              </Link>
            </div>

            <table className="table" style={{ width: "70%" }}>
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">Електронна пошта</th>
                        <th scope="col">Повідомлення</th>
                        <th scope="col">Перевірити</th>
                    </tr>
                </thead>
                <tbody className="thead-light">
                {userMessages.map(message => (
                    <tr key={message.id}>
                        <td>{message.message_email}</td>
                        <td>{message.message_text}</td>
                        <td>
                            <button className="btn btn-success" 
                                onClick={() => handleIsChecked(null, message.id)}
                            >
                                Відмітити, як вирішене
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        )}
      </div>
    </PrivateRoute>
  );
};

