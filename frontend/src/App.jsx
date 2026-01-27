import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register'; // 👈 Import kiya

// Temporary Home Component (Jab tak asli wala na bane)
const Home = () => (
  <div className="text-center mt-20">
    <h1 className="text-4xl font-bold text-gray-800">Latest Blogs 📚</h1>
    <p className="text-gray-500 mt-2">Coming Soon...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Navbar hamesha dikhega */}
        <Navbar />

        {/* Pages badalte rahenge */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
           </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;