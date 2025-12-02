import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import CampaignService from '../../campaigns/api/campaign-service';
import LeadService from '../api/lead-service';

const AddToCampaignModal = ({ open, onClose, lead, user, onAdded }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      try {
        const res = await CampaignService.getAssignedForUser(user.user_id);
        setCampaigns(res.data || []);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
        setCampaigns([]);
      }
    };
    fetch();
  }, [open, user.user_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return alert('Please select a campaign first.');
    setLoading(true);
    try {
      await LeadService.addToCampaign(lead.lead_id, selected, user.user_id);
      onAdded && onAdded();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to add lead to campaign.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md p-6 bg-[#1f1f1f] rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-3">Add Lead to Campaign</h2>
        <p className="text-sm text-gray-300 mb-4">
          {lead.lead_name} • #{lead.lead_id}
        </p>
        <form onSubmit={handleSubmit}>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-[#242424] text-white border border-white/20"
          >
            <option value="">-- Select Campaign --</option>
            {campaigns.map((c) => (
              <option
                key={c.campaign_id}
                value={c.campaign_id}
              >
                {c.campaign_name}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-600 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || campaigns.length === 0}
              className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-60"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddToCampaignModal;
