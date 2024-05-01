import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NoPage from './pages/NoPage';
import { Navbar } from './components/navbar';
import { Home } from "./pages/home/home";
import { Search } from "./pages/search/search";
import { Cart } from "./pages/cart/cart";
import { Admin } from "./pages/admin/admin";
import { LoginForm } from "./pages/login/login";

function App() {
  return (
    <div 
      // style={{backgroundColor: "#eee"}}
    >
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route index element={<Search />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
