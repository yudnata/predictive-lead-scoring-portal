/* eslint-disable no-irregular-whitespace */

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
    const siblingCount = 1;
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }
  };

  const startResult = (currentPage - 1) * limit + 1;
  const endResult = Math.min(currentPage * limit, totalResults);

  return (
    <div className="flex items-center justify-between mt-6 text-sm text-gray-700 dark:text-white">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-gray-800 dark:text-white transition rounded-lg bg-gray-200 dark:bg-white/5 backdrop-blur-sm disabled:opacity-30 hover:bg-gray-300 dark:hover:bg-white/20"
        >
          Back
        </button>

        {renderPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="flex items-center justify-center w-9 h-9 text-gray-500 dark:text-white/50"
              >
                &#8230;
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 flex items-center justify-center rounded-md text-sm transition
            ${
            currentPage === page
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10' 
            }
              `}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-gray-800 dark:text-white transition rounded-lg bg-gray-200 dark:bg-white/5 backdrop-blur-sm disabled:opacity-30 hover:bg-gray-300 dark:hover:bg-white/20"
        >
          Next
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-gray-500 dark:text-white/70">
          {startResult} to {endResult} of {totalResults} Result
        </span>

        <div className="relative">
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="p-2 pr-2 text-gray-800 dark:text-white border rounded-lg cursor-pointer bg-white dark:bg-[#1A1A1A] border-gray-300 dark:border-white/10 focus:outline-none"
          >
            <option
              value="20"
              className="bg-white dark:bg-[#1A1A1A]"
            >
              Show 20
            </option>
            <option
              value="30"
              className="bg-white dark:bg-[#1A1A1A]"
            >
              Show 30
            </option>
            <option
              value="50"
              className="bg-white dark:bg-[#1A1A1A]"
            >
              Show 50
            </option>
            <option
              value="100"
              className="bg-white dark:bg-[#1A1A1A]"
            >
              Show 100
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
