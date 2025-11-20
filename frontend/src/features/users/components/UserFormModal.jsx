import React, { useState, useEffect } from 'react';
import UserService from '../api/user-service';

const UserFormModal = ({ isOpen, onClose, initialData, onSuccess }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    full_name: '',
    user_email: '',
    password: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        full_name: initialData.full_name || '',
        user_email: initialData.user_email || '',
        is_active: initialData.is_active || false,
        password: '', 
      });
    } else {
      setFormData({ full_name: '', user_email: '', password: '', is_active: true });
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

    try {
      if (isEdit) {
        const updateData = {
          full_name: formData.full_name,
          is_active: formData.is_active,
        };
        if (formData.password) {
             updateData.password = formData.password;
        }

        await UserService.update(initialData.user_id, updateData);
        alert('Data Sales berhasil diupdate!');

      } else {
        if (!formData.password) {
            throw new Error('Password harus diisi untuk user baru.');
        }
        await UserService.create(formData);
        alert('Sales baru berhasil ditambahkan!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan data Sales.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#242424] p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <div className="flex items-start justify-between pb-3 mb-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Sales' : 'Add Sales'}</h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">X</button>
        </div>

        {error && <div className="p-3 mb-4 text-red-400 rounded-md bg-red-900/40">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-semibold text-white">Nama Lengkap*</label>
            <input name="full_name" value={formData.full_name} onChange={handleChange} required
              className="w-full p-2 bg-[#1A1A1A] rounded text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-white">Email*</label>
            <input name="user_email" value={formData.user_email} onChange={handleChange} required
              className="w-full p-2 bg-[#1A1A1A] rounded text-white"
              readOnly={isEdit} 
              disabled={isEdit}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white">
                {isEdit ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password*'}
            </label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} 
              required={!isEdit}
              className="w-full p-2 bg-[#1A1A1A] rounded text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange}
              className="accent-green-600"
            />
            <label className="text-sm text-white">Aktif</label>
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-bold bg-red-600 rounded">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-bold bg-green-600 rounded disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;