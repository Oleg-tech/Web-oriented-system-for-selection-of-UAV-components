import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Home from './pages/Home';
// import Search from './pages/Search';
import NoPage from './pages/NoPage';
import { Navbar } from './components/navbar';
import { Home } from "./pages/home/home";
import { Search } from "./pages/search/search";
import { Cart } from "./pages/cart/cart";

function App() {
  return (
    <div 
      // style={{backgroundColor: "#eee"}}
    >
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
