import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const CalendarToolbar = ({ onNavigate, label, onView, view }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-white/10 gap-4">
      <div className="flex items-center space-x-6">
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-6 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#2C2C2C] border border-gray-300 dark:border-white/20 rounded-lg hover:bg-gray-50 dark:hover:bg-[#3C3C3C] transition-all shadow-sm"
        >
          Today
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('PREV')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all"
          >
            <FaChevronLeft size={16} />
          </button>
          <button
            onClick={() => onNavigate('NEXT')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all"
          >
            <FaChevronRight size={16} />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight min-w-[200px]">
          {label}
        </h2>
      </div>
      <div className="flex bg-gray-100 dark:bg-[#2C2C2C] rounded-lg p-1">
        {['month', 'week', 'day', 'agenda'].map((viewName) => (
          <button
            key={viewName}
            onClick={() => onView(viewName)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
              view === viewName
                ? 'bg-white dark:bg-[#404040] text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            {viewName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarToolbar;
