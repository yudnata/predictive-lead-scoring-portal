import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Lottie from 'lottie-react';
import authAnimation from '../assets/lottie/auth.json';

const API_BASE_URL = 'http://localhost:5000/api/v1/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const animRef = useRef(null);
  const direction = useRef(1);

  useEffect(() => {
    if (animRef.current) {
      animRef.current.setSpeed(0.7);
      animRef.current.setDirection(1);
    }
  }, []);

  const handleComplete = () => {
    const inst = animRef.current;
    if (!inst) return;

    direction.current = direction.current * -1;
    inst.setDirection(direction.current);
    inst.goToAndPlay(0, true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      const { token, user } = response.data.data;
      const role = user.role;

      localStorage.clear();
      sessionStorage.clear();

      if (rememberMe) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userEmail', email);
      } else {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userRole', role);
      }

      let targetUrl = '/dashboard';
      if (role === 'admin') targetUrl = '/admin/dashboard';
      else if (role === 'sales') targetUrl = '/sales/dashboard';

      window.location.href = targetUrl;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat login.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen text-white bg-dark-bg">
      {/* Left side animation */}
      <div className="flex-1 hidden w-1/2 overflow-hidden md:flex items-center justify-center pl-16 ml-24">
        <Lottie
          lottieRef={animRef}
          animationData={authAnimation}
          loop={false}
          onComplete={handleComplete}
          className="w-full max-w-2xl"
        />
      </div>

      {/* Right side form */}
      <div className="relative flex flex-1 w-full h-screen px-8 py-10 md:w-1/2 md:px-20">
        <div className="absolute flex items-center space-x-2 top-8 right-8">
          <img
            src="/logo.png"
            alt="Accenture Logo"
            className="w-auto h-6"
          />
          <span className="text-xl font-semibold">accenture</span>
        </div>

        <div className="flex flex-col items-center justify-center w-full">
          <div className="w-full max-w-md">
            <h2 className="mb-2 text-5xl font-bold">Welcome Back</h2>
            <p className="mb-10 text-xl text-white">Sign in to continue</p>

            {error && (
              <div className="p-3 mb-5 text-red-400 border border-red-500 rounded-md bg-red-900/40">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block font-normal text-white"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 text-white rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-brand-hover"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block font-normal text-white"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-12 px-3 pr-12 text-white rounded-lg bg-dark-card focus:outline-none focus:ring-2 focus:ring-brand-hover"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 transition-colors duration-200 transform -translate-y-1/2 right-4 top-1/2 hover:text-white focus:outline-none"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center mb-6 space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-brand-hover"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-gray-400"
                >
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 text-lg font-bold transition rounded-lg bg-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Logging In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
