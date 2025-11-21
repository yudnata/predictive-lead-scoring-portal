import React, { useState, useEffect } from 'react';
import UserService from '../api/user-service';
import CampaignService from '../../campaigns/api/campaign-service';
import toast from 'react-hot-toast';

const UserFormModal = ({ isOpen, onClose, initialData, onSuccess }) => {
  const isEdit = !!initialData;
  
  // State UI
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'campaigns'
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState('');

  // State Form
  const [formData, setFormData] = useState({
    full_name: '',
    user_email: '',
    password: '',
    is_active: true,
    campaign_ids: [], // Stores selected campaign IDs
  });

  // Fetch Campaigns & Init Data
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // Mengambil semua campaign (limit besar untuk dropdown/list)
        const result = await CampaignService.getAll(1, 100); 
        setCampaigns(result.data);
      } catch (err) {
        console.error("Gagal memuat campaign", err);
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
          // Backend harus mengirim campaign_ids saat getById
          campaign_ids: initialData.campaign_ids || [], 
        });
      } else {
        setFormData({ 
          full_name: '', 
          user_email: '', 
          password: '', 
          is_active: true, 
          campaign_ids: [] 
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
        return { ...prev, campaign_ids: currentIds.filter(id => id !== campaignId) };
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
        toast.success('Data Sales berhasil diupdate!');
      } else {
        if (!formData.password) throw new Error('Password harus diisi untuk user baru.');
        await UserService.create(formData);
        toast.success('Sales baru berhasil ditambahkan!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#242424] w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <h2 className="text-xl font-bold text-white">
            {isEdit ? 'Edit Sales' : 'Add New Sales'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'details' 
                ? 'bg-[#2C2C2C] text-brand border-b-2 border-brand' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Informasi Akun
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'campaigns' 
                ? 'bg-[#2C2C2C] text-brand border-b-2 border-brand' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Assign Campaign ({formData.campaign_ids.length})
          </button>
        </div>

        {error && (
          <div className="p-3 mx-6 mt-4 text-sm text-red-300 border border-red-800 rounded bg-red-900/30 shrink-0">
            {error}
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar grow">
          <form id="userForm" onSubmit={handleSubmit}>
            
            {/* TAB 1: User Details */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">Nama Lengkap*</label>
                  <input 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleChange} 
                    required
                    className="w-full p-2.5 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:border-brand focus:outline-none"
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
                    className="w-full p-2.5 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:border-brand focus:outline-none disabled:opacity-50"
                    readOnly={isEdit} 
                    disabled={isEdit}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">
                      {isEdit ? 'Password Baru (Opsional)' : 'Password*'}
                  </label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required={!isEdit}
                    className="w-full p-2.5 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:border-brand focus:outline-none"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center pt-2 space-x-3">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input 
                          type="checkbox" 
                          name="is_active" 
                          id="toggle" 
                          checked={formData.is_active}
                          onChange={handleChange}
                          className="absolute block w-5 h-5 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox checked:right-0 checked:border-brand"
                          style={{ right: formData.is_active ? '0' : 'auto', left: formData.is_active ? 'auto' : '0' }}
                      />
                      <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${formData.is_active ? 'bg-brand' : 'bg-gray-600'}`}></label>
                  </div>
                  <span className="text-sm text-white">Status Akun Aktif</span>
                </div>
              </div>
            )}

            {/* TAB 2: Campaign Assignment */}
            {activeTab === 'campaigns' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Pilih campaign yang akan ditangani oleh Sales ini:</p>
                
                <div className="space-y-2">
                  {campaigns.length === 0 ? (
                    <p className="py-4 text-center text-gray-500">Tidak ada campaign aktif tersedia.</p>
                  ) : (
                    campaigns.map((campaign) => (
                      <label 
                        key={campaign.campaign_id} 
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.campaign_ids.includes(campaign.campaign_id)
                            ? 'bg-brand/20 border-brand'
                            : 'bg-[#1A1A1A] border-gray-700 hover:border-gray-500'
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
                            <p className="text-sm font-semibold text-white">{campaign.campaign_name}</p>
                            <p className="text-xs text-gray-400">
                              {campaign.campaign_is_active ? 'Aktif' : 'Non-Aktif'}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end p-6 border-t border-gray-700 gap-3 shrink-0 bg-[#242424]">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={loading} 
            className="px-5 py-2 text-sm font-semibold text-white transition bg-gray-600 rounded-lg hover:bg-gray-500"
          >
            Batal
          </button>
          <button 
            type="submit" 
            form="userForm"
            disabled={loading} 
            className="px-5 py-2 text-sm font-semibold text-white transition rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;