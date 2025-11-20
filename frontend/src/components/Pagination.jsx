import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  onLimitChange,
  totalResults,
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 4;
    const endPage = Math.min(maxVisiblePages, totalPages);

    for (let i = 1; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const startResult = (currentPage - 1) * limit + 1;
  const endResult = Math.min(currentPage * limit, totalResults);

  return (
    <div className="flex items-center justify-between mt-6 text-sm text-black">
      {/* Left */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-white transition border rounded-lg border-white/10 bg-white/5 backdrop-blur-sm disabled:opacity-30 hover:bg-white/20 hover:text-white"
        >
          Back
        </button>

        {renderPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 flex items-center justify-center rounded-md text-sm transition
        ${
          currentPage === page
            ? 'bg-white/20 text-white border border-white/10' // active page
            : 'bg-white/5 text-white border border-white/5 hover:bg-white/10'
        }
            `}
          >
            {page}
          </button>
        ))}

        {totalPages > 4 && <span className="text-black">...</span>}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-white transition border rounded-lg border-white/10 bg-white/5 backdrop-blur-sm disabled:opacity-30 hover:bg-white/20 hover:text-white"
        >
          Next
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <span className="text-white/70">
          {startResult} to {endResult} of {totalResults} Result
        </span>

        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="p-1 text-white transition border rounded-lg cursor-pointer bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10"
        >
          <option
            className="text-black"
            value="14"
          >
            Show 14
          </option>
          <option
            className="text-black"
            value="25"
          >
            Show 25
          </option>
          <option
            className="text-black"
            value="50"
          >
            Show 50
          </option>
        </select>
      </div>
    </div>
  );
};

export default Pagination;
