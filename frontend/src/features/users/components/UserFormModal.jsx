import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import UserService from '../api/user-service';
import CampaignService from '../../campaigns/api/campaign-service';
import toast from 'react-hot-toast';

const UserFormModal = ({ isOpen, onClose, initialData, onSuccess }) => {
  const isEdit = !!initialData;

  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    user_email: '',
    password: '',
    is_active: true,
    campaign_ids: [],
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const result = await CampaignService.getOptions();
        setCampaigns(result);
      } catch (err) {
        console.error('Failed to load campaigns', err);
      }
    };

    if (isOpen) {
      fetchCampaigns();

      if (isEdit && initialData) {
        setFormData({
          full_name: initialData.full_name || '',
          user_email: initialData.user_email || '',
          is_active: initialData.is_active ?? true,
          password: '',
          campaign_ids: initialData.campaign_ids || [],
        });
      } else {
        setFormData({
          full_name: '',
          user_email: '',
          password: '',
          is_active: true,
          campaign_ids: [],
        });
      }
      setActiveTab('details');
      setError('');
    }
  }, [initialData, isEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleCampaignToggle = (campaignId) => {
    setFormData((prev) => {
      const currentIds = prev.campaign_ids;
      if (currentIds.includes(campaignId)) {
        return { ...prev, campaign_ids: currentIds.filter((id) => id !== campaignId) };
      } else {
        return { ...prev, campaign_ids: [...currentIds, campaignId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        const updateData = {
          full_name: formData.full_name,
          is_active: formData.is_active,
          campaign_ids: formData.campaign_ids,
        };
        if (formData.password) updateData.password = formData.password;

        await UserService.update(initialData.user_id, updateData);
        toast.success('Sales data updated successfully!');
      } else {
        if (!formData.password) throw new Error('Password is required for new user.');
        await UserService.create(formData);
        toast.success('New Sales added successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#1E1E1E] w-full max-w-xl rounded-2xl shadow-2xl p-8 text-white border border-white/10 relative overflow-hidden">
        <h2 className="mb-4 text-2xl font-bold tracking-wide">
          {isEdit ? 'Edit Sales' : 'Add New Sales'}
        </h2>
        <div className="mb-6 border-b border-white/10"></div>

        <div className="flex mb-6 border-b border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'details'
                ? 'border-b-2 border-brand text-brand'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Account Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'campaigns'
                ? 'border-b-2 border-brand text-brand'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Assign Campaign ({formData.campaign_ids.length})
          </button>
        </div>

        {error && (
          <div className="p-3 mb-6 text-sm text-red-200 border rounded-lg border-red-500/50 bg-red-900/20">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {activeTab === 'details' && (
            <>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Full Name*</label>
                <input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-[#2C2C2C] rounded-lg text-white focus:ring-1 focus:ring-brand outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Email*</label>
                <input
                  name="user_email"
                  type="email"
                  value={formData.user_email}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-[#2C2C2C] rounded-lg text-white focus:ring-1 focus:ring-brand outline-none disabled:opacity-50"
                  readOnly={isEdit}
                  disabled={isEdit}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">
                  {isEdit ? 'New Password (Optional)' : 'Password*'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEdit}
                  className="w-full p-2.5 bg-[#2C2C2C] rounded-lg text-white focus:ring-1 focus:ring-brand outline-none"
                />
              </div>

              <div className="flex items-center pt-2 space-x-3">
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="toggle"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="absolute block w-5 h-5 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox checked:right-0 checked:border-brand"
                    style={{
                      right: formData.is_active ? '0' : 'auto',
                      left: formData.is_active ? 'auto' : '0',
                    }}
                  />
                  <label
                    htmlFor="toggle"
                    className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${
                      formData.is_active ? 'bg-brand' : 'bg-gray-600'
                    }`}
                  ></label>
                </div>
                <span className="text-sm text-white">Active Account Status</span>
              </div>
            </>
          )}

          {activeTab === 'campaigns' && (
            <>
              <p className="text-sm text-gray-400">Select campaigns to be handled by this Sales:</p>

              <div className="space-y-2">
                {campaigns.length === 0 ? (
                  <p className="py-4 text-center text-gray-500">No active campaigns available.</p>
                ) : (
                  campaigns.map((campaign) => (
                    <label
                      key={campaign.campaign_id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.campaign_ids.includes(campaign.campaign_id)
                          ? 'bg-brand/20 border-brand'
                          : 'bg-[#2C2C2C] border-white/10 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.campaign_ids.includes(campaign.campaign_id)}
                          onChange={() => handleCampaignToggle(campaign.campaign_id)}
                          className="w-4 h-4 rounded accent-brand focus:ring-0"
                        />
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {campaign.campaign_name}
                          </p>
                          <p className="text-xs text-green-400">Active</p>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white transition bg-[#3A3A3A] rounded-lg hover:bg-[#4A4A4A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white transition rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default UserFormModal;
