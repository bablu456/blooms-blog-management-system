import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Page change karne ke liye
import axios from 'axios'; // API call ke liye

const Login = () => {
  const navigate = useNavigate();

  // 1. State: User ka data yahan store hoga
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  });

  // Error message dikhane ke liye state
  const [error, setError] = useState('');

  // 2. Handle Change: Jab user type karega
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.type === 'text' ? 'phoneNumber' : 'password']: e.target.value
    });
    // Note: Humne input fields mein 'name' attribute use nahi kiya,
    // isliye direct target kar rahe hain simple tarike se niche input me 'onChange' dekhna.
  };

  // 3. Handle Submit: Jab button dabega
  const handleSubmit = async (e) => {
    e.preventDefault(); // Page reload hone se roko
    setError(''); // Purana error hatao

    try {
      // Backend ko call lagao
      const response = await axios.post('http://localhost:8080/user/login', {
        phoneNumber: formData.phoneNumber,
        password: formData.password
      });

      // Agar success hua:
      console.log("Login Success:", response.data);
      alert("Welcome Back! " + response.data.name);

      // User ko Home page par bhej do
      navigate('/');

    } catch (err) {
      // Agar fail hua:
      console.error("Login Failed:", err);
      setError("❌ Invalid Phone Number or Password!");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back! 👋</h2>
          <p className="text-gray-500 mt-2">Enter your details to access your account</p>
        </div>

        {/* 4. Form Submit Event */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Error Message Show karne ke liye */}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              // State se connect kiya
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              // State se connect kiya
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:opacity-90 transition shadow-lg transform active:scale-95">
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?
          <Link to="/register" className="text-indigo-600 font-bold ml-1 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;