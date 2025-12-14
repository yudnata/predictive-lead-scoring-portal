import { useState } from 'react';
import { createPortal } from 'react-dom';

const HistoryBadge = ({ history }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  if (!history || history.length === 0) {
    return <span className="text-gray-400 dark:text-gray-500">-</span>;
  }

  const deals = history.filter((h) => h.status === 'Deal');
  const rejects = history.filter((h) => h.status === 'Reject');
  const hasDeal = deals.length > 0;
  const hasReject = rejects.length > 0;

  let badgeText = '';
  let badgeClass = '';

  if (hasDeal && hasReject) {
    badgeText = 'Deal & Reject';
    badgeClass = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  } else if (hasDeal) {
    badgeText = 'Deal';
    badgeClass = 'bg-green-500/10 text-green-400 border-green-500/20';
  } else if (hasReject) {
    badgeText = 'Rejected';
    badgeClass = 'bg-red-500/10 text-red-400 border-red-500/20';
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const tooltipContent = (
    <div
      className="fixed z-50 w-64 bg-white dark:bg-dark-card rounded-lg shadow-2xl pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white border-b pb-3 border-gray-200 dark:border-white/10 text-center">
          Outcome History
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {history.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs">
              <span className={item.status === 'Deal' ? 'text-green-500' : 'text-red-500'}>
                {item.status === 'Deal' ? '✓' : '✗'}
              </span>
              <div className="flex-1">
                <span className="text-gray-800 dark:text-gray-200">{item.status}</span>
                <span className="text-gray-500 dark:text-gray-400"> in </span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{item.campaign_name}</span>
                <span className="text-gray-400 dark:text-gray-500 ml-1">({formatDate(item.changed_at)})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative inline-block">
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${badgeClass} cursor-pointer`}>
          {badgeText}
        </span>
      </div>
      {isVisible && createPortal(tooltipContent, document.body)}
    </div>
  );
};

export default HistoryBadge;
