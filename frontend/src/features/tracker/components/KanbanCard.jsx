import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const ActionDropdown = ({ lead, onAddOutbound, onDelete, onChangeStatus }) => {
  const [open, setOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const ref = useRef(null);
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClick = (e) => {
      if (
        ref.current &&
        !ref.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
        setStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left - 160,
      });
    }
  }, [open]);

  // Get available status transitions based on current status
  const getAvailableStatuses = () => {
    const currentStatus = lead.status;
    const KANBAN_STATUSES = [
      { name: 'Uncontacted', id: 3 },
      { name: 'Contacted', id: 4 },
      { name: 'Deal', id: 5 },
      { name: 'Reject', id: 6 },
    ];

    if (currentStatus === 'Uncontacted') {
      return [{ name: 'Contacted', id: 4 }];
    } else if (currentStatus === 'Contacted') {
      return [
        { name: 'Deal', id: 5 },
        { name: 'Reject', id: 6 },
      ];
    }
    // Deal and Reject are final statuses
    return [];
  };

  const availableStatuses = getAvailableStatuses();

  const dropdownContent = (
    <div
      ref={ref}
      className="fixed z-50 mt-2 bg-dark-card rounded-md shadow-lg w-56"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {availableStatuses.length > 0 && (
        <>
          <div className="relative">
            <button
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              className="flex items-center justify-between w-full px-4 py-2 text-sm text-left text-white hover:bg-dark-card hover:border hover:border-white/30"
            >
              <span>Change Status</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            {statusMenuOpen && (
              <div className="absolute left-full top-0 ml-1 bg-dark-card rounded-md shadow-lg w-40">
                {availableStatuses.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => {
                      setOpen(false);
                      setStatusMenuOpen(false);
                      onChangeStatus(lead.lead_campaign_id, status.id);
                    }}
                    className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-dark-card hover:border hover:border-white/30"
                  >
                    {status.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <hr className="border-gray-700" />
        </>
      )}

      <button
        onClick={() => {
          setOpen(false);
          onAddOutbound(lead);
        }}
        className="block w-full px-4 py-2 text-sm text-left text-white hover:bg-dark-card hover:border hover:border-white/30"
      >
        Add Outbound Detail
      </button>

      <hr className="border-gray-700" />

      <button
        onClick={() => {
          setOpen(false);
          onDelete(lead);
        }}
        className="block w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-red-500/10 hover:border-red-500/10 hover:border"
      >
        Remove from Tracking
      </button>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
          />
        </svg>
      </button>
      {open && createPortal(dropdownContent, document.body)}
    </>
  );
};

const getScoreColor = (score) => {
  const displayScore = score * 100;
  if (displayScore === 0) return 'text-white/60';
  if (displayScore >= 80) return 'text-[#66BB6A]';
  if (displayScore >= 50) return 'text-[#FFCA28]';
  if (displayScore < 50) return 'text-[#EF5350]';
  return 'text-white/60';
};

const KanbanCard = ({ lead, onAddOutbound, onDelete, onDragStart, onChangeStatus }) => {
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
      }
      else if (currentMouseY < scrollThreshold) {
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
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-[#242424] border border-white/10 rounded-lg p-3 cursor-move hover:border-white/30 hover:shadow-lg transition-all group"
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm truncate mb-0.5">{lead.lead_name}</h3>
          <p className="text-gray-400 text-xs">#{lead.lead_id}</p>
        </div>
        <ActionDropdown
          lead={lead}
          onAddOutbound={onAddOutbound}
          onDelete={onDelete}
          onChangeStatus={onChangeStatus}
        />
      </div>

      <div className="space-y-1 mt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Campaign:</span>
          <span className="text-white/80 truncate ml-2 max-w-[140px]">{lead.campaign_name}</span>
        </div>
        {lead.score !== null && lead.score !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Score:</span>
            <span className={`font-bold ${getScoreColor(lead.score)}`}>
              {(lead.score * 100).toFixed(0)}%
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Tracked by:</span>
          <span className="text-blue-400 font-medium truncate ml-2 max-w-[140px]">
            {lead.tracked_by_name || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
