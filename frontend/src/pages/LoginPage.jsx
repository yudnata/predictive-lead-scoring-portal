import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api/v1/auth';

const LoginPage = () => {
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
    <div className="flex min-h-screen text-white bg-dark-bg">
      {/* LEFT */}
      <div className="flex-1 w-1/2 overflow-hidden">
        <img
          src="/Login 2.png"
          alt="Welcome Back"
          className="block object-cover w-full h-full"
        />
      </div>

      {/* RIGHT */}
      <div className="flex flex-col justify-between flex-1 w-1/2 h-screen px-12 py-10 md:px-20"> 
      {/* HEADER */}
        <div className="flex justify-end w-full">
          <div className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="Accenture Logo" 
              className="w-auto h-6" 
            />
            <span className="text-xl font-semibold">accenture</span> 
          </div>
        </div>

      {/* CONTAINER */}
        <div className="w-full max-w-md mx-auto my-auto mt-20">
          <h2 className="mb-2 text-4xl font-bold">Welcome Back</h2>
          <p className="mb-10 text-white">Sign in to continue</p>

          {error && (
            <div className="p-3 mb-5 text-red-400 border border-red-500 rounded-md bg-red-900/40">
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
                className="w-full p-2 text-white rounded-lg bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-hover"
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
                className="w-full p-2 text-white rounded-lg bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-hover"
              />
            </div>

            <div className="flex items-center mb-6 space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-brand-hover"
              />
              <label htmlFor="rememberMe" className="text-gray-4 00">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-lg font-bold transition rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
