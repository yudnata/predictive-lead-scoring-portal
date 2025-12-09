import React from 'react';
import { createPortal } from 'react-dom';

const CampaignDetailModal = ({ open, onClose, campaign }) => {
  if (!open || !campaign) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-[#242424] w-full max-w-lg rounded-xl p-6 transition-colors">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Detail — {campaign.campaign_name}</h2>

        <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            <p>
            <strong>Description:</strong> {campaign.campaign_desc || '-'}
          </p>
          <p>
            <strong>Duration:</strong> {new Date(campaign.campaign_start_date).toLocaleDateString()}{' '}
            - {new Date(campaign.campaign_end_date).toLocaleDateString()}
          </p>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Assigned Sales</h3>

        <ul className="space-y-2">
          {campaign.assigned_sales?.length > 0 ? (
            campaign.assigned_sales.map((s) => (
              <li
                key={s.user_id}
                className="p-3 bg-gray-100 dark:bg-[#1A1A1A] rounded-lg text-gray-800 dark:text-white"
              >
                {s.full_name || s.user_email}
              </li>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Tidak ada sales yang diassign.</p>
          )}
        </ul>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CampaignDetailModal;
