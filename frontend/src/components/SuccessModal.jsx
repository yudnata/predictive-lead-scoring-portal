import React from 'react';
import { createPortal } from 'react-dom';
import Lottie from 'lottie-react';
import checkMarkAnimation from '../assets/lottie/Check-Mark.json';

const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl p-8 flex flex-col items-center justify-center max-w-sm w-full transform transition-all scale-100">
        <div className="w-32 h-32 mb-4">
          <Lottie animationData={checkMarkAnimation} loop={true} />
        </div>
        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Success!
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 text-sm font-bold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          OK
        </button>
      </div>
    </div>,
    document.body
  );
};

export default SuccessModal;
