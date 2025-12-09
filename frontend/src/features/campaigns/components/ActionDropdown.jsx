import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const ActionDropdown = ({ onEdit, onRequestDelete, onDetail }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left - 128,
      });
    }
  }, [dropdownOpen]);

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="fixed z-50 w-40 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700/50"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <button
        onClick={() => {
          setDropdownOpen(false);
          onDetail();
        }}
        className="block w-full px-4 py-2 text-sm text-left text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Detail
      </button>
      <button
        onClick={() => {
          setDropdownOpen(false);
          onEdit();
        }}
        className="block w-full px-4 py-2 text-sm text-left text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Edit Campaign
      </button>

      <button
        onClick={() => {
          setDropdownOpen(false);
          onRequestDelete();
        }}
        className="block w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Delete Campaign
      </button>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
          />
        </svg>
      </button>
      {dropdownOpen && createPortal(dropdownContent, document.body)}
    </>
  );
};

export default ActionDropdown;
