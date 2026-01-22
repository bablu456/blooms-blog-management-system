import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();

  // State to store inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    profileUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' // Default Image
  });

  const [error, setError] = useState('');

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Backend Call
      const response = await axios.post('http://localhost:8080/users/register', formData);

      console.log("Registration Success:", response.data);
      alert("🎉 Account Created! Please Login.");

      // Redirect to Login Page
      navigate('/login');

    } catch (err) {
      console.error("Registration Failed:", err);
      // Backend se jo error msg aayega wo dikhayenge (e.g. "Email already exists")
      setError(err.response?.data || "Registration Failed! Try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Create Account 🚀</h2>
          <p className="text-gray-500 mt-2">Join Blooms community today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text" name="name" placeholder="John Doe" required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email" name="email" placeholder="john@example.com" required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text" name="phoneNumber" placeholder="9876543210" required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" name="password" placeholder="••••••••" required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={handleChange}
            />
          </div>

          <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 transition shadow-lg mt-4">
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?
          <Link to="/login" className="text-indigo-600 font-bold ml-1 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;