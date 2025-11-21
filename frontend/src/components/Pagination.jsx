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
    const maxVisiblePages = 5; // bebas mau 5 atau 7

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (end - start + 1 < maxVisiblePages) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisiblePages - 1);
      } else if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const startResult = (currentPage - 1) * limit + 1;
  const endResult = Math.min(currentPage * limit, totalResults);

  return (
    <div className="flex items-center justify-between mt-6 text-sm text-black">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-white transition rounded-lg bg-white/5 backdrop-blur-sm disabled:opacity-30 hover:bg-white/20 hover:text-white"
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
            ? 'bg-white/20 text-white'
            : 'bg-white/5 text-white hover:bg-white/10'
        }
            `}
          >
            {page}
          </button>
        ))}

        {totalPages > 4 && <span className="text-white/70">...</span>}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-white transition rounded-lg bg-white/5 backdrop-blur-sm disabled:opacity-30 hover:bg-white/20 hover:text-white"
        >
          Next
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-white/70">
          {startResult} to {endResult} of {totalResults} Result
        </span>

        <div className="relative">
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="p-2 pr-2 text-white border rounded-lg cursor-pointer bg-dark-card border-white/10 focus:outline-none"
          >
            <option
              value="20"
              className="bg-[#0f0f0f]"
            >
              Show 20
            </option>
            <option
              value="30"
              className="bg-[#0f0f0f]"
            >
              Show 30
            </option>
            <option
              value="50"
              className="bg-[#0f0f0f]"
            >
              Show 50
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
