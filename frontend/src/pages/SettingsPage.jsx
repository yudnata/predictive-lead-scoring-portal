import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const BASE_CLASS =
  'px-4 py-2 font-semibold text-sm transition-all rounded-lg cursor-pointer flex items-center justify-center gap-2';
const ACTIVE_CLASS = 'bg-blue-600 text-white shadow-md shadow-blue-500/50';
const INACTIVE_CLASS =
  'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700';

function SectionTitle({ children }) {
  return <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{children}</h2>;
}

function ThemeButton({ mode, label, currentTheme, setTheme }) {
  const isActive = currentTheme === mode;
  const Icon = mode === 'dark' ? FaMoon : FaSun;

  return (
    <button
      onClick={() => setTheme(mode)}
      className={`${BASE_CLASS} w-full ${isActive ? ACTIVE_CLASS : INACTIVE_CLASS}`}
    >
      <Icon className="w-5 h-5 fill-current" />
      {label}
    </button>
  );
}

const SettingsPage = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <div className="min-h-screen py-8 bg-white dark:bg-[#121212] transition-colors duration-300">
      <div className="w-full max-w-lg mx-auto px-4 md:px-0">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Settings
        </h1>

        <div className="p-6 rounded-xl shadow-2xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 transition-colors duration-300 w-full">
          <SectionTitle>Theme & Appearance</SectionTitle>
          <div className="space-y-4">
            <span className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
              Choose Theme
            </span>

            <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-[#2C2C2C] rounded-xl shadow-inner border border-gray-200 dark:border-gray-600 transition-colors duration-300">
              <ThemeButton
                mode="dark"
                label="Dark (Default)"
                currentTheme={theme}
                setTheme={setTheme}
              />
              <ThemeButton
                mode="light"
                label="Light"
                currentTheme={theme}
                setTheme={setTheme}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
