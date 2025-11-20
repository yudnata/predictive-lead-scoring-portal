import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api/v1/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });

      const { token, user } = response.data.data;
      const role = user.role;

      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role);

      if (rememberMe) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userEmail', email);
      } else {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userRole', role);
      }
      
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'sales') navigate('/sales/dashboard');
      else navigate('/dashboard');

    } catch (err) {
      const errorMessage =
      err.response?.data?.message || 'Terjadi kesalahan saat login.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* LEFT */}
      <div className="flex-1 w-1/2 overflow-hidden">
        <img
          src="/Login 2.png"
          alt="Welcome Back"
          className="w-full h-full object-cover block"
        />
      </div>

      {/* RIGHT */}
      <div className="flex-1 w-1/2 px-12 md:px-20 py-10 flex flex-col justify-between h-screen"> 
      {/* HEADER */}
        <div className="w-full flex justify-end">
          <div className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="Accenture Logo" 
              className="h-6 w-auto" 
            />
            <span className="text-xl font-semibold">accenture</span> 
          </div>
        </div>

      {/* CONTAINER */}
        <div className="w-full max-w-md mx-auto mt-20 my-auto">
          <h2 className="text-4xl mb-2 font-bold">Welcome Back</h2>
          <p className="mb-10 text-white">Sign in to continue</p>

          {error && (
            <div className="text-red-400 bg-red-900/40 p-3 mb-5 rounded-md border border-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block font-normal text-white">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 bg-neutral-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block font-normal text-white">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 bg-neutral-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              <label htmlFor="rememberMe" className="text-gray-4  00">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-orange-600 rounded-lg text-lg font-bold hover:bg-orange-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
