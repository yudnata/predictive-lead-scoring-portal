// src/components/LeadFormModal.jsx

import React, { useState, useEffect } from 'react';
import LeadService from '../services/LeadService';

const LeadFormModal = ({ isOpen, onClose, initialData, onSuccess }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && initialData) {
      const leadData = {
        lead_name: initialData.lead_name || '',
        lead_phone_number: initialData.lead_phone_number || '',
        lead_email: initialData.lead_email || '',
        lead_age: initialData.lead_age || '',
        job_id: initialData.job_id || '',
        marital_id: initialData.marital_id || '',
        education_id: initialData.education_id || '',
            
        lead_balance: initialData.lead_balance || 0,
        lead_housing_loan: initialData.lead_housing_loan || false,
        lead_loan: initialData.lead_loan || false,
      };
      setFormData(leadData);
    } else {
      setFormData({
        lead_name: '', lead_phone_number: '', lead_email: '', lead_age: '',
        job_id: '', marital_id: '', education_id: '',
        lead_balance: 0, lead_housing_loan: false, lead_loan: false,
      });
    }
    setError(''); 
  }, [initialData, isEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const leadData = {
      lead_name: formData.lead_name,
      lead_phone_number: formData.lead_phone_number,
      lead_email: formData.lead_email,
      lead_age: formData.lead_age ? parseInt(formData.lead_age) : null,
      job_id: formData.job_id ? parseInt(formData.job_id) : null,
      marital_id: formData.marital_id ? parseInt(formData.marital_id) : null,
      education_id: formData.education_id ? parseInt(formData.education_id) : null,
    };

    const detailData = {
      lead_balance: formData.lead_balance ? parseFloat(formData.lead_balance) : 0,
      lead_housing_loan: formData.lead_housing_loan,
      lead_loan: formData.lead_loan,
    };

    try {
      if (isEdit) {
        await LeadService.update(initialData.lead_id, leadData, detailData);
        alert('Lead berhasil diupdate!');
      } else {
        await LeadService.create(leadData, detailData);
        alert('Lead berhasil ditambahkan!');
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
  
  // Dropdown Placeholder 
  const jobOptions = [{ id: 1, name: 'Mahasiswa' }, { id: 2, name: 'Karyawan' }];
  const maritalOptions = [{ id: 1, status: 'Single' }, { id: 2, status: 'Menikah' }];
  const educationOptions = [{ id: 1, level: 'SMA' }, { id: 2, level: 'S1' }];


  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center">
        <div className="bg-[#1E1E1E] w-full max-w-2xl rounded-2xl shadow-xl p-8 text-white">

            {/* Header */}
            <h2 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
            <div className="border-b border-gray-700 mb-6"></div>

            {error && <div className="bg-red-900/40 p-3 mb-4 rounded text-red-300">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-400">Informasi Dasar</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input name="lead_name" value={formData.lead_name} onChange={handleChange} placeholder="Nama Lengkap*" required className="p-2 bg-[#2C2C2C] rounded" />
                    <input name="lead_email" value={formData.lead_email} onChange={handleChange} type="email" placeholder="Email*" required className="p-2 bg-[#2C2C2C] rounded" />
                    <input name="lead_phone_number" value={formData.lead_phone_number} onChange={handleChange} placeholder="Nomor HP" className="p-2 bg-[#2C2C2C] rounded" />
                    <input name="lead_age" value={formData.lead_age} onChange={handleChange} type="number" placeholder="Usia" className="p-2 bg-[#2C2C2C] rounded" />
                </div>
                
                <h3 className="text-lg font-semibold text-orange-400 pt-4">Data Demografi</h3>
                <div className="grid grid-cols-3 gap-4">
                    <select name="job_id" value={formData.job_id} onChange={handleChange} className="p-2 bg-[#2C2C2C] rounded">
                        <option value="">-- Pekerjaan --</option>
                        {jobOptions.map(job => (<option key={job.id} value={job.id}>{job.name}</option>))}
                    </select>
                    <select name="marital_id" value={formData.marital_id} onChange={handleChange} className="p-2 bg-[#2C2C2C] rounded">
                        <option value="">-- Status Pernikahan --</option>
                        {maritalOptions.map(m => (<option key={m.id} value={m.id}>{m.status}</option>))}
                    </select>
                    <select name="education_id" value={formData.education_id} onChange={handleChange} className="p-2 bg-[#2C2C2C] rounded">
                        <option value="">-- Pendidikan --</option>
                        {educationOptions.map(e => (<option key={e.id} value={e.id}>{e.level}</option>))}
                    </select>
                </div>
                
                <h3 className="text-lg font-semibold text-orange-400 pt-4">Data Finansial</h3>
                <div className="space-y-3">
                    <input name="lead_balance" value={formData.lead_balance} onChange={handleChange} type="number" placeholder="Saldo (Balance)" className="p-2 w-full bg-[#2C2C2C] rounded" />
                    
                    <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" name="lead_housing_loan" checked={formData.lead_housing_loan} onChange={handleChange} className="accent-orange-500" />
                            <span className="text-sm">Punya Pinjaman Rumah (Housing Loan)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" name="lead_loan" checked={formData.lead_loan} onChange={handleChange} className="accent-orange-500" />
                            <span className="text-sm">Punya Pinjaman Lain (Personal Loan)</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                    <button type="button" onClick={onClose} className="px-6 py-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition">Batal</button>
                    <button type="submit" disabled={loading} className="px-6 py-2 rounded-full bg-orange-600 text-white font-semibold hover:bg-orange-700 transition disabled:opacity-50">
                        {loading ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Add Lead')}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default LeadFormModal;