import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const StatusDropdown = ({ onChange, anchorRef, onClose }) => {
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [anchorRef]);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, anchorRef]);

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-50 w-32 p-2 rounded-md shadow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <button
        onClick={() => onChange(true)}
        className="w-full px-3 py-2 text-sm text-left text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Active
      </button>
      <button
        onClick={() => onChange(false)}
        className="w-full px-3 py-2 text-sm text-left text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Inactive
      </button>
    </div>,
    document.body
  );
};

const StatusBadgeWithDropdown = ({
  isActive,
  userId,
  showDropdown,
  onToggle,
  onUpdate,
  onClose,
}) => {
  const buttonRef = useRef(null);

  const getStatusBadge = (active) => {
    const base = 'px-3 py-1 text-xs font-semibold rounded-full';
    if (active) return `${base} bg-[#66BB6A]/10 text-[#66BB6A]`;
    return `${base} bg-[#EF5350]/10 text-[#EF5350]`;
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => onToggle(userId)}
        className={getStatusBadge(isActive)}
      >
        {isActive ? 'Active' : 'Inactive'}
      </button>

      {showDropdown && (
        <StatusDropdown
          anchorRef={buttonRef}
          onChange={onUpdate}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default StatusBadgeWithDropdown;
