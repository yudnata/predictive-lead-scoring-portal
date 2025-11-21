import React from 'react';

const NotFoundPage = ({ message = 'Tidak ada data ditemukan' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-white bg-dark-bg">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold">404</h1>
        <h2 className="mb-2 text-3xl font-semibold">Page Not Found</h2>
        <p className="mb-6 text-gray-400">{message}</p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 text-black transition bg-white rounded-lg shadow hover:bg-gray-200"
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
