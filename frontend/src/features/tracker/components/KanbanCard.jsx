import React from 'react';
import { getScoreColor } from '../../../utils/formatters';

const KanbanCard = ({ lead, onDragStart, onClick }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('leadId', lead.lead_campaign_id);
    onDragStart?.(lead);

    let scrollInterval = null;
    let currentMouseY = 0;

    const autoScroll = () => {
      const scrollThreshold = 100;
      const scrollSpeed = 15;
      const viewportHeight = window.innerHeight;

      if (currentMouseY > viewportHeight - scrollThreshold) {
        window.scrollBy(0, scrollSpeed);
        scrollInterval = requestAnimationFrame(autoScroll);
      } else if (currentMouseY < scrollThreshold) {
        window.scrollBy(0, -scrollSpeed);
        scrollInterval = requestAnimationFrame(autoScroll);
      } else {
        if (scrollInterval) {
          cancelAnimationFrame(scrollInterval);
          scrollInterval = null;
        }
      }
    };

    const onDrag = (e) => {
      if (e.clientY > 0) {
        currentMouseY = e.clientY;
        if (!scrollInterval) {
          autoScroll();
        }
      }
    };

    const onDragEnd = () => {
      if (scrollInterval) {
        cancelAnimationFrame(scrollInterval);
      }
      document.removeEventListener('drag', onDrag);
      document.removeEventListener('dragend', onDragEnd);
    };

    document.addEventListener('drag', onDrag);
    document.addEventListener('dragend', onDragEnd);
    document.body.classList.add('cursor-grabbing-force');
  };

  const onDragEndCleanup = () => {
    document.body.classList.remove('cursor-grabbing-force');
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEndCleanup}
      onClick={() => onClick?.(lead)}
      className="bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-transparent rounded-xl p-3 cursor-pointer select-none active:cursor-grabbing hover:bg-gray-50 dark:hover:bg-[#383838] hover:border-gray-300 dark:hover:border-white/30 hover:shadow-lg transition-all group"
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex-1">
          <h3 className="text-gray-900 dark:text-white font-semibold text-sm truncate mb-0.5">{lead.lead_name}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs">#{lead.lead_id}</p>
        </div>
      </div>

      <div className="space-y-1 mt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">Campaign:</span>
          <span className="text-gray-700 dark:text-white/80 truncate ml-2 max-w-[140px]">{lead.campaign_name}</span>
        </div>
        {lead.score !== null && lead.score !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Score:</span>
            <span className={`font-bold ${getScoreColor(lead.score)}`}>
              {isNaN(lead.score) ? '0' : (lead.score * 100).toFixed(0)}%
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">Tracked by:</span>
          <span className="text-blue-400 font-medium truncate ml-2 max-w-[140px]">
            {lead.tracked_by_name || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
