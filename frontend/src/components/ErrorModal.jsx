import React from 'react';
import { createPortal } from 'react-dom';

const ErrorModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl p-8 flex flex-col items-center justify-center max-w-sm w-full transform transition-all scale-100">
        <div className="w-20 h-20 mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-red-600 dark:text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Error
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          {message || 'Something went wrong.'}
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 text-sm font-bold text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ErrorModal;
