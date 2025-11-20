import React, { useState, useEffect } from 'react';
import CampaignService from '../services/CampaignService';

const CampaignFormModal = ({ isOpen, onClose, initialData, onSuccess }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    campaign_name: '',
    campaign_start_date: '',
    campaign_end_date: '',
    campaign_desc: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        campaign_name: initialData.campaign_name || '',
        campaign_start_date: initialData.campaign_start_date || '',
        campaign_end_date: initialData.campaign_end_date || '',
        campaign_desc: initialData.campaign_desc || '',
      });
    } else {
      setFormData({ campaign_name: '', campaign_start_date: '', campaign_end_date: '', campaign_desc: '' });
    }
    setError(''); 
  }, [initialData, isEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await CampaignService.update(initialData.campaign_id, formData);
        alert('Campaign berhasil diupdate!');
      } else {
        await CampaignService.create(formData);
        alert('Campaign berhasil ditambahkan!');
      }
      onSuccess();
      onClose();
    } catch (error) { 
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center">
  <div className="bg-[#1E1E1E] w-full max-w-lg rounded-2xl shadow-xl p-8">

    
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <img 
            src="/campaign.png" 
            alt="" 
            className="h-8 w-auto mr-2"
        />

        <h2 className="text-xl font-bold text-white tracking-wide">
          {isEdit ? 'Edit Campaign' : 'Add Campaign'}
        </h2>
      </div>

      <button onClick={onClose} className="text-red-500 hover:text-red-600">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div className="border-b border-gray-600/50 mb-6"></div>

    <p className="text-gray-300 text-sm mb-5 leading-relaxed">
      Silahkan isi formulir di bawah untuk {isEdit ? 'mengubah' : 'menambah'} satu Campaign baru.
    </p>

    {/* Form */}
    <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <label className="block text-white text-sm font-medium mb-1">
          Nama Campaign*
        </label>
        <input
          name="campaign_name"
          value={formData.campaign_name}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-[#2C2C2C] text-white border border-gray-700 focus:border-[#F28500] outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm font-medium mb-1">
            Campaign Start Date*
          </label>
          <input
            type="date"
            name="campaign_start_date"
            value={formData.campaign_start_date}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[#2C2C2C] text-white border border-gray-700 focus:border-[#F28500] outline-none"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-1">
            Campaign End Date*
          </label>
          <input
            type="date"
            name="campaign_end_date"
            value={formData.campaign_end_date}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[#2C2C2C] text-white border border-gray-700 focus:border-[#F28500] outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-1">
          Deskripsi*
        </label>
        <textarea
          name="campaign_desc"
          rows="3"
          value={formData.campaign_desc}
          onChange={handleChange}
          placeholder="Deskripsi"
          className="w-full p-3 rounded-lg bg-[#2C2C2C] text-white border border-gray-700 focus:border-[#F28500] outline-none"
        ></textarea>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">

        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-full bg-[#D9534F] text-white font-semibold hover:bg-[#C64541] transition"
        >
          Batal
        </button>

        <button
          type="submit"
          className="px-6 py-2 rounded-full bg-[#28A745] text-white font-semibold hover:bg-[#218838] transition"
        >
          {isEdit ? 'Simpan Perubahan' : 'Add Campaign'}
        </button>
      </div>
    </form>

  </div>
</div>
  );
};

export default CampaignFormModal;