import { useNavigate } from 'react-router-dom';

const RankedListCard = ({ title, items, isScore = false }) => {
  const navigate = useNavigate();

  const getScoreColor = (val) => {
    const num = parseFloat(val.toString().replace('%', ''));

    if (num >= 80) return 'text-[#4ade80]';
    if (num >= 50) return 'text-[#facc15]';
    if (num > 0) return 'text-[#f87171]';
    return 'text-white';
  };

  const handleViewAll = () => {
    const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

    if (userRole) {
      navigate(`/${userRole}/leads`);
    } else {
      console.error('User role not found');
    }
  };

  return (
    <div className="flex flex-col h-full p-5 rounded-lg shadow-lg bg-dark-card">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {isScore && (
          <button
            onClick={handleViewAll}
            className="px-2 py-1 text-xs text-white transition rounded bg-white/10 hover:bg-white/20"
          >
            View All
          </button>
        )}
      </div>

      <ul className="flex-grow space-y-4">
        {!items || items.length === 0 ? (
          <li className="text-sm text-center text-white/50">Belum ada data</li>
        ) : (
          items.map((item, index) => {
            let displayValue = item.rate;
            if (isScore) {
              displayValue = `${item.score}%`;
            }

            return (
              <li
                key={index}
                className="flex items-center justify-between text-sm group"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-5 font-bold text-gray-500 transition-colors group-hover:text-white">
                    {index + 1}.
                  </span>
                  <span
                    className="text-gray-200 truncate max-w-[150px]"
                    title={item.lead_name || item.name}
                  >
                    {item.lead_name || item.name}
                  </span>
                </div>

                <span
                  className={`font-bold ${
                    isScore ? getScoreColor(displayValue) : 'text-orange-400'
                  }`}
                >
                  {displayValue}
                </span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default RankedListCard;
