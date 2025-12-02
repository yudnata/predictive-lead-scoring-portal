import React from 'react';
import { createPortal } from 'react-dom';

const CampaignDetailModal = ({ open, onClose, campaign }) => {
  if (!open || !campaign) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-[#242424] w-full max-w-lg rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Sales Assigned — {campaign.campaign_name}
        </h2>

        <ul className="space-y-2">
          {campaign.assigned_sales?.length > 0 ? (
            campaign.assigned_sales.map((s) => (
              <li
                key={s.user_id}
                className="p-3 bg-[#1A1A1A] rounded-lg text-white"
              >
                {s.full_name || s.user_email}
              </li>
            ))
          ) : (
            <p className="text-gray-400">Tidak ada sales yang diassign.</p>
          )}
        </ul>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg"
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
